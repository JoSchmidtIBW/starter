//const util = require('util');//utilaty, aber direktes objekt von dem
const { promisify } = require('util')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const sendEmail = require('../utils/email')

const signToken = id => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, { //sign funtktion von jwt
        expiresIn: process.env.JWT_EXPIRES_IN,
    })
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id)

    //video 142 send coockie, jwt sollte im coockie sein und nicht in browser- localstorage!
    // um coockie zu erstellen: geht aber nur mit https, und wird ausgelagert, um nur in production zu sein htttps
    // res.cookie('jwt', token, {
    //     //expires: new Date(Date.now() + 1000 * 60 * 2) //delete coockie afgter expired
    //     expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    //     secure: true, // coockie onli send by e verschlüsselten verbindung, also zb HTTPS, das nur in production, desshalb wird das ausgelagert
    //     httpOnly: true, //provent xros site srippting attaks
    // })

    const cookieOptions = {
        //expires: new Date(Date.now() + 1000 * 60 * 2) //delete coockie afgter expired
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000), // hier wird die zeit vom cookie gesetzt
        //secure: true, // coockie onli send by e verschlüsselten verbindung, also zb HTTPS, das nur in production, desshalb wird das ausgelagert
        httpOnly: true, //provent xros site srippting attaks, kann nicht zerstört werden, um es zu löschen oder log out, in dieser art und weise, kann nur das cookie überschrieben werden, jedoch ohne token + neues cookie hat ganz kurze überlebenszeit
    }

    if (process.env.NODE_ENV === 'production') {
        cookieOptions.secure = true
    }

    // testen mit postman, create new user, und sehen coockie in postman
    //res.cookie('jwt ' + user.name, token, cookieOptions) //ev mit name
    res.cookie('jwt', token, cookieOptions)

    // Remove the password from the output
    user.password = undefined // wenn user erstellt wird, sieht man eben noch das pw drin

    res.status(statusCode).json({ // 201 für created       testen postman mit post http://127.0.0.1:4301/api/v1/users/signup
        status: 'success',
        token, // token bevor user-data
        data: {
            user: user,
        }
    });
}

exports.signup = catchAsync(async(req, res, next) => { // wie createUser aber in authentifizierungsController
    // const newUser = await User.create(req.body); // daten sind im body, und returnt ein promis, darum await
    //User.save()                       // problem oben, so wird alles akzeptiert, zum ein user machen

    const newUser = await User.create({ // nur das wird aktzepiert zum ein user machen
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangeAt: req.body.passwordChangeAt,
        role: req.body.role,
    })

    //jwt token generieren      sign(payload, secret, Ablaufzeit)     payload, welche Daten sollen dort rein, zb die ID von user        'secret'
    // const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    //     expiresIn: process.env.JWT_EXPIRES_IN,
    // }) ausgelagert

    createSendToken(newUser, 201, res)
        //ausgelagert
        // const token = signToken(newUser._id)

    // res.status(201).json({ // 201 für created       testen postman mit post http://127.0.0.1:4301/api/v1/users/signup
    //     status: 'success',
    //     token, // token bevor user-data
    //     data: {
    //         user: newUser,
    //     }
    // });
});


//authentifizierung und authentification, Authorisation
//authentification jwtwebtoken

exports.login = catchAsync(async(req, res, next) => {
    // const email = req.body.email;
    //const password = req.body.password;                      //const MA_Nummer = ...
    // das gibt fehler von linter, weil email und email...      
    //desshalb:
    const { email, password } = req.body; // das ist das, was user sendet bei login

    //1. check if email and password exist
    if (!email || !password) { // wenn nicht existiert, sende zu client 
        return next(new AppError('Pleace provide email and password!', 400)) //400 = bad request         wenn nicht return, in console. error
    }
    //2. check if user exists && password is correct
    //    user --> ist ein user-dokument
    const user = await User.findOne({ email: email }).select('+password') //geht auch const user = User.findOne({ email })        Achtung: passwort ist bei usermodel secret = false! also ist nur die email da, nicht das passwort, okay.. mit .selcte('+password') sieht man wieder
    console.log("user: " + user)

    // frage, ob passwort gleich, userPasswort in db, in db is hash, 
    //const correct = await user.correctPassword(password, user.password); // correct ist entweder true oder false    muss auch wait sein, wenn oberer user nicht ist

    // if(!user || !correct){//wenn separat, dann hacker hat weiss, ob email nicht korrekt oder passwort usw
    //     return next(new AppError('Incorrect email or password', 401)); // 401 unauthorize
    // }

    if (!user || !await user.correctPassword(password, user.password)) { //wenn separat, dann hacker hat weiss, ob email nicht korrekt oder passwort usw
        return next(new AppError('Incorrect email or password', 401)); // 401 unauthorize
    }

    //3. If everything is ok, send token to client
    //// const token = '' //fakeTokken
    //const token = signToken(user._id)// kann an oder aus, kein unterschied 

    // res.status(200).json({
    //     status: 'success',
    //     token
    // })
    createSendToken(user, 200, res)
})

