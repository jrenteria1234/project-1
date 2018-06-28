// Declaration of Global Variables
var usersearch = [];
var city = "";
var country = "";
var latitude = 25.7617;
var longitude = 80.1918;
var search = "Miami, Florida, United States of America";
var savedSearches = [""];
var cities = [""];
var countries = [""];
var dontRun = true;

// Initialize firebase
var config = {
    apiKey: "AIzaSyAS3959bKkHf0tPU6PZAFSJm39mmBQjnxk",
    authDomain: "musicup-e14d2.firebaseapp.com",
    databaseURL: "https://musicup-e14d2.firebaseio.com",
    projectId: "musicup-e14d2",
    storageBucket: "musicup-e14d2.appspot.com",
    messagingSenderId: "968204181937"
  };

firebase.initializeApp(config);
var database = firebase.database();

function findEvents() {
    $("#events").empty();
    //finding events with Eventbrite API
    var eventBriteApiKey = "FPKFWK7MH5W6AEHFNYXN";
    var eventBriteUrl = "https://www.eventbriteapi.com/v3/events/search/?token=" + eventBriteApiKey;
    var searchUrl = eventBriteUrl + "&location.address=" + city + "&categories=103" + "&sort_by=date";

    $.ajax({                                                    
        url: searchUrl,
        method: "GET"
    }).done(function(response) {
        //for loop to format important data on first 10 events into divs and print to the events div
        for (i = 0; i < 10; i++) {
            var thisEvent = response.events[i];
            var eventDiv = $("<div>");
            var eventHeader = $("<h4>");
            var eventDates = $("<p>");
            var prettyStart = moment(thisEvent.start.local).format("L LT");
            var prettyEnd = moment(thisEvent.end.local).format("L LT");
            var eventNumber = i + 1;
            eventHeader.html('<a href="' + thisEvent.url + '" target="_blank">' + eventNumber + ". " + thisEvent.name.text + "</a>");
            eventDates.text(prettyStart + " - " + prettyEnd);
            eventDiv.append(eventHeader);
            eventDiv.append(eventDates);
            $("#events").append(eventDiv);
        }
    })
};

// Resets variables then performs search
function resetThenSearch() {
    // reset variables
    usersearch = [];
    city = "";
    country = "";

    // splitting the string
    usersearch = search.split(", ");
    city = usersearch[0];
    country = usersearch[usersearch.length - 1];

    // displays location on page
    $(".searchquery1").html("<h1>" + city + "</h1>");
    $(".searchquery2").html("<h2>" + city + "</h2>");

    // runs APIs
    googleMapsGeocoding();
    getNews();
    findEvents();

    if (dontRun == false) {
    	updateImage();
    } else {
    	dontRun = false;
    }
}

// Flickr API
function updateImage() {
    //Updates background image
    var flickrApiKey = "835dc1fd1756f06bb07d91eb122da803";
    var flickrUrl = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=" + flickrApiKey + "&text=" + city + "&format=json&nojsoncallback=1&sort=relevance&accuracy=~11&content_type=1&is_getty=true";

    $.ajax({
        url: flickrUrl,
        method: "GET",
    }).done(function(response) {
        // console.log(response);
        var thisPhoto = response.photos.photo[0];
        var photoId = thisPhoto.id;
        var photoServerId = thisPhoto.server;
        var photoFarmId = thisPhoto.farm;
        var photoSecret = thisPhoto.secret;
        var photoUrl = "https://farm" + photoFarmId +".staticflickr.com/" + photoServerId + "/" + photoId + "_" + photoSecret + ".jpg"
        $(".header").css("background-image", "url(" + photoUrl + ")");
    })
}

// Displays all saved searches as buttons
database.ref().on("value", function(snapshot) {
    // Clears contents of saved searches
    $("#savedSearches").empty();

    // Pulls saved searches
    savedSearches = snapshot.val().savedSearches;
    cities = snapshot.val().cities;
    countries = snapshot.val().countries;

    for (var i = 1; i < savedSearches.length; i++) {
        // Creates a div for each searched item
        var div = $("<div class='searchitem'>");

        // Creates a button and adds its class and text
        var a = $("<button>").addClass("searchbutton").text(cities[i] + ", " + countries[i]).attr("query", savedSearches[i]);
        
        // Creates a close button and adds its class, icon, and index
        var close = $("<img class='closeIcon' src='assets/images/close.png'>");
        close.attr("index", i);

        div.append(close).append(a);

        // Appends button to list
        $("#savedSearches").append(div);
    }
});

// Initially hide option to save search
$("#save").hide();

// Load Miami's information on start
setTimeout(function() {
    resetThenSearch();
    $(".searchquery1").html("<img id='logo' class='img-fluid' alt='MusicUp' src='assets/images/musicUp.png'>");
}, 1000);

// CORS
jQuery.ajaxPrefilter(function(options) {
    if (options.crossDomain && jQuery.support.cors) {
        options.url = 'https://cors-anywhere.herokuapp.com/' + options.url;
    }
});

// Fixed siderbar
var stickySidebar = $(".sidebar").offset().top;

$(window).scroll(function() {  
    if ($(window).scrollTop() > stickySidebar) {
        $(".sidebar").addClass("affix");
    }
    else {
        $(".sidebar").removeClass("affix");
    }  
});

// ON-CLICK EVENTS (top to bottom)
// Grabs user input from search bar
$("#search").on("click", function(event) {
    // grabs user input and trims excess spaces
    search = $("#search-input").val().trim();

    // run search function
    resetThenSearch();

    // show save button
    $("#save").show();
});

