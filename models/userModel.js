const crypto = require('crypto')
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A User must have a name!'],
    },
    email: {
        type: String,
        required: [true, 'Please provide your email!'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please profide a valid email'],
    },
    photo: String,
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin', 'Chef', 'Bediener'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false, //damit passwort nicht sieht in postman, oder browser
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            // This only works on CREATE and SAVE, not for Update  (auch nicht bei ... user aktualisiert pw )
            validator: function(el) { // das ist die Funktion die überprüft, ob PW gleich pwConfirm     el ist element_passwortConfirm
                return el === this.password; //return true or false     viedeo 127      abc === abc --> true
            },
            message: 'Passwords are not the same!'
        }
    },
    passwordChangeAt: Date, // hier wurde noch nicht gross darauf eingegagen, aber es braucht es
    passwordResetToken: String,
    passwordResetExpires: Date, // damit resetToken abläuft
    active: { // um zb User inaktiv zu machen, // video 140
        type: Boolean,
        default: true, // aktiver user, boolean = true
        select: false, // zeigt nicht im output ob aktiv oder inaktive
    }
})

//hier auch Passwort hash machen, weil es mit datenmodel zu tun hat und nicht im controller video 127   bruteforce- Angriff (wenn Hacker auf db zugreifen kann, und alle pw sieht)
// document pre-save-middleware
// pre-hook-on-save middleware  runs between getting data, and saving data, when daten in db save gemacht wird!
//comment this out for import data
userSchema.pre('save', async function(next) { // password nur encypt, wenn update or new      zb wenn user update email, dann nicht pw
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return next(); //this is the actuelle dokument        isModified ist funktion, wenn etwas im dokument gerade geändert wird, braucht name des fields, das geändert wird
    // wenn nicht das pw geändert, mache next, gehe zur nächsten middleware, ansonsten, bleibe drin
    // npm i bcryptjs

    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12) //16 braucht sehr lange // default is 10      .hash (ist ein promise, braucht await) is asynchron version, sinchron version nicht nehmen, weil diese die anderen user ausbremst, bis fertig ist
        // danch muss confirmpasswort gelöscht werden, weil nur noch hashpasswort gibt, mit set to undefined
        // Delete the passwordConfirm field
    this.passwordConfirm = undefined; //requrierd Input, not input in database
    next(); // confirmpw braucht es nur am anfang, damit user kein fehler macht
    //ToDo hier könnte mann cryptojs nehmen, dann kann man pw wiederherstellen mit secret key
});

//video 137 email reset
//comment this out for import data
userSchema.pre('save', async function(next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangeAt = Date.now() - 1000; // -1000 = - 1sec in der Vergangenheit, weil tooken schneller generiert wurde, als gespeichert
    next();
});

//video 140, wenn user deleteME, sein account inactive, nicht aber gelöscht von db, und damit man nicht sieht bei getalluser, nur sieht alle activen accounts
//passiert bevor query, das mach find
userSchema.pre(/^find/, function(next) { // alles was mit find... startet
    // this points to the current query

    // also, bevor User.find() gemacht wird in dieser Methode
    //exports.getAllUsers = catchAsync(async(req, res, next) => {
    // const users = await User.find();

    //this.find({ active: true });// dann zeigt es aber in getalluser gar keine user mehr an, weil ev die vorhandenen das noch nicht haben
    this.find({ active: { $ne: false } });
    next();
})

//funktion, um hashpasswort wieder encrypten zu normal
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    //this.password   geht nicht, weil passwort ist secret=false

    // candidatepasswort comming from user, is not hash, userPasswort is hash
    return await bcrypt.compare(candidatePassword, userPassword) //asynchron funktion
        //compare return true if passwort is same, or false 
}


//video 132 20min..     wechselt passowrt nach jwt webtoken bei protected middlware, nr 4 in authcontroller
userSchema.methods.changesPasswordAfter = function(JWTTimestamp) {
    // return false, --> user has not change passwort after the token was isued  nachdem der token ausgestellt wurde
    if (this.passwordChangeAt) { //wenn user nie passwort gewechselt hat, existiert das hier nicht
        //console.log("passwordChangeAt, JWTTimestamp: " + passwordChangeAt, JWTTimestamp)  //ausgabe was mit millisekunden 

        const changedTimestamp = parseInt(this.passwordChangeAt.getTime() / 1000, 10) //base is 10 numbers
        console.log("changedTimestamp, JWTTimestamp: " + changedTimestamp, JWTTimestamp)
        return JWTTimestamp < changedTimestamp; // token time 100, pw chaged time 200
    }

    // false means not changed
    return false; //token time 300, pw chaged time 200
}

//video 135
userSchema.methods.createPasswordResetToken = function() {
    //passwort- reset- token should be a randomString
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    console.log({ resetToken }, this.passwordResetToken) // logged as an object resetToken32, und resetTokenHash

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //10*60*1000 = 10 minutes      not saved in db, onli modified

    return resetToken;
}

const User = mongoose.model('User', userSchema); //grossgeschrieben

module.exports = User;
//export default User;