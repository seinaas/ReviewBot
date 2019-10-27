$(document).ready(function () {
    const searchInput = document.getElementById('autocomplete');
    const loadingPhrases = ["Mining Cryptocurrency", "A Couple Bits Tried to Escape, but we Caught Them", "Our Servers are Powered by a Lemon and Two Electrodes", "Testing your Patience", "Hitting a Sick Aerial", "Dreaming of Faster Computers", "Collecting your Data"];
    var resultSentiment;
    var interval
    var options = {
        types: ["establishment"]
    };
    var autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'), options);



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

        startLoading();
        retrieveData(fullAddress);
        //renderPage(null);

        //If we can find the place lets go to it
        if (typeof place.address_components !== 'undefined') {
            // reset hasDownBeenPressed in case they don't unfocus
            hasDownBeenPressed = false;
        }

    });

    //SEND HTTP POST REQUEST TO RETRIEVE LOCATION DATA
    const Url = "https://api.apify.com/v2/actor-tasks/YuuiNMbYsGgY8odbj/runs?token=75dppykcMPqQZa674rPTZfLRR&ui=1";
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
        clearInterval(interval);
        $("#autocomplete").removeAttr("disabled");
        console.log(locationData);
        if (locationData[0].hasOwnProperty("reviews")) {
            let template =
                "<div class='body-header'><h1>" + locationData[0].title + "</h1>"
                + "<h2>" + locationData[0].address + "</h2></div>" +
                "<canvas id='review-chart'></canvas>" +
                "<div class='double-card'><div class='card-left'><div class='best-review'></div><div class='worst-review'></div></div><div class='card-right'><div class='total-reviews'><h3>" + locationData[0].title + " has</h3><h1>" + locationData[0].reviews.length + "</h1><h4>total review(s)</h4></div><div><canvas id='ind-ratings-chart'></canvas></div><div><canvas id='score-magnitude-chart'></canvas></div><div><canvas id='score-chart'></canvas></div></div></div>";

            $(".main-body").html(template);
            $(".card-right").slick();
            $(".slick-prev").html("<i class='material-icons'>keyboard_arrow_left</i>");
            $(".slick-next").html("<i class='material-icons'>keyboard_arrow_right</i>");

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
                        fontColor: "#000072",
                        fontFamily: "Roboto",
                        fontSize: 18,
                    },
                    scales: {
                        xAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: "User Rating",
                                fontColor: "#000072",
                            },
                            gridLines: { color: "#000072" },
                            ticks: { fontSize: 18, fontColor: "#000072" },
                        }],
                        yAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: "Nb of Reviews",
                                fontColor: "#000072",
                                padding: 2,
                            },
                            gridLines: { color: "#000072" },
                            ticks: {
                                fontSize: 12, fontColor: "#000072", maxTicksLimit: 8, beginAtZero: true, callback: function (value) { if (Number.isInteger(value)) { return value; } },
                                stepSize: 1
                            },
                        }]
                    }
                }
            });
        } else {
            $(".main-body").html("<div class='no-review main-body'><h1>It look like this business doesn't have any reviews yet.</h1>" +
                "<h1>😞<h1></div>");
        }
    }

    function postSentiment(dataJson) {
        $.ajax({
            type: "POST",
            url: "http://localhost:8000/reviewBot/sentiment",
            datatype: "application/json",
            contentType: "application/json",
            data: JSON.stringify(dataJson[0].reviews),
            success: function (result) {
                sentimentTable(result);
                sentimentChart(result);
            },
            error: function (error) {

            },
        });
    }

    function startLoading() {
        let message = loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)];
        $('.main-body').html("<div class='loading-logo'><img src='resources/img/logo.png'/></div><h2>" + message + "</h2>")
        interval = setInterval(function () {
            message = loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)];
            $('.main-body').html("<div class='loading-logo'><img src='resources/img/logo.png'/></div><h2>" + message + "</h2>")
        }, 5000);
        $("#autocomplete").attr("disabled", "disabled");
    }

    function sentimentTable(result) {
        var bestId = 0, worstId = 0;
        var maxMagnitudeGood = 0, maxScore = 0, minScore = 0, maxMagnitudeBad = 0;
        for (var i = 0; i < result.length; i++) {
            //BEST
            if (result[i].score > maxScore) {
                maxScore = result[i].score;
                maxMagnitudeGood = result[i].magnitude;
                bestId = i;
            } else if (result[i].score == maxScore) {
                if (result[i].magnitude > maxMagnitudeGood) {
                    maxMagnitudeGood = result[i].magnitude;
                    bestId = i;
                }
            }

            //WORST
            if (result[i].score < minScore) {
                minScore = result[i].score;
                minMagnitudeBad = result[i].magnitude;
                worstId = i;
            } else if (result[i].score == minScore) {
                if (result[i].magnitude > maxMagnitudeBad) {
                    maxMagnitudeBad = result[i].magnitude;
                    worstId = i;
                }
            }
        }

        console.log(result[bestId]);
        let best, worst;
        if (typeof result[bestId] === "undefined") {
            $(".card-left").html("<h1 class='no-written-reviews'>This place doesn't seem to have any written reviews yet</h1>");
        } else {
            $(".card-left").html("<div class='best-review'></div><div class='worst-review'></div>")
            $(".best-review").html("</span><h3>Best Review:</h3><p>" + result[bestId].text + "</p></span>");
            $(".worst-review").html("</span><h3>Worst Review</h3><p>" + result[worstId].text + "</p></span>");
        }
    }

    function sentimentChart(reviews) {
        var pointsScatter = [];
        var pointsLine = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (var i = 0; i < reviews.length; i++) {
            pointsScatter.push({ x: reviews[i].magnitude, y: reviews[i].score });
        }
        for (var i = 0; i <= 10; i++) {
            for (var j = 0; j < reviews.length; j++) {
                if ((Math.round(reviews[j].score * 10) / 10) == (i / 10)) {
                    pointsLine[i]++;
                }
            }
        }

        //CREATES SCATTER CHART TO DISPLAY SCORE AND MAGNITUDE OF RATINGS
        ctx = $("#score-magnitude-chart");
        var scoreMagChart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        data: pointsScatter,
                    }
                ],
            },
            options: {
                legend: { display: false },
                title: {
                    display: true,
                    text: "Score/Magnitude Dataset",
                    fontColor: "#000072",
                    fontFamily: "Roboto",
                    fontSize: 18,
                },
                scales: {
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: "Magnitude",
                            fontColor: "#000072",
                        },
                        gridLines: { color: "#000072" },
                        ticks: { fontColor: "#000072" },
                    }],
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: "Score",
                            fontColor: "#000072",
                            padding: 2,
                        },
                        gridLines: { color: "#000072" },
                        ticks: {
                            fontSize: 12, fontColor: "#000072",
                        },
                    }]
                }
            }

        });

        console.log(pointsLine);

        //CREATES LINE CHART TO DISPLAY SCORE OCCURRENCES
        ctx = $('#score-chart');
        var scoreChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ["0.1", "0.2", "0.3", "0.4", "0.5", "0.6", "0.7", "0.8", "0.9", "1.0"],
                datasets: [
                    {
                        data: pointsLine,
                        backgroundColor: "#34d2eb",
                        borderColor: "#34d2eb",
                        pointBackgroundColor: "#53d9ee",
                        pointHoverBackgroundColor: "#81e3f3",
                        fill: false,
                    }
                ],
            },
            options: {
                legend: { display: false },
                title: {
                    display: true,
                    text: "Score Occurrences",
                    fontColor: "#000072",
                    fontFamily: "Roboto",
                    fontSize: 18,
                },
                scales: {
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: "Score",
                            fontColor: "#000072",
                            maxTicksLimit: 20,
                        },
                        gridLines: { color: "#000072" },
                        ticks: { fontColor: "#000072" },
                    }],
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: "Nb of occurrences",
                            fontColor: "#000072",
                            padding: 2,
                        },
                        gridLines: { color: "#000072" },
                        ticks: {
                            fontColor: "#000072",
                        },
                    }]
                },
            }
        })
    }
});