$(document).ready(function () {
    const searchInput = document.getElementById('autocomplete');

    var options = {
        types: ["establishment"]
    };
    var autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'), options);
    var result;


    // Listener outside to stop nested loop returning odd results
    searchInput.addEventListener('keydown', (e) => {
        if (e.keyCode === 40) {
            hasDownBeenPressed = true;
        }
    });

    let hasDownBeenPressed = false;
    // GoogleMaps API custom eventlistener method
    google.maps.event.addDomListener(searchInput, 'keydown', (e) => {

        // Maps API e.stopPropagation();
        e.cancelBubble = true;

        // If enter key, or tab key
        if (e.keyCode === 13 || e.keyCode === 9) {

            // If user isn't navigating using arrows and this hasn't ran yet
            if (!hasDownBeenPressed && !e.hasRanOnce) {
                google.maps.event.trigger(e.target, 'keydown', {
                    keyCode: 40,
                    hasRanOnce: true,
                });
            }
        }
    });

    // Clear the input on focus, reset hasDownBeenPressed
    searchInput.addEventListener('focus', () => {
        hasDownBeenPressed = false;
        searchInput.value = '';
    });

    // place_changed GoogleMaps listener when we do submit
    google.maps.event.addListener(autocomplete, 'place_changed', function () {

        // Get the place info from the autocomplete Api
        const place = autocomplete.getPlace();
        const address = place.name;

        console.log(place);

        /*var fullAddress = address;
        for (var i = 1; i < place.address_components.length; i++) {
            fullAddress = fullAddress + ", " + place.address_components[i].long_name
        }*/

        //retrieveData(fullAddress);
        renderPage(null);

        //If we can find the place lets go to it
        if (typeof place.address_components !== 'undefined') {
            // reset hasDownBeenPressed in case they don't unfocus
            hasDownBeenPressed = false;
        }

    });

    //SEND HTTP POST REQUEST TO RETRIEVE LOCATION DATA
    const Url = "https://api.apify.com/v2/actor-tasks/3TyaFufB3FNuH5HkL/runs?token=qPBKQ79Ssk7xqDvLD935roRef&ui=1";
    async function retrieveData(address) {
        console.log(address);
        var myJson;
        var allData = [];
        data = {
            searchString: address,
            proxyConfig: {
                useApifyProxy: true,
            },
            includeReviews: true,
            includeImages: false,
            includeHistogram: false,
            includePeopleAlsoSearch: false,
            lat: '0',
            lng: '0',
            zoom: 10,
            maxCrawledPlaces: 1,
        };
        try {
            const response = await fetch(Url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
            });
            myJson = await response.json();
            console.log(myJson);
        } catch {
            console.error("Error: ", error);
        }

        let final = "https://api.apify.com/v2/datasets/" + myJson.data.defaultDatasetId + "/items?format=json&clean=1";
        console.log(final);

        var reviewResponse = await fetch(final);
        var reviewJson = await reviewResponse.json();
        console.log(reviewJson);

        while (reviewJson.length == 0) {
            reviewResponse = await fetch(final);
            reviewJson = await reviewResponse.json();
        }
        renderPage(reviewJson);

    }
    

    function renderPage(locationData) {
        //console.log(locationData);
        var canv = document.getElementById("overall-rating");
        var ctx = canv.getContext("2d");
        ctx.beginPath();
        ctx.arc(400, 100, 50, 1.5*Math.PI, locationData[0].totalScore/5*2*Math.PI);
        ctx.stroke();

        /*var template =
            "<div class='body-header'><h1>" + locationData[0].title + "</h1>"
            + "<h2>" + locationData[0].address + "</h2></div>"*/

        $(".main-body").replaceWith(template);
    }
});