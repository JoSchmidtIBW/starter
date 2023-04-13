const Tour = require('../models/tourModel')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')



exports.getOverview = catchAsync(async(req, res, nexth) => {
    // 1.) Get tour data from collection
    const tours = await Tour.find()

    // 2. Build template, but in real not in this controller

    // 3.) Render that template using tour data from 1.)


    res.status(200).render('overview', {
        title: 'All Tours',
        tours: tours, // erstes tours ist das template, zweites tours sind die tourdata
    })
})

exports.getTour = catchAsync(async(req, res, next) => {
    // 1.) Get the data, from the requested tour (inclouding rewievs and guides)
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    })


    if (!tour) { // wenn dieser block auskommentiert, müsste api-fehler anstatt render kommen
        return next(new AppError('There is no tour with that name.', 404)); //404= not found
    }

    // 2. Build template, but in real not in this controller

    // 3.) Render that template using tour data from 1.)




    res.status(200).render('tour', {
        title: `${tour.name} tour`, //'The Forrest Hiker Tour',
        tour
    })
})



exports.getLoginForm = (req, res) => {
        res.status(200).render('login', {
            title: 'Log into your account', //
        })
    }
    //module.exports =