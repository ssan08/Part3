require('dotenv').config()
const express = require('express')
var morgan = require('morgan')

morgan.token('person', function getperson (req, res) {
  return JSON.stringify(req.body)
})

const app = express()
const Person = require('./models/person')
const cors = require('cors')

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :person'))
const persons = [
  {
    name: 'Arto Hellas',
    number: '040-123456',
    id: 1
  },
  {
    name: 'Ada Lovelace',
    number: '39-44-5323523',
    id: 2
  },
  {
    name: 'Dan Abramov',
    number: '12-43-234345',
    id: 3
  },
  {
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
    id: 4
  }
]

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons.map(person => person.toJSON()))
  })
})

app.get('/info', (req, res) => {
  Person.count({}, function(err, count){
    const info = `Phonebook has info for ${count} people
  `
  // const info1 = info.concat()
  const info2 = info.concat(new Date())
  res.json(info2)
});
  
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person.toJSON())
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  if (!body) {
    return response.status(400).json({
      error: 'content missing'
    })
  } else if (!body.name) {
    return response.status(400).json({
      error: 'name is missing'
    })
  } else if (!body.number) {
    return response.status(400).json({
      error: 'number is missing'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => {
    response.json(savedPerson.toJSON())
  })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const id = Number(request.params.id)
  const body = request.body
  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, {number: body.number}, { runValidators: true, new: true })
    .then(updatedPerson => {
      response.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind == 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

app.use(errorHandler)

const port = process.env.PORT
app.listen(port)
console.log(`Server running on port ${port}`)
