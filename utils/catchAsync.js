// video 117
// const catchAsync = fn => { // fn = function
//     return (req, res, next) => { //anonymus function
//         //fn(req, res, next).catch(err => next(err));//catch(next)
//         fn(req, res, next).catch(next);
//     };
// };

module.exports = fn => { // fn = function
    return (req, res, next) => { //anonymus function
        //fn(req, res, next).catch(err => next(err));//catch(next)
        fn(req, res, next).catch(next);
    };
};