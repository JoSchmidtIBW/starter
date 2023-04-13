const express = require('express');

const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController')
const catchAsync = require('../utils/catchAsync');
//const reviewController = require('../controllers/reviewController')
const reviewRouter = require('../routes/reviewRoutes')

const router = express.Router();


//video159
router.use('/:tourId/reviews', reviewRouter); // muss oben sein     mointing a router       der reviewrouter braucht aber noch die tourId



//param mittleware      tour id is 5  --> http://127.0.0.1:4301/api/v1/tours/5      check id, sonst fail
// router.param('id', (req, res, next, val) => {
//     //console.log(`tour- id is: ${val}`)

//     // if (req.params.id * 1 > tours.length) {
//     //     res.status(404).json({ status: 'fail', message: 'Invalid ID' })
//     // }

//     next();
// })



//router.param('id', tourController.checkID)


// checkbody mittdleware for post   dort müssen auch daten validiert werden
// check name   if not, send 400 (bad request)
// router
//     .route('/')
//     .get(tourController.getAllTours)
//     .post(tourController.checkBody, tourController.createTour);


// implementieren einer route, wo zuerst der Durchschnitt und danach nach price sortiert wird
//http://127.0.0.1:4301/api/v1/tours?limit=5&sort=-ratingsAverage,price
//http://127.0.0.1:4301/api/v1/tours/top-5-cheap
router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours) // middleware, welche getalltours nutzt, aber mit funktion aliasTopTours

//http://127.0.0.1:4301/api/v1/tours/tour-stats
router.route('/tour-stats').get(tourController.getTourStats)

//http://127.0.0.1:4301/api/v1/tours/monthly-plan/
router.route('/monthly-plan/:year')
    .get(authController.protect,
        authController.restrictTo('admin', 'lead-guide', 'guide'),
        tourController.getMonthlyPlan)

//video 171// unit = km oder miles
router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin)
    // /tours-within?distance=233&center=-40,45&unit=mi
    // /tours-within/233/center/-40,45/unit/mi

// video 172
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances)

router
    .route('/')
    .get(tourController.getAllTours) // hier möchte man keine protect
    .post(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.createTour);

// router
//     .route('/')
//     .get(catchAsync(tourController.getAllTours))// könnte hier machen, anstatt bei tourcontroller... aber dann nicht weiss, welche async sind und welche nicht
//     .post(tourController.createTour);

router
    .route('/:id')
    .get(tourController.getTour) //Kostenlos für jederman
    .patch(authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.updateTour)
    .delete(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.deleteTour);


//video 158 nestet rout, user in review sollte eingeloggt sein, tour die current tour
// url   POST tour/233444idTour/reviews     das ist eine nestet route       reviews ist ein child von tours, sieht man in url
// GET tour/233444idTour/reviews
//GET tour/233444idTour/reviews/9985IDreviews
//router.route('/:tourId/reviews').post(authController.protect, authController.restrictTo('user'), reviewController.createReview)
// weil die route mit tour startet, obwohl kein sinn, reviewcontroller in tourRoutes

module.exports = router;