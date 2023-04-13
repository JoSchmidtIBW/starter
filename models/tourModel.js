const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator')
    //const User = require('./userModel')

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        requires: [true, 'A Tour must have a name'], //validator
        unique: true, // nicht zwei mit selben Namen, kein validator
        trim: true, // nama und nicht leerzeichenNameLeerzeichen
        maxlength: [40, 'A tour name must have less or equal then 40 characters'], //validator
        minlength: [10, 'A tour name must have more or equal then 10 characters'], //validator
        //validate: [validator.isAlpha, 'Tour name must only contain characters and no spaces'] // github --> validator     npm i validator
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a Duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a groupe size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: { //geht nur bei strings, nicht bei nummern
            values: ['easy', 'medium', 'difficult'], // validator, kann nur drei sachen eingeben,
            message: 'Difficulty is either: easy, medium, difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5, // min max, geht nicht nur bei nummern, auch bei datum
        min: [1, 'Rating must be above 1.0'], //validators           bei tourcontroller / runValidators: true /
        max: [5, 'Rating must be below 5.0'], //validators           bei tourcontroller / runValidators: true /
        set: val => Math.round(val * 10) / 10, // Math.round macht aus 4.666667-->5, wie wollen 4.7 --> 4.6667*10 = 46.6667 --> round = 47 --> /10=4.7
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a Price']
    },
    priceDiscount: { // eigener validator, welcher schaut, ob pricediscount grösser= als price
        type: Number,
        validate: {
            validator: function(val) { // funktion geht nur bei create, nicht bei update        https://github.com/validatorjs/validator.js
                // this only point for current doc on NEW DOCUMENT creation                     npm i validator
                return val < this.price //pD = 100 price = 200  100 <200 true   250<200 false
            },
            message: 'Discount price ({VALUE}) should be below the regular price' // VALUE hat zugriff auf priceDiscount val
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A Tour must have a desription']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A Cover must have a Image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false //dann sieht man nicht 
    },
    startDate: [Date],
    secretTour: {
        type: Boolean,
        default: false,
    },
    startLocation: {
        //GeoJson   das sind subFields  EMBEDED Dokuments       TOUR is parent
        type: {
            type: String,
            default: 'Point',
            enum: ['Point'], // kann nur point sein
        },
        coordinates: [Number], // expect a array of numbers
        adress: String,
        description: String,
    },
    locations: [{
        type: {
            type: String,
            default: 'Point',
            enum: ['Point'],
        },
        coordinates: [Number],
        adress: String,
        description: String,
        day: Number,
    }],
    //guides: Array, // hier wird der user hineingeschrieben  EMBADDING mit der Pre- Save funktion VIDEO 151
    // in Postman bekommt man alle Daten von user in einer tour
    //     {
    //         "role": "admin",
    //         "_id": "6420daf8fe4c2d18107505dc",
    //         "name": "admin",
    //         "email": "admin@jonas.io",
    //         "__v": 0,
    //         "passwordChangeAt": "2023-03-30T00:18:41.646Z"
    //     }
    // ],
    // "_id": "6427073a8ed4617a9818f914",
    // "name": "The Test Tour",
    guides: [ // referrences   sind auch sub-documents, embedded dokuments
        {
            type: mongoose.Schema.ObjectId, // es wird erwartet das es eine Mongo- ID ist   ObjectId muss grosses O haben
            ref: 'User', //referenz zu User     USER muss oben dafür nicht importet sein
        }
    ],
    //in postman bekommt man nur die ID dazu
    // "guides": [
    //     "6426c4604e93f288b8cdb610",
    //     "6420daf8fe4c2d18107505dc"
    // ],
    // "_id": "64270fb4e2aa741650a4af58",

    // reviews: [ // parent tour will children kennen      implement child-referencing     the tout reference to reviews   aber das wollen wir nicht
    //     {
    //         type: mongoose.Schema.ObjectId,
    //         ref: 'Review',
    //     }
    // ],

    //anstatt child referencing wollen wir virtual populate speichert nicht in db       das machen wir in tourSchema

}, { //virtuele eigenschaften video 104  kann nicht sagen, tour.find where durationweeks = 7 weil nicht in db
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});


//video167  suchen nach id, nicht jedes dokument abklappern bis findet, zb wenn millionen von dokuments, index on price
//tourSchema.index({ price: 1 }) // 1 =      -1 = desending order
// testen in postman: {{URL}}api/v1/tours?price[lt]=1000
tourSchema.index({ price: 1, ratingsAverage: -1 })
tourSchema.index({ slug: 1 })
tourSchema.index({ startLocation: '2dsphere' })

// video 104 virtuals properties - virtuelle eigenschaften, welche sich nicht lohnen, um in eine DB zu speichern, zb miles und kilometer umrechnung
// das ist buisness- logik
tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
})

