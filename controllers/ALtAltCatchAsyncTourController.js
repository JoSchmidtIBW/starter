const Tour = require('../models/tourModel')
    //const fs = require('fs')

const APIFeatures = require('../utils/apiFeatures')
const catchAsync = require('../utils/catchAsync')


//erst daten lesen dann verwenden top level code
//const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))


// middleware get top-5-tours
//http://127.0.0.1:4301/api/v1/tours?limit=5&sort=-ratingsAverage,price
//http: //127.0.0.1:4301/api/v1/tours/top-5-cheap
exports.aliasTopTours = async(req, res, next) => {
    // manipuliere query opject, damit nach next nur nocht top 5 kommen
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price'
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty' // was wollen wir zurück aus db

    next();
}








//middleware check data
// exports.checkBody = (req, res, next) => {

//     if (!req.body.name || !req.body.price) {
//         return res.status(400).json({
//             status: 'fail',
//             message: 'Bad request, Missing name or price'
//         })
//     }
//     //req.body
//     next();
// }



// mittdleware check id
// exports.checkID = (req, res, next, val) => {
//     console.log(`tour- id is: ${val}`)

//     if (req.params.id * 1 > tours.length) {
//         return res.status(404).json({
//             status: 'fail',
//             message: 'Invalid ID'
//         })
//     }
//     next()
// }


// 2. route handlers

exports.getAllTours = async(req, res) => { //http://127.0.0.1:4301/api/v1/tours
    //console.log(req.requestTime)

    try {


        // BUILD QUERY
        // 1a) FILTERING
        // um abzusichern... //http://127.0.0.1:4301/api/v1/tours?difficulty=easy&page=2   das hat es nicht, desshalb muss abgesichert werden
        // const queryObj = {...req.query }; //http://127.0.0.1:4301/api/v1/tours?duration=5&difficulty=easy
        // console.log("queryObj: " + queryObj)
        // const excludedFields = ['page', 'sort', 'limit', 'fields'] // das will man nicht in der query,
        // excludedFields.forEach(el => delete queryObj[el])
        // console.log("req.query und queryObj: " + req.query, queryObj) //http://127.0.0.1:4301/api/v1/tours?difficulty=easy&page=2&sort=1&limit=10


        // console.log("req.query: " + req.query) //http://127.0.0.1:4301/api/v1/tours?duration=5&difficulty=easy

        // //const tours = await Tour.find() //findet alle documents inder tour, wenn es leer ist

        // //erste variante suchen //http://127.0.0.1:4301/api/v1/tours?duration=5&difficulty=easy
        // // const tours = await Tour.find({ // oder in find({}) mit filter
        // //     duration: 5,
        // //     difficulty: 'easy'
        // // })

        // //zweite variante
        // //const tours = await Tour.find().where('duration').equals(5).where('difficulty').equals('easy') // anstatt .equalt .lt

        // //const tours = await Tour.find(req.query)
        // //const tours = await Tour.find(queryObj)// erst soll query obj alles in db finden, dann tours, darum query, dann await tours

        // console.log('---------------')
        //     // 1b) advanced FILTERING
        // let queryStr = JSON.stringify(queryObj) // muss let sein nicht const
        // console.log("queryStr: " + queryStr)
        //     // dollarzeichen rein machen
        //     // gte, gt, lte, lt
        // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`) // \b nur das wort, nicht wenn im wort vorkommt, /b multible time
        // console.log("JSON.parse(queryStr): " + JSON.parse(queryStr))
        // console.log("queryStr: " + queryStr) // in der dok sollte alle urls dokumentiert sein, und was man in der url suchen kann






        // let query = Tour.find(JSON.parse(queryStr)) //http://127.0.0.1:4301/api/v1/tours?duration[gte]=5&difficulty=easy&price[lt]=1500
        // let 


        // // 2) SORTING      obwohl oben das man das nicht will
        // //http://127.0.0.1:4301/api/v1/tours?sort=price     sortiert klein nach gross
        // //http://127.0.0.1:4301/api/v1/tours?sort=-price    sortiert gross nach klein
        // if (req.query.sort) {
        //     const sortBy = req.query.sort.split(',').join(' ') // komma mit leertaste ersetzen
        //     console.log("sortBy: " + sortBy)

        //     query = query.sort(sortBy)
        //         //query = query.sort(req.query.sort)
        //         // sort('price ratingsAverage')
        //         //http://127.0.0.1:4301/api/v1/tours?sort=-price,ratingsAverage     preis und age sortiert
        //         // muss komma durch leertaste ersetzt werden
        // } else { // wenn user nicht in url spezifisch sortiert, ein default wert
        //     query = query.sort('-createdAt') //http://127.0.0.1:4301/api/v1/tours
        // }

        // //3) FILD limiting  sollen alle Daten zurück kommen, oder nur teil davon
        // //http://127.0.0.1:4301/api/v1/tours?fields=name,duration,difficulty,price
        // if (req.query.fields) {
        //     const fields = req.query.fields.split(',').join(' ');
        //     //query = query.select('name duration difficulty price')// nennt mann projecting
        //     query = query.select(fields) //http://127.0.0.1:4301/api/v1/tours?fields=name,duration,difficulty,price
        // } else {
        //     query = query.select('__v') // macht mongose immer automatisch bei jedem object
        //     query = query.select('-__v') // damit nicht gesendet wird nicht not including, excluding // _id kann nicht...
        //         //passwort sollte zum beispiel nicht sehen
        // } //http://127.0.0.1:4301/api/v1/tours?fields=-name,-duration
        // // dann sieht mann alles, nur nicht name und duration


        // //4) PAGINATION paginierung nur 10 sachen auf einer seite anstatt 1000...
        // //http://127.0.0.1:4301/api/v1/tours?page=2&limit=10
        // // 1-10 -> page 1, 11-20 --> page 2   21-30 --> page 3
        // //page=3&limit=10
        // //query = query.skip(20).limit(10)
        // // wenn user get allTours anfordert, bekommt nicht 1 million sonder erste hundert...
        // const page = req.query.page * 1 || 1 // macht ne nummer draus // by default 1
        // const limit = req.query.limit * 1 || 100;
        // const skip = (page - 1) * limit // page 30 --> 21-30 --> 2* 10 -1

        // //query = query.skip(10).limit(10)
        // query = query.skip(skip).limit(limit) //http://127.0.0.1:4301/api/v1/tours?page=1&limit=3

        // //http://127.0.0.1:4301/api/v1/tours?page=4&limit=3   gibt nur neun objekte, darum hier fehler
        // if (req.query.page) {
        //     const numTours = await Tour.countDocuments(); //zählt alle objekte von tout schema
        //     if (skip >= numTours) throw new Error('This page does not exist, weill nicht so viele Objekte in db')
        // }





        //const query = Tour.find(queryObj) // ohne await
        //const query = Tour.find().where('duration').equals(5).where('difficulty').equals('easy') 


        // { difficulty: 'easy', duration: { $gte: 5 } }     //http://127.0.0.1:4301/api/v1/tours?duration[gte]=5&difficulty=easy
        // console.log("req.query: " + req.query)
        //req.query und queryObj: [object Object] { duration: { gte: '5' }, difficulty: 'easy' }    // gibt in postman ein fehler
        // das ist die ausgabe, welche sich nur durchs fehlende dollarzeichen vom objekt ähnlich sieht
        //{ difficulty: 'easy', duration: { $gte: 5 } }
        //{ duration: { gte: '5' }, difficulty: 'easy' }    //fehlt nur dollarzeichen, muss ev gemacht werden

        // EXECUTED QUERY
        // hier die Klasse APIFeatures rein zum testen
        const features = new APIFeatures(Tour.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();
        const tours = await features.query;

        // const tours = await query



        // query.sort().select().skip().limit()


        //http://127.0.0.1:4301/api/v1/tours?difficulty=easy&page=2   das hat es nicht, desshalb muss abgesichert werden

        // SEND RESPONSE
        res.status(200).json({
            status: 'sucsess',
            results: tours.length,
            data: {
                tours
            }
            //requestedAt: req.requestTime //,
            // results: tours.length,
            // data: tours //{ tours: tours }
        })
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: 'was ist schief: ' + err
        })
    }
}

