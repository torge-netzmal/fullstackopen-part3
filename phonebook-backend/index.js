require('dotenv').config({override: true})

const express = require('express')
const morgan = require('morgan')

const Person = require('./models/person')

const app = express()

app.use(express.static('dist'))

app.use(express.json())

app.use(morgan(function (tokens, req, res) {
    const log = [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms'
    ];
    if (req.method === 'POST') {
        log.push(JSON.stringify(req.body));
    }
    return log.join(' ')
}))


app.get('/info', (request, response) => {
    const date = new Date();
    Person.find({}).then(persons => {
        response.send(`<p>
        Phonebook has info for ${persons.length} people <br>
        ${date.toString()}
        </p>`)
    }).catch(error => next(error))

})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    }).catch(error => next(error))
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    Person.findById(request.params.id).then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    }).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const {name, number} = request.body

    Person.findById(request.params.id)
        .then(person => {
            if (!person) {
                return response.status(404).end()
            }

            person.name = name
            person.number = number

            return person.save().then((updatedPerson) => {
                response.json(updatedPerson)
            })
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    }

    if (!body.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    }

    Person.find({name: body.name}).then(result => {
        console.log("Find Person before save ", JSON.stringify(result))
        if (result === []) {
            console.log(result)
            return response.status(409).json({
                error: 'name must be unique'
            })
        } else {
            const person = new Person(
                {
                    name: body.name,
                    number: body.number || false,
                })

            person.save().then(savedPerson => {
                response.json(savedPerson)
            }).catch(error => next(error))
        }
    }).catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({error: 'malformatted id'})
    }

    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})