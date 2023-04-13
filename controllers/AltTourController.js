const fs = require('fs')
const Tour = require('../models/tourModel')



//erst daten lesen dann verwenden top level code
//const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))





//middleware check data
exports.checkBody = (req, res, next) => {

    if (!req.body.name || !req.body.price) {
        return res.status(400).json({
            status: 'fail',
            message: 'Bad request, Missing name or price'
        })
    }
    //req.body
    next();
}



// mittdleware check id
exports.checkID = (req, res, next, val) => {
    console.log(`tour- id is: ${val}`)

    if (req.params.id * 1 > tours.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID'
        })
    }
    next()
}


// 2. route handlers

exports.getAllTours = (req, res) => {
    console.log(req.requestTime)
    res.status(200).json({
        status: 'sucsess',
        requestedAt: req.requestTime,
        results: tours.length,
        data: tours //{ tours: tours }
    })
}

exports.getTour = (req, res) => {
    console.log("req.params: " + JSON.stringify(req.params))

    const id = req.params.id * 1; // macht eine nummer von der url id    
    const tour = tours.find(el => el.id === id)

    //if (id > tours.length) {
    // if (!tour || id > tours.length) {
    //     res.status(404).json({ status: 'fail', message: 'Invalid ID' })
    // } else {

    // }

    res.status(200).json({
        status: 'sucsess',
        //results: tours.length,
        data: tour //{ tours: tours }
    })
}

exports.createTour = (req, res) => {
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


exports.updateTour = (req, res) => {
    // if (req.params.id * 1 > tours.length) {
    //     res.status(404).json({ status: 'fail', message: 'Invalid ID' })
    // }

    res.status(200).json({
        status: 'sucsess',
        results: tours.length,
        data: {
            tours: 'updated tours here...' //{ tours: tours }
        }
    })
}

exports.deleteTour = (req, res) => {
    // if (req.params.id * 1 > tours.length) {
    //     res.status(404).json({ status: 'fail', message: 'Invalid ID' })
    // }
    res.status(204).json({ //204 no content == null == delete
        status: 'sucsess',
        data: null
    })
}