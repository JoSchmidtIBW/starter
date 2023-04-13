const fs = require('fs')
const express = require('express')
const morgan = require('morgan')

const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')

// import express from 'express'
// import fs from 'fs'
// import __dirname from '__dirname'

let u = "jnidd"


const app = express()


// 1. middleware5
console.log("process.env.NODE_ENV: " + process.env.NODE_ENV)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

app.use(express.json()) //für post (daten von client zu bekommen), muss json sein

//um auf html css zuzugreifen, was jedoch eine API nicht macht
app.use(express.static(`${__dirname}/public`))



// my middleware
app.use((req, res, next) => {
    console.log("Hello from the Mittdleware :)")
    next()
})

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString()
    next()
})


// 3. routes    mounting router
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;