exports.getTour = async(req, res) => {

    try {

        const tour = await Tour.findById(req.params.id) // in url /:63fb4c3baac7bf9eb4b72a76 (id in mongo) wenn steht :irgendwas, dann heist req.param.irgendwas
            // Tour.findOne({ _id: req.params.id})  genau wie das: = await Tour.findById(req.params.id) mongodb hat für einfachere funktion findById
        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        })
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }

    // console.log("req.params: " + JSON.stringify(req.params))

    // const id = req.params.id * 1; // macht eine nummer von der url id    
    // //const tour = tours.find(el => el.id === id)

    // //if (id > tours.length) {
    // // if (!tour || id > tours.length) {
    // //     res.status(404).json({ status: 'fail', message: 'Invalid ID' })
    // // } else {

    // // }

    // res.status(200).json({
    //     status: 'sucsess',
    //     //results: tours.length,
    //     //data: tour //{ tours: tours }
    // })
}


// // video 116 die try-catch-blöcke rausmachen, verkleinern, clean code...
// const catchAsync = fn => { // fn = function
//     return (req, res, next) => { //anonymus function
//         //fn(req, res, next).catch(err => next(err));//catch(next)
//         fn(req, res, next).catch(next);
//     };
// };





exports.createTour = catchAsync(async(req, res, next) => { // braucht next, wegen globalErrorHandling    fn, um try catch weg machen
    const newTour = await Tour.create(req.body)

    res.status(201).json({ //201 = createt
        status: 'succsess',
        data: {
            tour: newTour
        }
    })

    // try {
    //     // const newTour = new Tour({})
    //     // newTour.save()
    //     const newTour = await Tour.create(req.body)

    //     res.status(201).json({ //201 = createt
    //         status: 'succsess',
    //         data: {
    //             tour: newTour
    //         }
    //     })
    // } catch (err) {
    //     res.status(400).json({ //bad request
    //         status: 'fail',
    //         message: 'bad request: invalid data send: ' + err
    //     })
    // }

    //nicht writefilesync, weil in iventloup drin
    // //console.log("req.body: " + JSON.stringify(req.body))

    // //nehme letzte id in database und füge zum neuen objekt eine id hinzu
    // const newId = tours[tours.length - 1].id + 1;
    // const newTour = Object.assign({ id: newId }, req.body)

    // tours.push(newTour)
    // fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
    //         res.status(201).json({
    //                 status: 'succsess',
    //                 tour: newTour
    //             }) //201 = createt
    //     }) //nicht writefilesync, weil in iventloup drin
});


