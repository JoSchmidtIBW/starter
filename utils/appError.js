class AppError extends Error {
    constructor(message, statusCode) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;


// class AppError extends Error { // sind operational errors

//     constructor(message, statusCode) {
//         super(message);

//         this.statusCode = statusCode;
//         this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; // wenn mit 4 fails, sonst error 500
//         this.isOperational = true; //create isOperational

//         // Error.captureStackTrace(this, this.constructor); muss in constructor rein
//         Error.captureStackTrace(this, this.constructor);
//     }


// }

// module.exports = AppError;