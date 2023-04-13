const mongoose = require('mongoose')
const dotenv = require('dotenv');

//video 123 uncalled exception bugs im code         SPàTER reinmachen, sonst sieht man nicht, wo genau der Fehler!!!!
// process.on('uncaughtException', err => {

//     console.log('UNCAUGHT EXCEPTION! Shutting down...')
//     console.log("Beendige den Prozess...");
//     console.log("--> err.name: " + err.name + " , err.message: " + err.message);
//     // server.close(() => { // damit server noch alle request verarbeiten kann, nicht aprupt schliesst
//     //     process.exit(1); //0 for success, 1 uncalled subjection
//     // });server hier nicht definiert, aber hier auch kein server fehler
//     process.exit(1);
// });

dotenv.config({ path: './config.env' }); //Achtung, die Zeile, woe es steht, ist wichtig

const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
    // mongoose.connect(DB, {
    //     useNewUrlParser: true,
    //     useCreateIndex: true,
    //     useFindAndModify: false
    // }).then(con => {
    //     console.log(con.connections),
    //         console.log('DB connection succeful!')
    // })

mongoose.connect(DB, { //hostet db 
    //mongoose.connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
}).then(() => console.log('DB connection succeful!')); //.catch(err => console.log('ERROR DB-Connecting'))


// const tourSchema = new mongoose.Schema({
//     name: String,
//     rating: Number,
//     price: Number
// })






console.log("app.get('env'): " + app.get('env'));
//console.log("app.get('status'): " + app.get('status'))
//console.log(process.env)



// 4. start server
const PORT = process.env.PORT || 4301

const server = app.listen(PORT, () => {
    console.log(`App running on port ${PORT}...`)
    console.log(`Server running on port: http://localhost:${PORT}...in Browser with no cookie Nicht https`);
    console.log(`Server running on port: http://127.0.0.1:${PORT}...in Browser with cookie nicht https`);
})

const x = 66;
let a = 5
    //x = 5;


//TEST COMMENT NDB//////////

//für unhandled error, zb db connecting... unvorhersehbar   video 122
process.on('unhandledRejection', err => {
    console.log("Etwas ist unvorhersehbar passiert: err.name: " + err.name + " , err.message: " + err.message);
    console.log('UNHANDLER REJECTION! Shutting down...')
    console.log("Beendige den Prozess...");
    server.close(() => { // damit server noch alle request verarbeiten kann, nicht aprupt schliesst
        process.exit(1); //0 for success, 1 uncalled subjection
    });

});




// //video 123 uncalled exception bugs im code 
// process.on('uncaughtException', err => {

//     console.log('UNCAUGHT EXCEPTION! Shutting down...')
//     console.log("Beendige den Prozess...");
//     console.log("--> err.name: " + err.name + " , err.message: " + err.message);
//     server.close(() => { // damit server noch alle request verarbeiten kann, nicht aprupt schliesst
//         process.exit(1); //0 for success, 1 uncalled subjection
//     });
// });
//console.log(ww) //ww dosen t exst in code   process.on('uncaughtException'.. muss zuerst geschrieben werden oberhalb von ww