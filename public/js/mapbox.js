/* eslint-disable */

console.log('Hello from the client side :D')

const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log('locations: ' + locations) //


mapboxgl.accessToken = 'pk.eyJ1IjoiZmxuYzg1IiwiYSI6ImNsZ2JkN3AyeDFxY3IzZnA4Yms4N3Y2dTgifQ.uU2MvovWABXWQByHd0kKLg';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11'
});