// Saves search
$("#save").on("click", function(event) {
    // add search to array of saved searches
    savedSearches.push(search);
    cities.push(city);
    countries.push(country);

    // send saved searches to firebase
    database.ref().set({
        savedSearches: savedSearches,
        cities: cities,
        countries: countries
    });
});

// Clears saved searches
$("#clear").on("click", function(event) {
    // add search to array of saved searches
    savedSearches = [""];
    cities = [""];
    countries = [""];

    // Send saved searches to firebase
    database.ref().set({
        savedSearches: savedSearches,
        cities: cities,
        countries: countries
    });
});

// Reexecutes search when saved search button is clicked
$("#savedSearches").on("click", ".searchbutton", function() {
    // setting the search query
    search = $(this).attr("query");

    // run search function
    resetThenSearch();
});

// Reexecutes search when saved search button is clicked
$("#savedSearches").on("click", ".closeIcon", function() {
    // removing the selected item
    var index = $(this).attr("index");
    savedSearches.splice(index, 1);
    cities.splice(index, 1);
    countries.splice(index, 1);

    // Send saved searches to firebase
    database.ref().set({
        savedSearches: savedSearches,
        cities: cities,
        countries: countries
    });    
});


// API FUNCTIONS
// Algolia Places API
// autocomplete for search bar
(function() {
    places({
        container: document.querySelector('#input-styling-address input'),
        style: false,
        debug: true
    });
})();

// Google Maps Geocoding API
// Obtains latitude and longitude of location
function googleMapsGeocoding() {
    var googleMapsGeocoding_key = "AIzaSyB7gKl-GUrq-aUv1mD5e0mZfEb8k349JS8";
    var googleMapsGeocoding_queryURL = "https://maps.googleapis.com/maps/api/geocode/json?key=" + googleMapsGeocoding_key + "&address=" + city + "," + country;

    $.ajax({
        url: googleMapsGeocoding_queryURL,
        method: "GET"
    }).done(function(response) {

        // update coordinates and display map
        latitude = response.results[0].geometry.location.lat;
        longitude = response.results[0].geometry.location.lng;
        googleMapsJavascript();

        // search for nearby places
        googlePlaces();
    });
}

// Google Maps JavaScript API
// Updates & displays map
function googleMapsJavascript() {
    var loc = {lat: latitude, lng: longitude};
    var map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: loc,
    });

    new google.maps.Marker({
        position: loc,
        map: map,
        icon: "assets/images/location.png"
    });
}

// Google Places API
    function googlePlaces() {
    var googlePlaces_key = "AIzaSyCDcpIf0iLXO9lC6dAQUWAuMyIJNpgFV7w";
    var googlePlaces_queryURL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=" + googlePlaces_key + "&location=" + latitude + "," + longitude + "&radius=8047&rankby=prominence&type=point_of_interest";

    $("#hotels").empty();
    $("#food").empty();

    // Accomodations
    var googlePlaces_queryURL2 = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=" + googlePlaces_key + "&location=" + latitude + "," + longitude + "&radius=8047&rankby=prominence&type=lodging";

    $.ajax({
        url: googlePlaces_queryURL2,
        method: "GET"
    }).done(function(response) {
        for (var i = 0; i < 10; i++) {
            var div = $("<div>");
            div.addClass("hotelbox");

            var name = response.results[i].name;

            div.append("<p><b>" + (i+1) + ".</b> " + name + "</p>");
            $("#hotels").append(div);    
        }
    });

    // Restaurants
    var googlePlaces_key = "AIzaSyCDcpIf0iLXO9lC6dAQUWAuMyIJNpgFV7w";
    var googlePlaces_queryURL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=" + googlePlaces_key + "&location=" + latitude + "," + longitude + "&radius=8047&rankby=prominence&type=restaurant";

    $.ajax({
        url: googlePlaces_queryURL,
        method: "GET"
    }).done(function(response) {
        $("#food").text("");
        for (i = 0; i < 10; i++) {
            var thisRestaurant = response.results[i];
            var restaurantDiv = $("<div>");
            var restaurantName = $("<p>");
            var itemNumber = i + 1;
            restaurantName.text(itemNumber + ". " + thisRestaurant.name);
            restaurantDiv.append(restaurantName);
            $("#food").append(restaurantDiv);
        }
    });
}

// News articles
function getNews() {
    var newsApiKey = "37341660916741f38faa605269e8554f"
    var newsUrl = 'https://newsapi.org/v2/everything?' + 'q=' + city + '&apiKey=' + newsApiKey + "&sources=abc-news,bbc-news,al-jazeera-english,le-monde,nbc-news,the-new-york-times,time,newsweek,daily-mail,associated-press&sortBy=relevancy";
    $("#news").empty();

    $.ajax({
        url:newsUrl,
        method: "GET"
    }).done(function(response) {
        //Creates divs for first 10 articles with relevant info
        for (i = 0; i < 10; i++) {
            var thisArticle = response.articles[i];
            var articleDiv = $("<div>");
            var articleHeader = $("<h4>");
            var articleSource = $("<p>");
            var articleDate = $("<p>");
            var articleUrl = $("<a>");
            articleNumber = i + 1;
            articleSource.text(thisArticle.source.name);
            articleDate.text(moment(thisArticle.publishedAt).format("L"));
            articleUrl.attr("href", thisArticle.url);
            articleUrl.attr('target', '_blank');
            articleUrl.text(articleNumber + ". " + thisArticle.title);
            articleHeader.html(articleUrl);
            articleDiv.append(articleHeader);
            articleDiv.append(articleDate);
            articleDiv.append(articleSource);
            $("#news").append(articleDiv);
        }
    });
};