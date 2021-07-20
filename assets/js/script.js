var APIKey = "b0cd62d5d1c72e893766baa50b0b9970";

// Remove all child elements
function removeAllChildElements(parentElem) {
  while (parentElem.firstChild) {
    parentElem.removeChild(parentElem.firstChild);
  }
}

// Convert the input text to Title Case
function toTitleCase(str) {
  var result = "";
  for (var i = 0; i < str.length; i++) {
    var chr = str[i]; // Get the i-th character  without any change
    //Make first character upper case and add it to result
    if (i == 0) chr = str[i].toUpperCase();
    // Check if previous character is ' ' and the current (i-th) charcter is lower case
    else if (str[i - 1] == ' ' && str[i] == str[i].toLowerCase()) chr = str[i].toUpperCase();
    result += chr;
  }
  console.log(result);
  return result;
};


// Weather Dashboard object to hold all related methods
var weatherDashboard = {

  searchHistoryList: [],
  city: "",

  // Function to display the weather details
  displayWeather: function (data) {
    var today = moment.unix(data.dt).format("M/D/y");
    var weatherElem = document.getElementById("weatherSummary");

    //Remove all child elements
    removeAllChildElements(weatherElem);

    //Create and add title element
    var titleElem = document.createElement("h2");
    titleElem.innerHTML = this.city + " (" + today + ")";
    weatherElem.appendChild(titleElem);

    var currentData = data.current;

    //Create and add temparature element
    var temparatureElem = document.createElement("div");
    temparatureElem.innerHTML = "Temp: " + currentData.temp + "&deg;F";
    weatherElem.appendChild(temparatureElem);

    //Create and add wind element
    var windElem = document.createElement("div");
    windElem.innerHTML = "Wind: " + currentData.wind_speed + " MPH";
    weatherElem.appendChild(windElem);

    //Create and add wind element
    var humidityElem = document.createElement("div");
    humidityElem.innerHTML = "Humidity: " + currentData.humidity + " %";
    weatherElem.appendChild(humidityElem);

    //Create and add uvindex element
    var uvIndexElem = document.createElement("div");
    var uviDataSpan = "<span ";
    if (currentData.uvi <= 2) uviDataSpan += " class='uvi uvi-favorable' ";
    else if (currentData.uvi <= 7) uviDataSpan += "class='uvi uvi-moderate' ";
    else uviDataSpan += " class='uvi uvi-severe' ";
    uviDataSpan += ">" + currentData.uvi + "</span>";
    uvIndexElem.innerHTML = "UV Index: " + uviDataSpan;
    weatherElem.appendChild(uvIndexElem);

    var forcastElem = document.getElementById("weatherForecast");
    removeAllChildElements(forcastElem);

    for (var i = 0; i < 5; i++) {
      this.displayForecastCard(forcastElem, data.daily[i])
    }

  },

  // Function to display the singel forecast data
  displayForecastCard: function (forcastElem, data) {
    var forcastDate = moment.unix(data.dt).format("M/D/y");

    //Create and add title element
    var cardElem = document.createElement("div");
    cardElem.className = "forecast-card";

    //Create and add title element
    var titleElem = document.createElement("h3");
    titleElem.innerHTML = forcastDate;
    cardElem.appendChild(titleElem);

    //Create and add temparature element
    var imgUrl = "http://openweathermap.org/img/wn/" + data.weather[0].icon + "@2x.png";
    var iconElem = document.createElement("img");
    iconElem.setAttribute("src", imgUrl);
    iconElem.className = "forecast-card-icon";
    cardElem.appendChild(iconElem);

    //Create and add temparature element
    var temparatureElem = document.createElement("div");
    temparatureElem.innerHTML = "Temp: " + data.temp.day + "&deg;F";
    cardElem.appendChild(temparatureElem);

    //Create and add wind element
    var windElem = document.createElement("div");
    windElem.innerHTML = "Wind: " + data.wind_speed + " MPH";
    cardElem.appendChild(windElem);

    //Create and add humidity element
    var humidityElem = document.createElement("div");
    humidityElem.innerHTML = "Humidity: " + data.humidity + " %";
    cardElem.appendChild(humidityElem);

    forcastElem.appendChild(cardElem);

  },

  // Function to fetch weather details for the entered city from the openweathermap API
  searchWeather: function () {
    var cityElem = document.getElementById("txtCity");
    this.city = toTitleCase(cityElem.value.trim());
    
    var queryWeatherBaseURL = "http://api.openweathermap.org/data/2.5/weather?&appid=" + APIKey;
    var queryWeatherURL = queryWeatherBaseURL + "&q=" + this.city;

    fetch(queryWeatherURL)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        weatherDashboard.getWeatherForecast(data.coord.lat, data.coord.lon);
      });
  },

  getWeatherForecast: function (latitude, longitude) {
    var queryBaseUrl = "https://api.openweathermap.org/data/2.5/onecall?exclude=hourly,minutely,alerts&units=imperial&appid=" + APIKey;
    var queryUrl = queryBaseUrl + "&lat=" + latitude + "&lon=" + longitude;

    fetch(queryUrl)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        console.log(data);
        weatherDashboard.displayWeather(data);
      });
  },

  /*******************************************
   *  Search History Related Methods 
   *******************************************/
  // Load search history from the local storage
  loadSearchHistory: function () {
    var searchHistoryKey = "search-list";
    this.searchHistoryList = JSON.parse(localStorage.getItem(searchHistoryKey));
    if (this.searchHistoryList == null) this.searchHistoryList = [];
    console.log(this.searchHistoryList);
  },

  // Save search history to the local storage
  addToSearchHistory: function (cityName) {
    // Do not add the city name to history if it's blank
    if (cityName.trim() === "") return;

    cityName = toTitleCase(cityName);
    var searchHistoryKey = "search-list";
    var cityInHistory = (this.searchHistoryList.indexOf(cityName) > -1);
    if (!cityInHistory) {
      //Add item as first item in the array to keep the recent search on top
      this.searchHistoryList.unshift(cityName);
    }

    localStorage.setItem(searchHistoryKey, JSON.stringify(this.searchHistoryList));
    this.displaySearchHistory();
  },

  // Clear search history from the local storage
  clearSearchHistory: function () {
    var searchHistoryKey = "search-list";
    this.searchHistoryList = [];
    localStorage.setItem(searchHistoryKey, JSON.stringify(this.searchHistoryList));
    this.displaySearchHistory();
  },

  // Display search history in the left panel
  displaySearchHistory: function () {
    var searchHistoryElem = document.getElementById("search-history");
    removeAllChildElements(searchHistoryElem);

    // Loop through Search history array and add buttons for each city 
    // in the search history section 
    for (var i = 0; i < this.searchHistoryList.length; i++) {
      var historyElem = document.createElement("button");
      var cityName = this.searchHistoryList[i];
      historyElem.innerHTML = cityName;
      historyElem.setAttribute("data-city", cityName);
      historyElem.className = "search-history-item"
      historyElem.addEventListener("click", this.onSearchItemClick);
      searchHistoryElem.appendChild(historyElem);
    }
  },

  // Search history item click
  onSearchItemClick: function (event) {
    var searchItemElem = event.target;
    var cityName = searchItemElem.getAttribute("data-city");
    var cityElem = document.getElementById("txtCity");
    cityElem.value = cityName.trim();
    weatherDashboard.searchWeather();
  }

};

// Function to initialize the page
function init() {

  // Attach event listener to the search button
  var btnSearch = document.getElementById("btnSearch");
  btnSearch.addEventListener("click", function () {
    weatherDashboard.searchWeather();
    weatherDashboard.addToSearchHistory(weatherDashboard.city);
  });

  // Attach event listener to the clear button
  var btnClear = document.getElementById("btnClear");
  btnClear.addEventListener("click", function () {
    weatherDashboard.clearSearchHistory();
  });

  // Load Search History
  weatherDashboard.loadSearchHistory();

  // Show the search history when the page loads
  weatherDashboard.displaySearchHistory();

}

init();