const express = require('express');

const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController')

//const router = express.Router();
const router = express.Router({ mergeParams: true });

///api/v1/reviews 

router.use(authController.protect)

// POST /tour/1234/reviews
// POST / reviews
// router
//     .route('/') // das sollte nur user können, nicht aber guide und admin
//     .get(authController.protect, reviewController.getAllReviews)
//     .post(authController.protect, authController.restrictTo('user'), reviewController.setTourUserIds, reviewController.createReview) // post braucht tourID in url
router
    .route('/') // das sollte nur user können, nicht aber guide und admin
    .get(reviewController.getAllReviews)
    .post(authController.restrictTo('user'), reviewController.setTourUserIds, reviewController.createReview)

router.route('/:id')
    .get(reviewController.getReview)
    .patch(authController.restrictTo('user', 'admin'), reviewController.updateReview)
    .delete(authController.restrictTo('user', 'admin'), reviewController.deleteReview)


module.exports = router;