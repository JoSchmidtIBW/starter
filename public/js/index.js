/* eslint-disable */

import '@babel/polyfill'; // first line of imports, für ältere Browser
import { login, logout } from "./login";
//import axios from 'axios'

console.log('Hello from parcel! bin index.js') //npm run watch:js


// DOM Element
const loginForm = document.querySelector('.form')
const logOutBtn = document.querySelector('.nav__el--logout')

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

if (logOutBtn) logOutBtn.addEventListener('click', logout);