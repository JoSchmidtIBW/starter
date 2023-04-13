const fs = require('fs')
const express = require('express')
const morgan = require('morgan')

// import express from 'express'
// import fs from 'fs'
// import __dirname from '__dirname'

let u = "jnidd"


const app = express()


// 1. middleware
app.use(morgan('dev'))
app.use(express.json()) //für post (daten von client zu bekommen), muss json sein

app.use((req, res, next) => {
    console.log("Hello from the Mittdleware :)")
    next()
})

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString()
    next()
})



//erst daten lesen dann verwenden top level code
const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`))


// 2. route handlers
const getAllTours = (req, res) => {
    console.log(req.requestTime)
    res.status(200).json({
        status: 'sucsess',
        requestedAt: req.requestTime,
        results: tours.length,
        data: tours //{ tours: tours }
    })
}

const getTour = (req, res) => {
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
}

const createTour = (req, res) => {
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
}


const updateTour = (req, res) => {
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
}

const deleteTour = (req, res) => {
    if (req.params.id * 1 > tours.length) {
        res.status(404).json({ status: 'fail', message: 'Invalid ID' })
    }

    res.status(204).json({ //204 no content == null == delete
        status: 'sucsess',
        data: null
    })
}


const getAllUsers = (req, res) => {
    res.status(500).json({
            status: 'error',
            message: 'this route is not defined'
        }) // server error not implement
}

const getUser = (req, res) => {
    res.status(500).json({
            status: 'error',
            message: 'this route is not defined'
        }) // server error not implement
}

const createUser = (req, res) => {
    res.status(500).json({
            status: 'error',
            message: 'this route is not defined'
        }) // server error not implement
}

const updateUser = (req, res) => {
    res.status(500).json({
            status: 'error',
            message: 'this route is not defined'
        }) // server error not implement
}

const deleteUser = (req, res) => {
    res.status(500).json({
            status: 'error',
            message: 'this route is not defined'
        }) // server error not implement
}

//app.get('/api/v1/tours/:id/:x?', (req, res) => {
//app.get('/api/v1/tours', getAllTours)
//app.get('/api/v1/tours/:id', getTour)
//app.post('/api/v1/tours', createTour) // in postman müssen daten gesendet werden
//app.patch('/api/v1/tours/:id', updateTour)
//app.delete('/api/v1/tours/:id', deleteTour)

// 3. routes
app.route('/api/v1/tours').get(getAllTours).post(createTour)
app.route('/api/v1/tours/:id').get(getTour).patch(updateTour).delete(deleteTour)

app.route('/api/v1/users').get(getAllUsers).post(createUser)
app.route('/api/v1/users/:id').get(getUser).patch(updateUser).delete(deleteUser)


// 4. start server
const PORT = 4301

app.listen(PORT, () => {
    console.log(`App running on port ${PORT}...`)
    console.log(`Server running on port: http://localhost:${PORT}...`);
    console.log(`Server running on port: http://127.0.0.1:${PORT}...`);
})