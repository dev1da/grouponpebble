var UI = require('ui');
var ajax = require('ajax');

// Create a Card with title and subtitle
var card = new UI.Card({
  title:'Groupon Deal',
  //ubtitle:'Fetching...'
});

// Display the Card
card.show();

var lat, long;
var grpnURL = 'https://partner-api.groupon.com/deals.json?tsToken=US_AFF_0_201236_212556_0&filters=category:food-and-drink&offset=0&limit=1';
var locationOptions = {
  enableHighAccuracy: true, 
  maximumAge: 10000, 
  timeout: 10000
};

function locationSuccess(pos) {
  lat=pos.coords.latitude;
  long=pos.coords.longitude;
  console.log('lat= ' + pos.coords.latitude + ' lon= ' + pos.coords.longitude);
}

function locationError(err) {
  console.log('location error (' + err.code + '): ' + err.message);
}

// Make an asynchronous request
navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);


grpnURL= grpnURL+"&lat="+lat+"&lng="+long;
console.log(grpnURL);
// Make the request
ajax(
  {
    url: grpnURL,
    type: 'json'
  },
  function(data) {
    // Success!
    console.log("Successfully fetched weather data!");
    console.log(grpnURL);
    // Extract data
    //var location = data.name;
    //var temperature = Math.round(data.main.temp - 273.15) + "C";
    
    var deal = data.deals[0].title;
    // Always upper-case first letter of description
    //var description = data.weather[0].description;
    //description = description.charAt(0).toUpperCase() + description.substring(1);

    // Show to user
    //card.subtitle(location + ", " + temperature);
    //card.body(description);
    card.body(deal);
    //card.body(lat);
  },
  function(error) {
    // Failure!
    console.log('Failed to get deals from groupon' + error);
  }
);
