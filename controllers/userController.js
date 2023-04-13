const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync')
const factory = require('../controllers/handlerFactory')

//video 139
const filterObj = (obj, ...allowedFields) => { // create a array
    const newObj = {};
    //loop to the objekt in array
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    })
    return newObj;
};



// 2. route handlers
//exports.getAllUsers = factory.getAll(User)
// exports.getAllUsers = catchAsync(async(req, res, next) => {

//     const users = await User.find();

//     res.status(200).json({
//         status: 'success',
//         result: users.length,
//         data: {
//             users: users
//         }
//     })
// });


//video164  für getOne --> dort kommt id von query, wie wollen aber id von based user   id von login user
// dafür eine middleware machen
exports.getMe = (req, res, next) => { // bevor calling getOne
    req.params.id = req.user.id;

    next();
}


//video 139
exports.updateMe = catchAsync(async(req, res, next) => { // Für User sich selber, ohne Admin
    // 1.) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password update. Please use /updateMyPassword.', 400)); // 400 =  bad request
    }


    // könnte man mit user.save() machen, aber dann gibt es fehler
    // zu demonstrieren:
    //const user = await User.findById(req.user.id);// um saveMethode nicht zu nutzen hier, weil sonst fehler kommt

    // 3.) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email') // in req.body sind alle daten,

    // 4.) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, { // x, weil user könnte machen: req.body.role: 'admin, wir erlauben nur die felder email, und name zu ändern
        new: true,
        runValidators: true
    });

    // user.name = 'Jonas'; //    //"password": "pass123",
    // user.save();    // sollte fehler kommen, please passwordConfirm, kommt aber nicht   aber darum ist auch die save-methode nicht gut hier


    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    })
})

//video 140 delete user// aber nur account inaktiv schalten, nicht löschen von db
// zum testen, in postman sieht man nichts, aber in compass, ob active = false ist
exports.deleteMe = catchAsync(async(req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false })

    res.status(204).json({ // 204 = for deletet
        status: 'success',
        data: null, // sendet keine daten
    })
})

exports.getUser = factory.getOne(User)
    //nicht wie tutorial
    // exports.getUser = async(req, res) => {
    //     // res.status(500).json({
    //     //         status: 'error',
    //     //         message: 'this route is not defined'
    //     //     }) // server error not implement
    //     const user = await User.findById(req.params.id);

//     res.status(200).json({
//         status: 'success',
//         data: {
//             user: user
//         }
//     })
// }

exports.getAllUsers = factory.getAll(User)

// hier braucht es keine createOne, weil wir haben die signup- funktion
exports.createUser = (req, res) => {
    res.status(500).json({
            status: 'error',
            message: 'this route is not defined, pleace use /signup insteat'
        }) // server error not implement
}

// Do NOT update password with this!
exports.updateUser = factory.updateOne(User) // nur für admin, und update data that is not the passwort
    // weil findbyidandupdate, die ganzen save- middleware is not run 

// exports.updateUser = (req, res) => { // für ADMIN
//     res.status(500).json({
//             status: 'error',
//             message: 'this route is not defined'
//         }) // server error not implement
// }

exports.deleteUser = factory.deleteOne(User)
    // exports.deleteUser = (req, res) => {
    //     res.status(500).json({
    //             status: 'error',
    //             message: 'this route is not defined'
    //         }) // server error not implement
    // }