const path = require('path')
const fs = require('fs')
const express = require('express')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean')
const hpp = require('hpp')
const cors = require('cors') //nicht tutorial
const cookieParser = require('cookie-parser')


const AppError = require('./utils/appError')
const globalErrorHandler = require('.//controllers/errorController') //globalError..., kann nennen wie man möchte
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const viewRouter = require('./routes/viewRoutes')

// import express from 'express'
// import fs from 'fs'
// import __dirname from '__dirname'

let u = "jnidd"


const app = express()

//begining of the app
app.set('view engine', 'pug') //oder ejs
    //app.set('view engine', 'ejs') //oder ejs
    //app.set('views', './views')// aber besser nicht so
app.set('views', path.join(__dirname, 'views')) // slash /views// mit path, könnte bug geben mit /\- im pfad

// 1. GLOBAL MIDDLEWARES

// Serving static files
//um auf html css zuzugreifen, was jedoch eine API nicht macht
//app.use(express.static(`${__dirname}/public`))
app.use(express.static(path.join(__dirname, 'public'))) //wurde hier plaziert, unter app.set views

// use cors before all route definitions  nicht von tutorial
app.use(cors({ origin: 'http://localhost:4301' }));


// Set securtity HTTP headers
app.use(helmet()); // sollte hier am anfang der mittdleware stehen,und nicht am schluss
//nicht von tutorial
// app.use(
//     helmet.contentSecurityPolicy({
//         directives: {
//             defaultSrc: ["'self'"],
//             baseUri: ["'self'"],
//             fontSrc: ["'self'", 'https:', 'data:'],
//             scriptSrc: ["'self'", 'https://cdnjs.cloudflare.com/ajax/libs/axios/0.20.0/axios.min.js'],
//             objectSrc: ["'none'"],
//             styleSrc: ["'self'", 'https:', 'unsafe-inline'],
//             upgradeInsecureRequests: [],
//         },
//     })
// );

// fast original
// app.use(helmet.contentSecurityPolicy({
//     directives: {
//         defaultSrc: ['\'self\'', "'unsafe-inline'", 'self', 'unsafe-inline'],
//         baseUri: ["'self'"],
//         fontSrc: ["'self'", 'https:', 'data:'],
//         scriptSrc: ['\'self\'', "'unsafe-inline'", "'unsafe-eval'", 'cdnjs.cloudflare.com', 'code.jquery.com'], //, 'cdn.datatables.net'],
//         connectSrc: ['\'self\'', 'http://localhost:4301', 'http://127.0.0.1:4301'], //, 'http://localhost:4301', 'http://127.0.0.1:4301'
//     },
// }))

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
                baseUri: ["'self'"],
                fontSrc: ["'self'", 'https:', 'data:'],
                scriptSrc: [
                    "'self'",
                    'https:',
                    'http:',
                    'blob:',
                    'https://*.mapbox.com',
                    'https://js.stripe.com',
                    'https://m.stripe.network',
                    'https://*.cloudflare.com',
                ],
                frameSrc: ["'self'", 'https://js.stripe.com'],
                objectSrc: ["'none'"],
                styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
                workerSrc: [
                    "'self'",
                    'data:',
                    'blob:',
                    'https://*.tiles.mapbox.com',
                    'https://api.mapbox.com',
                    'https://events.mapbox.com',
                    'https://m.stripe.network',
                ],
                childSrc: ["'self'", 'blob:'],
                imgSrc: ["'self'", 'data:', 'blob:'],
                formAction: ["'self'"],
                connectSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    'data:',
                    'blob:',
                    //'https://*.stripe.com',
                    //'https://*.mapbox.com',
                    //'https://*.cloudflare.com/',
                    //'https://bundle.js:*',
                    'ws://127.0.0.1:*/',

                ],
                upgradeInsecureRequests: [],
            },
        },
    })
);

// das oben würde ev auch so gehen: mit einer middleware
// app.use((req, res, next) => {
//     res.set(
//       'Content-Security-Policy',
//       'connect-src *'
//     );
//     next();
//   }); 



// *
// Default: `default-src 'self' 'unsafe-inline' data:;` *
//     `script-src 'self' 'unsafe-eval' 'unsafe-inline' data:` *
//     /
// devContentSecurityPolicy ? : string;

// app.use(
//     helmet({
//       contentSecurityPolicy: false,
//     })
//   );


// app.use(function (req, res, next) {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//     next();
// });



// Development logging
console.log("process.env.NODE_ENV: " + process.env.NODE_ENV)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}


// Limit request from same API
// global middlewares limiter   für denial-of-service and brute-force- angriffe
const limiter = rateLimit({ // how many request erlaubt in einer zeit, von der selben ip
        max: 100, // 100 request from the same IP
        windowMS: 60 * 60 * 1000, // window-time MS in miliseconds    1h
        message: 'Too many requests from this IP, please try again in an hour!'
    })
    //app.use(limiter)
