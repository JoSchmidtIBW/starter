const express = require('express');

const tourController = require('../controllers/tourController')

const router = express.Router();

//param mittleware      tour id is 5  --> http://127.0.0.1:4301/api/v1/tours/5      check id, sonst fail
// router.param('id', (req, res, next, val) => {
//     //console.log(`tour- id is: ${val}`)

//     // if (req.params.id * 1 > tours.length) {
//     //     res.status(404).json({ status: 'fail', message: 'Invalid ID' })
//     // }

//     next();
// })
router.param('id', tourController.checkID)


// checkbody mittdleware for post   dort müssen auch daten validiert werden
// check name   if not, send 400 (bad request)
router
    .route('/')
    .get(tourController.getAllTours)
    .post(tourController.checkBody, tourController.createTour);

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(tourController.deleteTour);

module.exports = router;