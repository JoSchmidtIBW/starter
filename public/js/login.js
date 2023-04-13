/* eslint-disable */

import axios from 'axios'
import { showAlert } from './alerts'

export const login = async(email, password) => {
    //alert(email)
    console.log(email, password)
        //alert(`${email}, ${password}`);
        //alert(` ${password}`);

    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:4301/api/v1/users/login', //http://127.0.0.1:3000/api/v1/users/login => http://localhost:3000/api/v1/users/login
            data: {
                email: email,
                password: password,
            }
        })

        if (res.data.status === 'success') { // das ist der gesendete status in data
            //alert('Logged in successfully!');
            showAlert('success', 'Logged in successfully!')
            window.setTimeout(() => {
                location.assign('/'); //wie redirect
            }, 1500)
        }


        //console.log(res)
    } catch (err) {
        console.log(JSON.stringify(err.response.data) + " bin login in login.js") // kommt von axios documentation
            // alert(JSON.stringify(err.response.data.message) + " bin login in login.js") // data ist data-responce
        showAlert('error', JSON.stringify(err.response.data.message) + " bin login in login.js")
            //console.log(JSON.parse(err.response.data) + " bin login in login.js")
            //console.log(err.response.data + " bin login in login.js")
    }


}

export const logout = async() => {
    try {
        const res = await axios({
            method: 'GET',
            url: 'http://127.0.0.1:4301/api/v1/users/logout',
        });

        // reload the page  um cookie mit keinem token, an den server zu schicken
        if (res.data.status === 'success') location.reload(true); // true macht force relaod from server, and not from browser cache
    } catch (err) {
        console.log(err.response)
        showAlert('error', 'Error logging out! Try agein.')
    }
}

// document.querySelector('.form').addEventListener('submit', e => {
//     e.preventDefault(); // element prevent from loading the page

//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;
//     //login({ email, password })
//     login(email, password)
// })


////--------------------------------------------------------
// const login = async(email, password) => {
//     //alert(email)
//     console.log(email, password)

//     try {
//         const res = await axios({
//             method: 'POST',
//             url: 'http://127.0.0.1:4301/api/v1/users/login',
//             data: {
//                 email: email,
//                 password: password,
//             }
//         })
//         console.log(res)
//     } catch (err) {
//         console.log(err.response.data + " bin login in login.js") // kommt von axios documentation
//     }


// }

// document.querySelector('.form').addEventListener('submit', e => {
//     e.preventDefault(); // element prevent from loading the page

//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;
//     //login({ email, password })
//     login(email, password)
// })





// extends base

// block content
//     main.main
//         .login-form
//             h2.heading-secondary.ma-bt-lg Log into your account
//             form.form
//                 .form__group
//                     label.form__label(for='email' type='form') Email address
//                     input#email.form__input(type='email' autocomplete='email address' placeholder='you@example.com', required)
//                 .form__group.ma-bt-md
//                     label.form__label(for='password') Password
//                     input#password.form__input(type='password' autocomplete='current-password' placeholder='••••••••', required, minlength='8')
//                 .form__group 
//                     button.btn.btn--green Login
//                 .form__group
//                     a#misclink(href='/signup') Create new account 

// https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/learn/lecture/15065660#questions/17489992

//script(src='/js/login.js' defer)

// cors ...