//video 157
// Virtual populate
tourSchema.virtual('reviews', { //forenfield and localfield
    ref: 'Review',
    foreignField: 'tour', //in reviewModel hat es tour, wo id tour gespeichert
    localField: '_id', //
})

// video 105 Middleware in Mongoose, pre- pro hooks, 4 typen von middleware pre, post, query, agregation
// pre run befor a event, zb befor speicher
// DOCUMENT MIDDLEWARE: runs before .save()  .create(), aber nicht bei  .insertMany() oder findbyid update()...
// um diese funktion auszulösen, mit comand .save() oder .create() --> braucht neue route...
// npm i slugify, slug ist string...
// pre-save-hook or pre-save-middleware
// hook ist 'save'
// save ist document-middleware
tourSchema.pre('save', function(next) {
    // this --> ist der currently prozess dokument
    //console.log("bin tourModel Middleware, zeige This, bevor save in db bei einem post")
    //console.log("this: " + this)
    this.slug = slugify(this.name, { lower: true });
    next(); // slug: string muss dafür ins schema// wenn next auskommentiert, bei post, kommt kein fehler, aber ladet und ladet...
})

// DOKUMENT MIDDLEWARE
//
// video 151    jedes mal wenn tour save    implement embedding user in tourguide   
// funktioniert nur für creating tours, not for updating tours        tourModel:      guides: Array,
// tourSchema.pre('save', async function(next) { // guidePromises ist ein array full of promises
//     const guidesPromises = this.guides.map(async id => await User.findById(id)); //User.findById(id) diese id ist die current id, mit await 
//     this.guides = await Promise.all(guidesPromises)
//     next();
// });

// video 152 referenc anstatt embadding


// //multible post pre for the same hook
// tourSchema.pre('save', function(next) {
//     console.log("bin pre-save-hook: will save document...")
//     next();
// })


// // hat zugriff auf dok (welches gespeichert wurde) und next
// // post middleware wird ausgeführt, nachdem alle pre middleware ausgeführt wurden
// // hier hat man kein this mehr, dafür finish doc
// tourSchema.post('save', function(doc, next) {
//     console.log("bin post- middleware tourModel: und doc: " + doc)
//     next();
// })


//video 106 query-Middleware, läuft bevor eine Abfrage gemacht wird 
// pre-find
// QUERY MIDDLEWARE
// hook ist 'find'
// find ist query-middleware
// this geht nicht aufs aktuelle dokument, sonder auf aktuelle query (anfrage)
// zb um geheime touren anzubieten, für vip, nicht für alle
// in schema: secretTour:  type: boolean
//tourSchema.pre('find', function(next) {
tourSchema.pre(/^find/, function(next) { // alle comand, who start with find dürfen nicht
        this.find({ secretTour: { $ne: true } }) // finde alle , die nicht secret true sind bei getalltours, ist die secrettour weg
        this.start = Date.now() //für post find middleware, um eine uhr zu machen
        next()
    })
    // in mongo Compass, zwigt 12 Touren, in postman 11
    // läuft nur bei find(), nicht bei findOne(), damit nicht sieht, braucht auch für findone hook aber das nicht sooo gut

// tourSchema.pre('findOne', function(next) {
//     this.find({ secretTour: { $ne: true } }) // finde alle , die nicht secret true sind bei getalltours, ist die secrettour weg
//     next()
// })

//Video 153 querry-middleware   dublicatet code bei getTour getAllTours mit populate('guide')
tourSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangeAt' // was man nicht sehen möchte bei output
    })

    next();
});

//für find post
// läufter after find executed
tourSchema.post(/^find/, function(docs, next) {
    // currenttime - starttime
    console.log(`Query took ${Date.now()-this.start} milliseconds`)
        //console.log('bin post find middleware, docs: ' + docs)
    next();
})


//video 107 agregation middleware
// um auch die geheime tour auszuschliessen, wenn durchschnitt sachen in einer DB ausgegeben werden Tour-Stats
// AGGREGATION MIDDLEWARE
// pre-aggregate-hook
// tourSchema.pre('aggregate', function(next) {
//     //console.log(this) // this, wenn aggregate gemacht wird
//     this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }) //unshift() um im array im ersten was hinzuzufügen, shift() für end of array   add stage

//     console.log(this.pipeline()) //sehe wie bei aggregate in tourcontroller, und hier ausschliessen secrettour
//     next();
// })


const Tour = mongoose.model('Tour', tourSchema) //grossgeschrieben


module.exports = Tour;

// const testTour = new Tour({
//     name: "The Park Camper",
//     price: 99.97
// })

// testTour.save().then(doc => {
//     console.log(doc)
// }).catch(err => {
//     console.log('ERROR doc save... : ', err)
// })