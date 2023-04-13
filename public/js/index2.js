/* eslint-disable */

//import '@babel/polyfill'; // first line of imports, für ältere Browser
//import { login } from "./login";
//import axios from 'axios'
import axios from 'axios'
//import { showAlert } from './alerts'

console.log('Hello from parcel! bin index.js') //npm run watch:js


// DOM Element
const loginForm = document.querySelector('.form')


// VALUES
// const email = document.getElementById('email').value;        hier, diese sind nicht defined, wenn dom läd, braucht eventlistener
// const password = document.getElementById('password').value;

// DELEGATION


if (loginForm)
    loginForm.addEventListener('submit', e => {
        //document.querySelector('.form').addEventListener('submit', e => {
        e.preventDefault(); // element prevent from loading the page

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        //login({ email, password })
        login(email, password)
    })


const login = async(email, password) => {
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


const hideAlert = () => {
    const el = document.querySelector('.alert');
    if (el) el.parentElement.removeChild(el);
}

// type is 'success' or 'error'
const showAlert = (type, msg) => {
    hideAlert()
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup); // afterbegin = body, gleich beginn
    window.setTimeout(hideAlert, 5000)
}