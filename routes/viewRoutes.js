const express = require('express');

const viewsController = require('../controllers/viewsController')
const authController = require('../controllers/authController')

const router = express.Router();


router.use(authController.isLoggedIn) // alle ab hier, haben diese middleware


// router.get('/', (req, res, ) => {
//         res.status(200).render('base', {
//             tour: 'The Forrest hiker',
//             user: 'Jonas',
//         })
//     })
//     // app.get('/ejs', (req, res, ) => {
//     //     res.status(200).render('basee')
//     // })

router.get('/', viewsController.getOverview) // /overview   // das ist die erstee seite
    //router.get('/overview', viewsController.getOverview)
    // router.get('/overview', (req, res) => {
    //     res.status(200).render('overview', {
    //         title: 'All Tours',
    //     })
    // })

//http://localhost:4301/tours/the-forest-hiker    
router.get('/tour/:slug', viewsController.getTour)
    // router.get('/tour', (req, res) => {
    //     res.status(200).render('tour', {
    //         title: 'The Forrest Hiker Tour',
    //     })
    // })

// /login
router.get('/login', viewsController.getLoginForm)

module.exports = router