//video 192
exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
            expires: new Date(Date.now() + 10 * 1000), //+ 10 sekunden = 10*1000
            httpOnly: true,
        }) // muss genau so heissen, da das alte cookie überschrieben wird, und neues nur kurze lebenszeit hat

    res.status(200).json({
        status: 'success',
    })
}


//Middlewarefunction    für protectet route, also die, die eingeloggt sind
exports.protect = catchAsync(async(req, res, next) => {
    //1.) Getting token and checking if exist

    let token;
    // let cookieWithName = "";
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) { //kommt von postman in headers, Authorization, Baerer hashIrgendwasToken
        //const token = req.headers.authorization.split(' ')[1]; das geht bei neuem es6 nicht, muss token outside von ifblock deklariert sein
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) { // (req.cookie.startsWith('jwt')) { //req.cookies.jwt)//(req.cookies.jwt) { 
        //cookieWithName = req.cookie.startsWith('jwt')
        // token = req.cookie.cookieWithName // token = req.cookie.jwt  jwt wie name in coockie
        token = req.cookies.jwt
    } // else if (!req.cookie.startsWith('jwt' || req.cookie === undefined)) {
    //     cookieWithName === ""
    // }

    //console.log("token: " + token)

    // check if token exist
    if (!token) { //|| cookieWithName === ""
        return next(new AppError('You are not logged in! Please log in to get access.', 401)) // 401 unauthorizied
    }



    //2.) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET) //callback // decoded payload von jwt, id von user
        //console.log("decoded Payload jwt: " + JSON.stringify(decoded)) // testen mit postman, getAllTours und header ein
        //JSONwebTokenError heisst, der webtoken wurde verändert, zb bei www.jwt.io     fehler kommt, zb anstatt von mongodb, kommt von jwt libary
        // try catch zum fehler behandeln, oder im errorController dort dies machen zu lassen

    //3.) Check if user still exist     wenn zb token gestohlen und user pw wechselt//
    const currentUser = await User.findById(decoded.id)

    if (!currentUser) {
        return next(new AppError('The user belonging to this token does no longer exist.', 401))
    }


    //das braucht es meiner meinung nach nicht. das ist schon zu professionell
    //4.) Check if user change password after the token was issued
    if (currentUser.changesPasswordAfter(decoded.iat)) { //iat = issuesAt
        return next(new AppError('User recently changed password! Please log in again!', 401))
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser // hier wird gebunden,,,,,,,,,,  // hier wird der user, mit all seinen angaben restored
    next(); // diese prodect middleware läuft immer zuerst
});


//video 190 für weis das logt in, ähnlich wie protect(entpoints api) aber für ??? rederet website für pug, nicht um route protecten
// Only for rendered pages, no creating errors!
exports.isLoggedIn = async(req, res, next) => { // hier catchasync weg, weil ein fehler beim logout durch anderes cookie an den apperror gesendet wird, obwohl hier drin kein apperror sit, weil wir nicht catch async errors
    if (req.cookies.jwt) {
        try {


            //1.) Verifytoken
            const decoded = await promisify(jwt.verify)( // schaut ob cookie einen token hat
                req.cookies.jwt,
                process.env.JWT_SECRET
            )

            //2.) Check if user still exist     wenn zb token gestohlen und user pw wechselt//
            const currentUser = await User.findById(decoded.id)

            if (!currentUser) {
                return next()
            }

            //3.) Check if user change password after the token was issued
            if (currentUser.changesPasswordAfter(decoded.iat)) { //iat = issuesAt
                return next()
            }

            // THERE IS A LOGGED IN USER
            res.locals.user = currentUser // hier wird gebunden,,,,, aber für renderet site// hier wird der user, mit all seinen angaben restored
            return next(); //hier hat cookie    muss return haben, sonst, next, und next wäre nest ohne cookie
        } catch (err) {
            return next() // THERE IS A LOGGED IN USER, cookie has not token
        }
    }
    next() // hier, wäre kein logged in user, weil kein cookie
};

