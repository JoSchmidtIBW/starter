const express = require('express');
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')


const router = express.Router();


//authentication
//http: //127.0.0.1:4301/api/v1/users/signup
router.post('/signup', authController.signup); //hat kein get, und kein update,     post in postman!// für jederman
//http: //127.0.0.1:4301/api/v1/users/login     
router.post('/login', authController.login); // nur post, sendet passwort und email, kein get, kein update  //für jederman

router.get('/logout', authController.logout) // muss nur get sein, schicken keine daten oder ändern welche
    //{{URL}}api/v1/users/forgotPassword
router.post('/forgotPassword', authController.forgotPassword); //für jederman
//{{URL}}api/v1/users/resetPassword/:token   PATCH
router.patch('/resetPassword/:token', authController.resetPassword); //für jederman



//Protect all routes after this middleware
router.use(authController.protect) // ab hier, alle middleware sind protected

//http: //127.0.0.1:4301/api/v1/users/updateMyPassword
//router.patch('/updateMyPassword', authController.protect, authController.updatePassword)
router.patch('/updateMyPassword', authController.updatePassword)

//router.get('/me', authController.protect, userController.getMe, userController.getUser)
router.get('/me', userController.getMe, userController.getUser)
    //{{URL}}api/v1/users/updateMe
    //router.patch('/updateMe', authController.protect, userController.updateMe)
router.patch('/updateMe', userController.updateMe)
    //{{URL}}api/v1/users/deleteMe
    //router.delete('/deleteMe', authController.protect, userController.deleteMe)
router.delete('/deleteMe', userController.deleteMe)


//All routes are onli for admin after this middleware
router.use(authController.restrictTo('admin'))

//http: //127.0.0.1:4301/api/v1/users
router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

//http: //127.0.0.1:4301/api/v1/users/:id
router
    .route('/:id')
    .get(authController.protect, userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);





module.exports = router;