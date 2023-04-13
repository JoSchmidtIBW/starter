const fs = require('fs')
const express = require('express')

// import express from 'express'
// import fs from 'fs'
// import __dirname from '__dirname'

let u = "jnidd"


const app = express()


//middleware
app.use(express.json()) //für post (daten von client zu bekommen), muss json sein



// app.get('/', (req, res) => {
//     //res.status(200).send('Hello from the server- site!')
//     res.status(200).json({ message: 'Hello from the server- site!', app: 'Natours' })
// })


// app.post('/', (req, res) => {
//     res.send("you can post to this url")
// })

//erst daten lesen dann verwenden top level code
const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`))


app.get('/api/v1/tours', (req, res) => {
    res.status(200).json({
        status: 'sucsess',
        results: tours.length,
        data: tours //{ tours: tours }
    })
})

//app.get('/api/v1/tours/:id/:x?', (req, res) => {
app.get('/api/v1/tours/:id', (req, res) => {
    console.log("req.params: " + JSON.stringify(req.params))

    const id = req.params.id * 1; // macht eine nummer von der url id    
    const tour = tours.find(el => el.id === id)

    //if (id > tours.length) {
    if (!tour || id > tours.length) {
        res.status(404).json({ status: 'fail', message: 'Invalid ID' })
    } else {

    }

    res.status(200).json({
        status: 'sucsess',
        //results: tours.length,
        data: tour //{ tours: tours }
    })
})

// in postman müssen daten gesendet werden
app.post('/api/v1/tours', (req, res) => {
    //console.log("req.body: " + JSON.stringify(req.body))

    //nehme letzte id in database und füge zum neuen objekt eine id hinzu
    const newId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({ id: newId }, req.body)

    tours.push(newTour)
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
            res.status(201).json({
                    status: 'succsess',
                    tour: newTour
                }) //201 = createt
        }) //nicht writefilesync, weil in iventloup drin


    // res.send("done")
})


app.patch('/api/v1/tours/:id', (req, res) => {
    if (req.params.id * 1 > tours.length) {
        res.status(404).json({ status: 'fail', message: 'Invalid ID' })
    }

    res.status(200).json({
        status: 'sucsess',
        results: tours.length,
        data: {
            tours: 'updated tours here...' //{ tours: tours }
        }
    })
})


app.delete('/api/v1/tours/:id', (req, res) => {
    if (req.params.id * 1 > tours.length) {
        res.status(404).json({ status: 'fail', message: 'Invalid ID' })
    }

    res.status(204).json({ //204 no content == null == delete
        status: 'sucsess',
        data: null
    })
})

const PORT = 4301

app.listen(PORT, () => {
    console.log(`App running on port ${PORT}...`)
    console.log(`Server running on port: http://localhost:${PORT}...`);
    console.log(`Server running on port: http://127.0.0.1:${PORT}...`);
})