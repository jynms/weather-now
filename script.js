//  Flow: Get location → Call API → Show data

// Weather Data Mapping
const weatherDescriptions = {
  0: { label: "Clear sky", emoji: "☀️" },
  1: { label: "Mainly clear", emoji: "🌤" },
  2: { label: "Partly cloudy", emoji: "⛅" },
  3: { label: "Overcast", emoji: "☁️" },
  45: { label: "Foggy", emoji: "🌫" },
  48: { label: "Icy fog", emoji: "🌫" },
  51: { label: "Light drizzle", emoji: "🌦" },
  61: { label: "Slight rain", emoji: "🌧" },
  63: { label: "Moderate rain", emoji: "🌧" },
  65: { label: "Heavy rain", emoji: "🌧" },
  71: { label: "Slight snow", emoji: "🌨" },
  73: { label: "Moderate snow", emoji: "❄️" },
  75: { label: "Heavy snow", emoji: "❄️" },
  80: { label: "Rain showers", emoji: "🌦" },
  95: { label: "Thunderstorm", emoji: "⛈" },
};

// Geolocation
function getWeather() {
  setStatus("📍 Getting your location...");
  navigator.geolocation.getCurrentPosition(onSuccess, onError);
}

// API Requests
async function onSuccess(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  setStatus("🌐 Fetching weather data...");

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weathercode` +
    `&temperature_unit=celsius`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const geoUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    displayWeather(data, geoData);
  } catch (error) {
    setStatus("❌ Failed to fetch weather. Check your internet connection.");
    console.error(error);
  }
}


// UI Updates
function displayWeather(data, geoData) {
  const current = data.current;
  const temp = Math.round(current.temperature_2m);
  const feelsLike = Math.round(current.apparent_temperature);
  const humidity = current.relative_humidity_2m;
  const wind = Math.round(current.wind_speed_10m);
  const weatherCode = current.weathercode;

  const weather = weatherDescriptions[weatherCode] || {
    label: "Unknown",
    emoji: "🌡",
  };

  const city =
    geoData.address?.city ||
    geoData.address?.town ||
    geoData.address?.village ||
    "Unknown location";

  const country = geoData.address?.country || "";

  document.getElementById("weather-icon").textContent = weather.emoji;
  document.getElementById("temp").textContent = `${temp}°C`;
  document.getElementById("description").textContent = weather.label;
  document.getElementById("feels-like").textContent = `${feelsLike}°C`;
  document.getElementById("humidity").textContent = `${humidity}%`;
  document.getElementById("wind").textContent = `${wind} km/h`;
  document.getElementById("location").textContent = `📍 ${city}, ${country}`;

  setStatus("");
  document.getElementById("weather-card").style.display = "block";
}

// Error Handling
function onError(error) {
  if (error.code === 1) {
    setStatus("❌ Location access denied. Please allow it in your browser.");
  } else {
    setStatus("❌ Could not get your location. Try again.");
  }
}

// Helpers
function setStatus(msg) {
  document.getElementById("status").textContent = msg;
}