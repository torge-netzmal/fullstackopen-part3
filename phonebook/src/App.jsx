import {useEffect, useState} from 'react'
import Persons from './components/Persons.jsx'
import PersonForm from "./components/PersonForm.jsx";
import Filter from "./components/Filter.jsx";
import Notification from './components/Notification'
import personsService from "./services/persons"

const App = () => {
    const [persons, setPersons] = useState([]);
    const [newName, setNewName] = useState('')
    const [newNumber, setNewNumber] = useState('')
    const [newFilter, setNewFilter] = useState('')
    const [successMessage, setSuccessMessage] = useState(null)
    const [errorMessage, setErrorMessage] = useState(null)

    useEffect(() => {
        console.log('effect')
        personsService
            .getAll()
            .then(initialPersons => {
                setPersons(initialPersons)
            })
    }, [])

    const addPerson = (event) => {
        event.preventDefault()
        const personObject = {
            name: newName,
            number: newNumber,
        }

        const existingPerson = persons.find(person => person.name === newName)

        if (existingPerson !== undefined) {
            if (window.confirm(`${personObject.name} is already added to the phonebook, replace the old number with a new one?`)) {
                personsService
                    .update(existingPerson.id, personObject)
                    .then((returnedPerson) => {
                        setPersons(persons.map((person) => person.id === returnedPerson.id ? returnedPerson : person))
                        setSuccessMessage(
                            `Changed number of ${personObject.name}`
                        )
                        setTimeout(() => {
                            setSuccessMessage(null)
                        }, 5000)
                    })
                    .catch(() => {
                        setErrorMessage(
                            `Information of ${existingPerson.name} has already been removed from server`
                        )
                        setPersons(persons.filter(person => person.id !== existingPerson.id))
                        setTimeout(() => {
                            setErrorMessage(null)
                        }, 5000)
                    })
            }
        } else {
            personsService
                .create(personObject)
                .then(returnedPerson => {
                    setPersons(persons.concat(returnedPerson))
                    setSuccessMessage(
                        `Added ${personObject.name}`
                    )
                    setTimeout(() => {
                        setSuccessMessage(null)
                    }, 5000)
                })
        }

        setNewName('')
        setNewNumber('')
    }

    const removePerson = (id) => {
        const targetPerson = persons.find(person => person.id === id)
        if (window.confirm(`Delete ${targetPerson.name}?`)) {
            personsService.remove(id)
                .then(() => {
                        setPersons(persons.filter(person => person.id !== id))
                    }
                )
                .catch(() => {
                        setErrorMessage(
                            `Information of ${targetPerson.name} has already been removed from server`
                        )
                        setPersons(persons.filter(person => person.id !== targetPerson.id))
                        setTimeout(() => {
                            setErrorMessage(null)
                        }, 5000)
                    }
                )
        }

    }

    const handleNameChange = (event) => {
        console.log(event.target.value)
        setNewName(event.target.value)
    }

    const handleNumberChange = (event) => {
        console.log(event.target.value)
        setNewNumber(event.target.value)
    }

    const handleFilterChange = (event) => {
        console.log(event.target.value)
        setNewFilter(event.target.value)
    }

    const filteredPersons = persons.filter(person => person.name.includes(newFilter))

    return (
        <div>
            <h2>Phonebook</h2>
            <Notification message={errorMessage} notificationType='error'/>
            <Notification message={successMessage} notificationType='success'/>

            <Filter
                handleFilterChange={handleFilterChange}
                newFilter={newFilter}
            />

            <h2>add a new</h2>
            <PersonForm
                addPerson={addPerson}
                handleNameChange={handleNameChange}
                handleNumberChange={handleNumberChange}
                newName={newName}
                newNumber={newNumber}
            />

            <h2>Numbers</h2>
            <Persons persons={filteredPersons} removePerson={removePerson}/>
        </div>
    )
}

export default App