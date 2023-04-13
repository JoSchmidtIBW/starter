const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')
const APIFeatures = require('../utils/apiFeatures')

exports.getAll = Model => catchAsync(async(req, res, next) => { //http://127.0.0.1:4301/api/v1/tours
    //console.log(req.requestTime)

    // To allow for nestet GET reviews on tour (hack)
    let filter = {} //gettAllreviews
        // video 160
    if (req.params.tourId) filter = { tour: req.params.tourId } //getAllReviews


    // EXECUTED QUERY
    // hier die Klasse APIFeatures rein zum testen
    // API features
    const features = new APIFeatures(Model.find(filter), req.query)
        //const features = new APIFeatures(Model.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    const doc = await features.query;
    //const doc = await features.query.explain(); //video167 add explain for statistic


    // SEND RESPONSE
    res.status(200).json({
        status: 'sucsess',
        results: doc.length,
        data: {
            data: doc
        }
    })
})








// getOne by getOneTour hat ein populate drin       populateOoptions 
exports.getOne = (Model, popOptions) => catchAsync(async(req, res, next) => {

    let query = Model.findById(req.params.id)
    if (popOptions) query = query.populate(popOptions)

    const doc = await query;

    //const doc = await Model.findById(req.params.id).populate('reviews');

    if (!doc) { // Null is false
        return next(new AppError('No document found with that ID', 404))
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    })
})



exports.deleteOne = Model => catchAsync(async(req, res, next) => {
    // so wird gelöscht in einer Restfull api
    // try {
    const doc = await Model.findByIdAndDelete(req.params.id)

    if (!doc) { // Null is false
        return next(new AppError('No document found with that ID', 404))
    }

    res.status(204).json({
        status: 'success',
        data: null
    })


});

exports.updateOne = Model => catchAsync(async(req, res, next) => {
    // try {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { //achtung mit patch und put, bei updatebyid
            new: true,
            runValidators: true // falls price: 500 wäre ein string
        }) // in url /:63fb4c3baac7bf9eb4b72a76 , body: was geupdatet wird, 3, damit nur das geupdatet neue return wird
        // Tour.findOne({ _id: req.params.id})

    if (!doc) { // Null is false
        return next(new AppError('No document found with that ID', 404))
    }


    res.status(200).json({ //postman: url/63fb4c3baac7bf9eb4b72a76 und body muss json sein sonst geht nicht
        status: 'success',
        // results: tours.length,
        //message: "helllloooo",
        data: {
            //     tours: 'updated tours here...' //{ tours: tours }
            //tour: tour // wenn gleicher name tout tour, kann auch nur tour stehen
            data: doc,
        }
    });
    // } catch (err) {
    //     res.status(404).json({
    //         status: 'fail',
    //         message: err
    //     })

    // }
    // if (req.params.id * 1 > tours.length) {
    //     res.status(404).json({ status: 'fail', message: 'Invalid ID' })
    // }
})

exports.createOne = Model => catchAsync(async(req, res, next) => { // braucht next, wegen globalErrorHandling    fn, um try catch weg machen
    const doc = await Model.create(req.body)

    res.status(201).json({ //201 = createt
        status: 'succsess',
        data: {
            data: doc
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



// exports.deleteTour = catchAsync(async(req, res, next) => {
//     // so wird gelöscht in einer Restfull api
//     // try {
//     const tour = await Tour.findByIdAndDelete(req.params.id)

//     if (!tour) { // Null is false
//         return next(new AppError('No Tour found with that ID', 404))
//     }

//     res.status(204).json({
//         status: 'success',
//         data: null
//     })

//     // } catch (err) {
//     //     res.status(404).json({
//     //         status: 'fail',
//     //         message: err
//     //     })
//     // }

//     // if (req.params.id * 1 > tours.length) {
//     //     res.status(404).json({ status: 'fail', message: 'Invalid ID' })
//     // }
//     // res.status(204).json({ //204 no content == null == delete
//     //     status: 'sucsess',
//     //     data: null
//     // })
// });