exports.updateTour = async(req, res) => {

    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, { //achtung mit patch und put, bei updatebyid
                new: true,
                runValidators: true // falls price: 500 wäre ein string
            }) // in url /:63fb4c3baac7bf9eb4b72a76 , body: was geupdatet wird, 3, damit nur das geupdatet neue return wird
            // Tour.findOne({ _id: req.params.id})

        res.status(200).json({ //postman: url/63fb4c3baac7bf9eb4b72a76 und body muss json sein sonst geht nicht
            status: 'success',
            // results: tours.length,
            //message: "helllloooo",
            data: {
                //     tours: 'updated tours here...' //{ tours: tours }
                tour: tour // wenn gleicher name tout tour, kann auch nur tour stehen
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })

    }
    // if (req.params.id * 1 > tours.length) {
    //     res.status(404).json({ status: 'fail', message: 'Invalid ID' })
    // }
};

exports.deleteTour = async(req, res) => {
    // so wird gelöscht in einer Restfull api
    try {
        await Tour.findByIdAndDelete(req.params.id)

        res.status(204).json({
            status: 'success',
            data: null
        })

    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }

    // if (req.params.id * 1 > tours.length) {
    //     res.status(404).json({ status: 'fail', message: 'Invalid ID' })
    // }
    // res.status(204).json({ //204 no content == null == delete
    //     status: 'sucsess',
    //     data: null
    // })
}


//Video 102 Agregation Pipeline for MongoDB
// soll statistiken zeigen von tours
exports.getTourStats = async(req, res) => {
    try {
        const stats = await Tour.aggregate([ // array = stages, wo die Daten manipuliert werden können
            {
                $match: { ratingsAverage: { $gte: 4.5 } } // match stage
            },
            {
                $group: { // zb um durchschnitt zu erechnen von den 5 gefundenen
                    //_id: null,
                    //_id: '$difficulty', // _id: null, // für alle welche kommen
                    //_id: '$ratingsAverage',
                    _id: { $toUpper: '$difficulty' },
                    numTours: { $sum: 1 }, //1 pro dokument, jedesmal added 1  1++
                    numRatings: { $sum: '$ratingsQuantity' },
                    avgRating: { $avg: '$ratingsAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                }
            },
            {
                $sort: { // müssen namen von neuen objekten (oben) sein
                    avgPrice: 1,
                }
            },
            // { // beispiel, um mehrere male match zu machen
            //     $match: { _id: { $ne: 'EASY' } } //alle welche not easy sind,  EASY weil ez neu in DB gross (difficulty)
            // }
        ])

        res.status(200).json({
            status: 'success',
            data: {
                stats: stats
            }
        });

    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}



// video 103    DAS GEHT NICHT WEIL DATENBANK ZUERST mit TERMINEN GELADEN WERDEN MUSS IM BEISPIEL
////http://127.0.0.1:4301/api/v1/tours/monthly-plan/:year   2021
exports.getMonthlyPlan = async(req, res) => {
    try {
        const year = req.params.year * 1; //  *1 mache nummer

        const plan = await Tour.aggregate([{
                $unwind: '$startDates' // für jeden termin ein seperates Dokument
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`),
                    } //2021
                }
            },
            {
                $group: {
                    _id: { $month: '$startDates' },
                    numTourStarts: { $sum: 1 },
                    tours: { $push: '$name' }
                }
            },
            {
                $addFields: {
                    month: '$_id'
                }
            },
            {
                $project: {
                    _id: 0, // 0 id nicht anzeigen, 1 = anzeigen in deb
                }
            },
            {
                $sort: {
                    numTourStarts: -1
                }
            },
            {
                $limit: 6
            }
        ])

        res.status(200).json({
            status: 'success',
            data: {
                plan
            }
        });


    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}