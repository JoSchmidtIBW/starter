const nodemailer = require('nodemailer')


const sendEmail = async options => { //option ist eine funktion
    // 1.)  Create a transporter
    const transporter = nodemailer.createTransport({
        //service: 'Gmail', // kommt von nodemailer, gibt auch yxahoo, hotmail
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        }
        // Activate in Gmail-Account "less secure app" option

        // in echtt, aufpassen, sonst 100te mail zu gmail, dann wäre spamer, und nicht für so eine webapp geeignet
        //https://mailtrap.io/home
    })

    // 2.) Define the mail options
    const mailOptions = {
        from: 'Max Muster <maxmuster@muster.io>',
        to: options.email, // funktion "options" von sendEmail = options => {}
        subject: options.subject,
        text: options.message,
        //html: 
    }

    // 3.) Actually send the email
    await transporter.sendMail(mailOptions) //return ein promise
}

module.exports = sendEmail