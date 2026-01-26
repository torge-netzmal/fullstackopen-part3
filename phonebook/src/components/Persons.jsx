const Persons = ({persons, removePerson}) => {
    return (
        <div>
            {persons.map(person => <Person key={person.name} person={person}
                                           removePerson={() => removePerson(person.id)}/>)}
        </div>
    )
}

const Person = ({person, removePerson}) => {
    return (
        <p>
            {person.name} {person.number}
            <button onClick={removePerson}>delete</button>
        </p>
    )
}
export default Persons