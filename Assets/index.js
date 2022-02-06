var apiKey = "9cd194d163b26eabb565a48c6fa01c91"

//Renders the last dispalyed city from local storage
function renderLast() {
    var location = localStorage.getItem("LastCity");
    if (location !== null) {
        printButtonInfo(location);
        renderLastButtons();
    }
}
renderLast();

//Renders list of previous buttons from local storage
function renderLastButtons() {
    var list = JSON.parse(localStorage.getItem("Cities"));
    if (list !== null) {
        for (var j = 0; j < list.length; j++) {
            printNewButton(list[j]);
        }
    }
}

//Prints new button to recent search list
function printNewButton(place) {
    var newBtn = $("<button class='btn btn-primary m-1 saveCity'>");
    newBtn.text(place);
    $(".list-group").append(newBtn);
}

//Turn epoch into date
function getDate(object) {
    var epoch = moment.unix(object.dt);
    var date = epoch.format("(M/DD/YY)")
    return date;
}

//Retrieve icon url
function printIcon(object) {
    var iconcode = object.weather[0].icon;
    var iconURL = "https://openweathermap.org/img/wn/" + iconcode + ".png";
    return iconURL
}

//Convert temp to farenheit
function getTemp(object) {
    var kelvin = object.main.temp;
    var farenheit = (kelvin - 273) * 1.8 + 32;
    var temp = farenheit.toFixed(1);
    return temp;
}

//Get windspeed
function getWindSpeed(object) {
    var speedMPS = object.wind.speed;
    var convertSpeed = speedMPS * 2.2369;
    var speed = convertSpeed.toFixed(1);
    return speed;
}

// Function to get and print UV Index
function getUvIndex(object) {
    var lat = object.coord.lat;
    var long = object.coord.lon;

    var uvURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${long}&appid=${apiKey}`;

    $.ajax({
        method: "GET",
        url: uvURL
    }).then(function (uvResponse) {
        var uvItem = $("<p class='card-text'>");
        uvItem.html("UV Index: ");
        var numSpan = $("<span class='badge'>");
        numSpan.html(uvResponse.value);
        uvItem.append(numSpan);

        if (uvResponse.value <= 5.99) {
            numSpan.attr("style", "background-color: green;")
        } else if (uvResponse.value > 5.99 && uvResponse.value < 8) {
            numSpan.attr("style", "background-color: orange;")
        } else if (uvResponse.value > 7.99 && uvResponse.value < 10.99) {
            numSpan.attr("style", "background-color: red;")
        } else {
            numSpan.attr("style", "background-color: violet;")
        }
        $(".mainBody").append(uvItem);
    })
}

//Function to get and print five day forecast
function fiveDay(object) {
    $(".fiveDay").empty()
    $(".forecastTitle").attr("style", "display: inline")

    var lat = object.coord.lat;
    var long = object.coord.lon;

    var currentURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&exclude=current,minutely,hourly,alerts&appid=${apiKey}`

    $.ajax({
        method: "GET",
        url: currentURL
    }).then(function (fiveDayResponse) {
        var forecast = (fiveDayResponse.daily)

        for (var i = 1; i < 6; i++) {
            var day = forecast[i];
            //create variable
            var dayDiv = $("<div class='card bg-dark p-1 forecast'>")

            //create date dive
            var eachDate = getDate(day);
            // console.log(eachDate);
            var dateHead = $("<h4>");
            dateHead.html(eachDate);
            dayDiv.append(dateHead);

            //create icon div
            var eachURL = printIcon(day);
            var iconTag = $("<img class='dayIcon'>")
            iconTag.attr("src", eachURL);
            dayDiv.append(iconTag);

            //temperature
            var kelvin = day.temp.max;
            var farenheit = (kelvin - 273) * 1.8 + 32;
            var temp = farenheit.toFixed(1);
            var tempTag = $("<p>")
            tempTag.html("Temperature: " + temp + "&deg F");
            dayDiv.append(tempTag);
            //humidity

            var humTag = $("<p>");
            humTag.html("Humidity: " + day.humidity + "%");
            dayDiv.append(humTag);

            $(".fiveDay").append(dayDiv);
        }
    })

}

//Function to get and print info
function printAll(object) {

    $(".master").attr("style", "display; visible")
    $(".card-text").empty()

    //Retrieve date and format it
    var thisDate = getDate(object);
    $(".mainTitle").text(object.name + " " + thisDate);

    //Print Icon
    var icon = printIcon(object);
    $(".icon").attr("src", icon);

    //Print temperature
    var farPrint = getTemp(object);
    var tempItem = $("<p class='card-text'>");
    tempItem.html("Temperature: " + farPrint + "&deg F");
    $(".mainBody").append(tempItem);

    //Print Humidity
    var humItem = $("<p class='card-text'>");
    humItem.html("Humidity: " + object.main.humidity + "%");
    $(".mainBody").append(humItem);

    //Print wind speed
    var windSpeed = getWindSpeed(object);
    var windItem = $("<p class='card-text'>");
    windItem.html("Wind Speed: " + windSpeed + " MPH");
    $(".mainBody").append(windItem);

    //Print UV Index
    getUvIndex(object);

    //Print 5 day
    fiveDay(object);
}

//Function to render city when first submitted and save to local storage. Also catches error and alerts to page.
function getWeatherInfo(city) {
    var currentURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

    $.ajax({
        method: "GET",
        url: currentURL,
        success: function (response) {

            printAll(response)
            printNewButton(city);
            localStorage.setItem("LastCity", city);
            listStorage(city);
        },

        error: function (jqXHR) {
            if (jqXHR.statusText == "Not Found") {
                alert("Please type in a valid city.");
            } else if (jqXHR.statusText == "Bad Request") {
                alert("Please type in a city to get started!")
            }
        }
    })
}

//Function to reprint info from button
function printButtonInfo(city) {
    var currentURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

    $.ajax({
        method: "GET",
        url: currentURL,
    }).then(function (buttonResponse) {
        printAll(buttonResponse);
    })
}

//Function to save recent list of searches
function listStorage(city) {
    var cities = JSON.parse(localStorage.getItem("Cities"));

    var openArray = [];

    if (cities == null) {
        openArray.push(city);
        localStorage.setItem("Cities", JSON.stringify(openArray));
    } else {
        cities.push(city)
        localStorage.setItem("Cities", JSON.stringify(cities));
    }
}

//on click event to print search field input to page
$("#cityBtn").on("click", function () {

    var city = $("#inputDefault").val().trim();
    $("#inputDefault").val("");

    getWeatherInfo(city);
})

//Onclick event to print that button's city info to page
$(document).on("click", ".saveCity", function () {

    var newCity = $(this).text();

    printButtonInfo(newCity);

    localStorage.setItem("LastCity", newCity);
})