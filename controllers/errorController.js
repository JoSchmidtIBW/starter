const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    console.log(value);

    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
};
const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);

    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};


// const handleJWTError = err => new AppError('Invalid token, please log in again!', 401) //401 unauthorizate    // works onli in production

// const handleJWTExpiredError = err => new AppError('Your token has been expired! Please log in again!', 401)

const handleJWTError = () => new AppError('Invalid token, please log in again!', 401) //401 unauthorizate    // works onli in production

const handleJWTExpiredError = () => new AppError('Your token has been expired! Please log in again!', 401)

const sendErrorDev = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) { //wenn url hat /api, bei error, sende json //originalUrl = url not with the host
        // A) API
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } //else { // wenn url nicht mit /api bei error drin, dan rendere page
    // B) RENDERED WEBSITE
    console.error('ERROR 💥', err);
    return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message,
        })
        //}

};

const sendErrorProd = (err, req, res) => {
    // A) API 
    if (req.originalUrl.startsWith('/api')) { //wenn url hat /api, bei error, sende json //originalUrl = url not with the host
        // aa) Operational, trusted error: send message to client
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });

            // Programming or other unknown error (from server): don't leak error details
        }
        // bb) 1) Log error
        console.error('ERROR 💥', err);

        // 2) Send generic message
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        });

    }

    // wegen eslint, hier kein else danach

    // B) RENDERED WEBSITE
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        console.error('ERROR 💥', err.message);
        return res.status(err.statusCode).render('error', { // status 
            title: 'Something went wrong!',
            msg: err.message,
        })


    } //else {
    // B) Programming or other unknown error (from server): don't leak error details
    // 1) Log error
    console.error('ERROR 💥', err);

    // 2) Send generic message
    return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: 'Please try again later.', //err.message,
        })
        //}


};

module.exports = (err, req, res, next) => {
    // console.log(err.stack);

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {

        let error = Object.create(err);

        if (err.name === 'CastError') error = handleCastErrorDB(err);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
        //if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
        //if (error.name === 'TokenExpiredError') error = handleJWTExpiredError(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

        // let error = {...err };// kopie von err
        // error.message = err.message

        // if (error.name === 'CastError') error = handleCastErrorDB(error);
        // if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        // if (error.name === 'ValidationError')
        //     error = handleValidationErrorDB(error);


        console.log("Err_PROD: " + err.message)
        console.log("Error_POD: " + error.message)
        sendErrorProd(error, req, res);
    }
};


//************************************************************************************************
// const AppError = require("../utils/appError");

// // zum testen get one Tour http://127.0.0.1:4301/api/v1/tours/123456789121
// const handleCastErrorDB = err => {
//     const message = `Invalid ${err.path}: ${err.value}.`;
//     return new AppError(message, 400); // 400 = bad request
// }

// //zum testen:  post create tour "The forrest Hiker"     run in production
// const handleDublicateFieldsDB = err => {
//     const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
//     console.log("value err.errmsg: " + value)
//     const message = `Dublicate field value: x. Please use another value`;
//     return new AppError(message, 400);
// }

// //video 121
// const handleValidationErrorDB = err => { // loop über alle Errors in DB
//     const errors = Object.values(err.errors).map(el => el.message)
//     const message = `Invalid input-data. ${errors.join('. ')}`;
//     return new AppError(message, 400);
// }

// const sendErrorDev = (err, res) => {
//     res.status(err.statusCode).json({
//         status: err.status,
//         error: err,
//         message: err.message + ' bin sendErrorDev, bin errorHandling-Middleware bei app.js',
//         stack: err.stack
//     });
// }


// const sendErrorProd = (err, res) => {
//     // operational, trustet error: send message to client
//     if (err.isOperational) { // nur wenn fehler operationFehler ist
//         res.status(err.statusCode).json({
//             status: err.status,
//             message: err.message + 'bin sendErrorProd, ist operation - Error bin errorHandling-Middleware bei app.js',
//         });

//         // Programming or other unknown error: don't leak error details    
//     } else {
//         // 1.) log error
//         console.error('ERROR', err);

//         // 2.) send generic message
//         res.status(500).json({
//             status: 'error',
//             message: 'Something went very wrong!'
//         })
//     }


// }

// module.exports = (err, req, res, next) => {

//     // stackTrace 
//     //console.log("err.stack(Trace): " + err.stack);

//     //default error-status-code
//     err.statusCode = err.statusCode || 500;
//     err.status = err.status || 'error';

//     if (process.env.NODE_ENV === 'development') {
//         sendErrorDev(err, res);
//     } else if (process.env.NODE_ENV === 'production') {
//         // fehler von MongoDB aber oprerational errors
//         // mache copie von err
//         let error = {...err };

//         if (error.name === 'CastError') error = handleCastErrorDB(error);
//         if (error.code === 11000) error = handleDublicateFieldsDB(error);
//         if (error.name === 'ValidationError') error = handleValidationErrorDB(error);


//         sendErrorProd(error, res);
//     }


// }


//------------------------------------------------------------
// module.exports = (err, req, res, next) => {

//     // stackTrace 
//     //console.log("err.stack(Trace): " + err.stack);

//     //default error-status-code
//     err.statusCode = err.statusCode || 500;
//     err.status = err.status || 'error';

//     if (process.env.NODE_ENV === 'development') {
//         res.status(err.statusCode).json({
//             status: err.status,
//             error: err,
//             message: err.message + ' bin errorHandling-Middleware bei app.js',
//             stack: err.stack
//         });
//     } else if (process.env.NODE_ENV === 'production') {
//         res.status(err.statusCode).json({
//             status: err.status,
//             message: err.message + ' bin errorHandling-Middleware bei app.js',
//         });
//     }


// }