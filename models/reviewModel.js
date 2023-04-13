// video 154
// two parent refferences

const mongoose = require('mongoose');
const Tour = require('../models/tourModel')

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review can not be emty!'],
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong a tour.']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']
    }
}, { //virtuele eigenschaften when a field not stored in db, aber das es ein output gibt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})

//video 170 dublicatet reviews same user ...
reviewSchema.index({ tour: 1, user: 1 }, { unique: true })

reviewSchema.pre(/^find/, function(next) { // reviews pointing to the tours, and not tour pointing to the rewievs
    // this.populate({ // the parent not know about his children
    //     path: 'tour',
    //     select: 'name',
    // }).populate({
    //     path: 'user',
    //     select: 'name photo', //sollte keine private daten senden, zb nicht email   sieht in postman nur das, was gegeben ist, zb photo noch nicht drin
    // })
    //Möchte man nicht das alles in tour ist, weil sonst so gross

    this.populate({ // sehe nur id von tour, aber user der ganze    das ist parent-referencing
        path: 'user',
        select: 'name photo', //sollte keine private daten senden, zb nicht email   sieht in postman nur das, was gegeben ist, zb photo noch nicht drin
    })
    next();
})

//video168
//Review.calcStats
reviewSchema.statics.calcAverageRatings = async function(tourId) { // tour = tourID
        // console.log(tourId)
        const stats = await this.aggregate([{
                //$match: {tour: tour}
                $match: { tour: tourId }
            },
            {
                $group: {
                    _id: '$tour',
                    nRating: { $sum: 1 }, //1++
                    avgRating: { $avg: '$rating' },
                }
            }
        ]);
        //console.log("stats: " + stats)
        //console.log("stats: " + JSON.stringify(stats))

        //finde die passende Tour und update
        if (stats.length > 0) {
            await Tour.findByIdAndUpdate(tourId, {
                ratingsQuantity: stats[0].nRating, // array position 0
                ratingsAverage: stats[0].avgRating,
            })
        } else {
            await Tour.findByIdAndUpdate(tourId, {
                ratingsQuantity: 0, // 
                ratingsAverage: 4.5, // ist wieder der default wert
            })
        }

    }
    // um 
reviewSchema.post('save', function() {
    //this points to current review
    this.constructor.calcAverageRatings(this.tour)

    //Review.calcAverageRatings(this.tour) // problem: Review is not defined   diesen abschnitt gleich unterhalb machen wo review deklariert, geht nicht
    //next()    post hat kein next
})


//löschen und updaten       aber für diese hooks we onli have query middleware
//findBiIdandDelete
//findByIdandUpdate aber haben nur query middleware findOneAnd ist die lange version von den beiden
reviewSchema.pre(/^findOneAnd/, async function(next) {
        //this kyword ist für die current curerry not for this
        //const r = await this.findOne(); // r = review   // anstatt save in r, save in this
        this.r = await this.findOne();
        // console.log("r: " + r)
        // console.log("r: " + JSON.stringify(r))
        // console.log("r: " + this.r)
        next() // hier kann man kein post machen
    })
    //video 169
reviewSchema.post(/^findOneAnd/, async function() {
    // await this.findOne(); Does NOT work here, query has already executed
    await this.r.constructor.calcAverageRatings(this.r.tour); // aber wo die current ID
})

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;


//video 158 nestet rout, user in review sollte eingeloggt sein, tour die current tour
// url   POST tour/233444idTour/reviews     das ist eine nestet route       reviews ist ein child von tours, sieht man in url
// GET tour/233444idTour/reviews

//GET tour/233444idTour/reviews/9985IDreviews