const mongoose = require('mongoose')
const password = process.argv[2]
const url =
  `mongodb+srv://sangita:${password}@cluster0-88zj5.mongodb.net/person-app?retryWrites=true`
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})
const Person = mongoose.model('Person', personSchema)
if (process.argv.length == 5) {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4]
  })

  person.save().then(response => {
    console.log('added', process.argv[3], process.argv[4], 'to phonebook')
    mongoose.connection.close()
  })
} else if (process.argv.length == 3) {
  console.log('phonebook:')
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(person.name, person.number)
    })
    mongoose.connection.close()
  })
} else {
  process.exit(1)
}