//video 133 --> Postman TEST, DEV, PROD

//autorisierung --> Wenn User rechte hat, sobalt er eingeloggt ist, um zb etwas in der db zu löschen
//video 134
//restrictTo        middleware, gleich nach protect-middleware,

exports.restrictTo = (...roles) => { // wegen req.user, muss zuerst die middleware prodect laufen
    return (req, res, next) => {
        // roles ['admin', 'lead-guide ]. role = 'user'
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action!', 403)); //403 = forbidden
        }

        next();
    }
}


//video 135
exports.forgotPassword = catchAsync(async(req, res, next) => {
    // 1.) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email })

    if (!user) {
        return next(new AppError('There is no user with email adress', 404)); //404 not found
    }


    // 2.) Generate the random reset token (kein JWT- Token)
    const resetToken = user.createPasswordResetToken(); // createPasswordResetToken ist in userModel (not saved, onli modified)
    await user.save({ validateBeforeSave: false }); // save in db    // aber save geht nur, was wir in userModel haben, braucht ein namen, braucht...
    //deaktiviert alle validators in schema mongodb


    // 3.) sended back as an email      protokoll htttp oder https
    const resetURL = `${req.protokol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}}` // stored in res.protokoll

    const message = `Forgot your Password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf 
    you didn' t forget your password, please ignore this email!`;

    //send email
    try {
        await sendEmail({
            email: user.email, // oder req.body.email ist das gleiche
            subject: 'Your password reset token (valid for 10 min)',
            message
        })

        res.status(200).json({
            status: 'success',
            message: 'Token send to email!' // resettoken kann nicht über eine mail verschickt werden, aber email ist ein sicherer ort, wo nurt user zugriff hat
        })
    } catch (err) {
        //token reseten und die usreigenschaften zurücksetzen
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined; // das modified the data, but not save!
        await user.save({ validateBeforeSave: false }); // save in db    // aber save geht nur, was wir in userModel haben, braucht ein namen, braucht...
        //deaktiviert alle validators in schema mongodb

        return next(new AppError('There was an error sending the emaily. Try again later!', 500)); //500= error happen on server
    }


});

//video 137
exports.resetPassword = catchAsync(async(req, res, next) => {
    // 1.) Get user based on the token
    // token send in url is not encryptet token
    // the one we have in the db is the encryptet one
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex'); // weil in url bei userRoute ist resetToken/:token
    // weil heisst /:token, desshalb req.param.token

    //token is in this moment the onli thing, you know about user, so token comes from db
    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } })
        // nun aber das ablaufdatum berücksichtigen

    // 2.) If token has not expired, and there is user, set the new password
    if (!user) {
        return next(new AppError('Token is invalid or is expired', 400)); //400=bad request
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined; // not save, is onli modifined dokument

    await user.save(); // save in db  Hier wollen wir aber validaten



    // 3.) Update changedPasswordAT property for the user
    // ging nicht weiter darauf ein

    // 4.) Log the user in, send JWT
    // If everything is ok, send token to client
    // const token = signToken(user._id)

    // res.status(200).json({
    //     status: 'success',
    //     token
    // })
    createSendToken(user, 200, res)
});


// ist nur für loged in Users
exports.updatePassword = catchAsync(async(req, res, next) => {
    // 1.) Get user from the collection
    const user = await User.findById(req.user.id).select('+password'); // der user kommt von der protect middleware, und passwort not includet

    // 2.) Check if POSTed current password is correct
    if (!await user.correctPassword(req.body.passwordCurrent, user.password)) { //dass ist middleware in usermodel
        return next(new AppError('Your current password is wrong', 401)); //unauthorized
    }

    // 3.) if so, update the password
    user.password = req.body.password; // wird erst modified, nicht gespeichert
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save(); //muss validiert werden
    // nicht await user.findByIdAndUpdate()!!   weil in usermodel validator nur work with save und pre-save middleware also not work

    // 4.) logt user in, send JWT
    // const token = signToken(user._id)

    // res.status(200).json({
    //     status: 'success',
    //     token
    // })
    createSendToken(user, 200, res)
});