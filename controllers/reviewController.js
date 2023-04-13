const Review = require('../models/reviewModel')

const APIFeatures = require('../utils/apiFeatures')
const catchAsync = require('../utils/catchAsync')

const AppError = require('../utils/appError')
const factory = require('../controllers/handlerFactory')


exports.getAllReviews = factory.getAll(Review)
    // dieser hat zwei code zeile, wo alle anderen nicht haben
    // exports.getAllReviews = catchAsync(async(req, res, next) => {
    //     let filter = {}

//     // video 160
//     if (req.params.tourId) filter = { tour: req.params.tourId }


//     //const reviews = await Review.find();
//     const reviews = await Review.find(filter); // wenn emty, dann findet all reviews, ansonsten nur die eine

//     res.status(200).json({
//         status: 'success',
//         results: reviews.length,
//         data: {
//             reviews: reviews,
//         }
//     })
// });


//bei createReview die zwei codezeilen: dafür eine Middleware machen
// // Allow nestet routes
// if (!req.body.tour) req.body.tour = req.params.tourId // viedeo 158
// if (!req.body.user) req.body.user = req.user.id;
exports.setTourUserIds = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId // viedeo 158
    if (!req.body.user) req.body.user = req.user.id;

    next(); // diese middleware in reviewRouts implementieren
}

exports.getReview = factory.getOne(Review)
exports.createReview = factory.createOne(Review) // aber hier in createReview hat es zwei codezeilen, die nicht in createOne sind
    // das sind controller-functions or handler-functions
    // exports.createReview = catchAsync(async(req, res, next) => {
    //     // Allow nestet routes
    //     if (!req.body.tour) req.body.tour = req.params.tourId // viedeo 158
    //     if (!req.body.user) req.body.user = req.user.id;


//     const newReview = await Review.create(req.body); // die daten kommen vom body

//     res.status(201).json({ // 201 = created
//         status: 'success',
//         data: {
//             review: newReview,
//         }
//     });
// });

// nur für admin, und nur ohne passwort
// weil findbyidandupdate, die ganzen save- middleware is not run 
exports.updateReview = factory.updateOne(Review)
exports.deleteReview = factory.deleteOne(Review)