app.use('/api', limiter)


// Body parser, reading data from body into req.body
//app.use(express.json()) //für post (daten von client zu bekommen), muss json sein
// parst data from body
app.use(express.json({ limit: '10kb' })) // um daten 
    //parse data from cookies
app.use(cookieParser())

// after the bod-parser, Sicherheit für datenbereinigung
// Data sanatisation against NoSQLquery injection

// bsp: bei postman, login als: // oder in compass: {"email": {"$gt": ""}} bei filter, mit {}
// {
//     "email": {"$gt": ""},
//     "password": "newpassword"
// }
app.use(mongoSanitize()); // filtert alle dollarzeichen usw heraus

// after the bod-parser, Sicherheit für datenbereinigung
// Data sanatisation against XSS    cross-site-scriptingAttaks
app.use(xss()) // clean user-input von bösartige html- sachen

// {
//     "email": "tester@jonas.io",
//     "password": "pass1234",
//     "passwordConfirm": "pass1234",
//     "name": "<div id='bad_code'>böse</div>"  --> in postman kommt: "name": "&lt;div id='bad_code'>böse&lt;/div>",
// }

// Prevent parameter prolution  clearup the querystring {{URL}}api/v1/tours?sort=duration&sort=price mit zweimal sort, was nicht geht   benutzt nur noch den letzten sort!
//app.use(hpp()) // wenn deaktiviert, {{URL}}api/v1/tours?duration=5&duration=9 kommen drei ansonsten eine
app.use(hpp({
    whitelist: [ // erlaubt dublicatet in querystring
        'duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price' //{{URL}}api/v1/tours?duration=5&duration=9  muss eingeloggt sein und barer-token    {{URL}}api/v1/tours?sort=duration&sort=price
    ]
}))

// Serving static files
//um auf html css zuzugreifen, was jedoch eine API nicht macht
//app.use(express.static(`${__dirname}/public`))
//app.use(express.static(path.join(__dirname, 'public')))


// my middleware
// app.use((req, res, next) => {
//     console.log("Hello from the Mittdleware :)")
//     next()
// })

// Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    //console.log(qqq)
    //console.log("app.js, req.headers: " + req.headers) //http-headers, client send  [object, object]
    //console.log(JSON.parse(req.headers)) gibt fehler unexpect token
    // console.log(JSON.stringify(req.headers)) //http://127.0.0.1:4301/api/v1/tours mit value: Authoriazation und Bearer hashirgendwasToken
    console.log("Bin Test middleware: " + JSON.stringify(req.cookies))
    next()
})


// 3. routes    mounting router
// app.get('/', (req, res, ) => {
//         res.status(200).render('base', {
//             tour: 'The Forrest hiker',
//             user: 'Jonas',
//         })
//     })
//     // app.get('/ejs', (req, res, ) => {
//     //     res.status(200).render('basee')
//     // })

// app.get('/overview', (req, res) => {
//     res.status(200).render('overview', {
//         title: 'All Tours',
//     })
// })

// app.get('/tour', (req, res) => {
//     res.status(200).render('tour', {
//         title: 'The Forrest Hiker Tour',
//     })
// })

//aAPI- Routes
app.use('/', viewRouter) // sollte der erste sein
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

//um falsche urls eine fehlermeldung zu geben, muss dies unter den routen passieren
// für all, get post put delete--> all      404 for not found
//http://127.0.0.1:4301/api/tours       --> v1 zb nicht in url
app.all('*', (req, res, next) => {
    // res.status(404).json({
    //     status: 'fail',
    //     message: `Can's find ${req.originalUrl} on this server!`
    // })

    //um fehler zu erzeugen, damit error-handling-middleware getestet werden kann
    // const err = new Error(`Can's find ${req.originalUrl} on this server!`);
    // err.status = 'fail';
    // err.statusCode = 404;

    //next(err); // error übergeben
    next(new AppError(`Can's find ${req.originalUrl} on this server!`, 404))
})


// operation error   --> kann man nicht vorhersagen, zb user falsche url
//                         failed connect server, database
//                         falsche user eingaben
//                  das sind errorhandling in express
//
// programm erros  -->  redeanig undefined
//      
//error-handling-Middleware video 115
// app.use((err, req, res, next) => {

//     // stackTrace 
//     console.log("err.stack(Trace): " + err.stack);

//     //default error-status-code
//     err.statusCode = err.statusCode || 500;
//     err.status = err.status || 'error';

//     res.status(err.statusCode).json({
//         status: err.status,
//         message: err.message + ' bin errorHandling-Middleware bei app.js'
//     });
// })

app.use(globalErrorHandler)

module.exports = app;