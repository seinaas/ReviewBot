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

        var fullAddress = address;
        for (var i = 1; i < place.address_components.length; i++) {
            fullAddress = fullAddress + ", " + place.address_components[i].long_name
        }

        retrieveData(fullAddress);
        //renderPage(null);

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

        while (reviewJson.length == 0) {
            reviewResponse = await fetch(final);
            reviewJson = await reviewResponse.json();
        }

        postSentiment(reviewJson);
        renderPage(reviewJson);

    }
    

    function renderPage(locationData) {
        console.log(locationData);
        if (locationData[0].hasOwnProperty("reviews")) {
            let template =
                "<section class='main-body'><div class='body-header'><h1>" + locationData[0].title + "</h1>"
                + "<h2>" + locationData[0].address + "</h2></div>" +
                "<canvas id='review-chart'></canvas>" +
                "<canvas id='ind-ratings-chart'></canvas></section>";

            $(".main-body").replaceWith(template);

            let score = locationData[0].totalScore;//3.5;
            let individualRatings = [0, 0, 0, 0, 0];

            for (let i = 0; i < locationData[0].reviews.length; i++) {
                switch (locationData[0].reviews[i].stars) {
                    case 1:
                        individualRatings[0]++;
                        break;
                    case 2:
                        individualRatings[1]++;
                        break;
                    case 3:
                        individualRatings[2]++;
                        break;
                    case 4:
                        individualRatings[3]++;
                        break;
                    case 5:
                        individualRatings[4]++;
                        break;
                }
            }

            Chart.defaults.global.animation.duration = 1000;

            //CREATES DOUGHNUT CHART TO DISPLAY OVERALL RATINGS
            var ctx = $('#review-chart');
            var overallChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [score, 5 - score],
                        backgroundColor: [
                            'rgba(255,215,0,0.9)',
                            'rgba(230,230,230,0.3)',
                        ],
                    }],
                },
                options: {
                    legend: {
                        display: false
                    },
                    tooltips: { enabled: false },
                    hover: { mode: null },
                    cutoutPercentage: 60,
                    elements: {
                        arc: {
                            borderWidth: 0
                        },
                        center: {
                            text: score + "/5",
                            color: 'white', //Default black
                            fontStyle: 'Roboto', //Default Arial
                            sidePadding: 25 //Default 20 (as a percentage)
                        }
                    },
                }
            });

            //CREATES BAR CHART TO DISPLAY INDIVIDUAL STAR RATINGS
            ctx = $("#ind-ratings-chart");
            var individualChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ["1", "2", "3", "4", "5"],
                    datasets: [{
                        backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f", "#e8c3b9", "#c45850"],
                        data: individualRatings,
                    }],
                },
                beginAtZero: true,
                options: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: "All ratings",
                        fontColor: "white",
                        fontFamily: "Roboto",
                        fontSize: 18,
                    },
                    scales: {
                        xAxes: [{
                            gridLines: { color: "white" },
                            ticks: { fontSize: 18, fontColor: "white" },
                        }],
                        yAxes: [{
                            gridLines: { color: "white" },
                            ticks: {
                                fontSize: 18, fontColor: "white", beginAtZero: true, callback: function (value) { if (Number.isInteger(value)) { return value; } },
                                stepSize: 1
                            },
                        }]
                    }
                }
            });
        } else {
            $(".main-body").replaceWith("<div class='no-review main-body'><h1>It look like this business doesn't have any reviews yet.</h1>"+
            "<h1>😞<h1></div>");
        }
    }

    function postSentiment(dataJson) {
        $.ajax({
            type : "POST",
            url : "http://localhost:8000/reviewBot/sentiment",
            datatype : "application/json",
            contentType: "application/json",
            data: JSON.stringify(dataJson[0].reviews),
            success : function(result) {
                console.log(result);
            },
            error : function(error) {
        
            },
        });
    } 
});