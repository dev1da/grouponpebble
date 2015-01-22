var UI = require('ui');
var ajax = require('ajax');
var Accel = require('ui/accel');
var Vibe = require('ui/vibe');
//var harversine = require('harversine');

// Create a Card with title and subtitle
var card = new UI.Card({
  title:'Groupon Deal',
  icon: 'images/groupon13.png'
  //ubtitle:'Fetching...'
});

// Display the Card
card.show();
var haversine;
var lat, long;
var grpnURL = 'https://partner-api.groupon.com/deals.json?tsToken=US_AFF_0_201236_212556_0&filters=category:food-and-drink&limit=1';
var randomNum;
var locationOptions = {
  enableHighAccuracy: true, 
  maximumAge: 10000, 
  timeout: 10000
};


Accel.on("tap", function(e) {
  // send location to our webservice
 console.log("accelerometer activated" + lat +"/n"+long);
buildURL();
  fetchdeal();
});


function locationSuccess(pos) {
  lat=pos.coords.latitude;
  long=pos.coords.longitude;
  console.log('lat= ' + pos.coords.latitude + ' lon= ' + pos.coords.longitude);
  console.log("latitude blah");
  console.log(lat);
  //randomNum=fetchRand();
  //grpnURL=grpnURL+"&lat="+lat+"&lng="+long+"&offset="+randomNum;
  buildURL();
  Vibe.vibrate('long');
  fetchdeal();
  Vibe.vibrate('long');
}

function buildURL(){
  randomNum=fetchRand();
  grpnURL=grpnURL+"&lat="+lat+"&lng="+long+"&offset="+randomNum;
}

function locationError(err) {
  console.log('location error (' + err.code + '): ' + err.message);
}

// Make an asynchronous request
navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);

// Make the request
function fetchdeal(){
ajax(
  {
    url: grpnURL,
    type: 'json'
  },
  function(data) {
    // Success!
    //grpnURL= grpnURL+"&lat="+lat+"&lng="+long;
    console.log("Successfully fetched weather data!");
    console.log(grpnURL);
    // Extract data
    //var location = data.name;
    //var temperature = Math.round(data.main.temp - 273.15) + "C";
    //getDistance();
    
    var dealTitle = data.deals[0].title;
    var options = data.deals[0].options;
    var optionsCount = data.deals[0].options.length;
    //var rating = data.deals[0].merchant.ratings[0].rating;
    var redemptionLocations = data.deals[0].options[0].redemptionLocations.length;
    var endLat=[];
    var endLong=[];
    var dist=[];
    var minDistance;
    var location;
    // Always upper-case first letter of description
    //var description = data.weather[0].description;
    //description = description.charAt(0).toUpperCase() + description.substring(1);

    var start = {
  latitude: lat,
  longitude: long
};
 
    
    console.log("number of redemption locations" + redemptionLocations);
    for (var i=0;i<redemptionLocations;i++){
      endLat.push(data.deals[0].options[0].redemptionLocations[i].lat);
      endLong.push(data.deals[0].options[0].redemptionLocations[i].lng);
      
      var endPos = {
      latitude: endLat[i],
      longitude: endLong[i]
        };
      
      
      var distance = haversine(start,endPos,"mile");
      console.log("yo distance" + distance);
      dist.push(distance);
    }
   
     console.log("Distance array is"+dist[0]);
 minDistance=Array.min(dist);
 
   
    
    
location= data.deals[0].options[0].redemptionLocations[dist.indexOf(minDistance)].name+","+data.deals[0].options[0].redemptionLocations[dist.indexOf(minDistance)].streetAddress1 + ", " + data.deals[0].options[0].redemptionLocations[dist.indexOf(minDistance)].streetAddress2 +'\n'+  data.deals[0].options[0].redemptionLocations[dist.indexOf(minDistance)].city + '-'+ data.deals[0].options[0].redemptionLocations[dist.indexOf(minDistance)].postalCode;
    
var end = {
  latitude: data.deals[0].options[0].redemptionLocations[0].lat,
  longitude: data.deals[0].options[0].redemptionLocations[0].lng
};

    console.log("testing distance");
//console.log(harversine(start, end,));
    
    var distance = haversine(start,end,"mile");
    //console.log(haversine(start, end, {unit: 'km'}));  
    
    
    // Show to user
    //card.subtitle(location + ", " + temperature);
    //card.body(description);
    card.scrollable(true);
    //card.body(dealTitle+ "Deal is " + Math.round(distance * 100)/100 +" miles away from your place");
    card.subtitle(dealTitle);
    
    card.body("We have" + redemptionLocations + " location(s) for the groupon.\nThe closest location is " + Math.round(minDistance * 100)/100 + " miles from your current location \nCheck it out at " + location);
    
    //card.body("Deal is " + Math.round(distance * 100)/100 +" miles away from your location");
    
    card.show();
    Vibe.vibrate('long');
    card.on('click', function(e){ 
      if(e.button=="select"){
        //card.subtitle('number of options' + options );
       var tit=[];
        for(i=0;i<options.count;i++){
         
         var titles = {
      title: options[i].title,
      subtitle: options[i].title
        };
          tit.push(titles);
       } 
        
        var appMenu = new UI.Menu({
  sections: [{
    title: 'Options',
//     items: [{
//       title: options[0].title,
//       subtitle: options[0].title
//     }]
    items: tit
    
  }]
});
        appMenu.show();        
        
        appMenu.on('select', function(e) {
console.log(e.itemIndex);

var appDetails = new UI.Card({
body: options[e.itemIndex].title,
scrollable: true
});

appDetails.show();
});
        
        
        
        //card.subtitle(options[0].title) ;
      }
      });
  },
  function(error) {
    // Failure!
    console.log('Failed to get deals from groupon' + error);
    console.log(grpnURL);
  }
);}


function fetchRand(){
  return Math.random() * (100-50) +50;
}


Array.min = function( array ){
    return Math.min.apply( Math, array );
};


haversine = (function() {

  // convert to radians
  var toRad = function(num) {
    return num * Math.PI / 180;
  };

  return function haversine(start, end, options) {
    var km    = 6371;
    var mile  = 3960;
    options   = options || {};

    var R=mile;
    var dLat = toRad(end.latitude - start.latitude);
    var dLon = toRad(end.longitude - start.longitude);
    var lat1 = toRad(start.latitude);
    var lat2 = toRad(end.latitude);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    if (options.threshold) {
      return options.threshold > (R * c);
    } else {
      console.log("distance is" + R*c);
      return R * c;
    }
  };

})();
