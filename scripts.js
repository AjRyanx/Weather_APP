const API_KEY = '7473c4db35c44f53a72154628261405';
const BASE_URL = 'https://api.weatherapi.com/v1';

const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const currentWeather = document.getElementById('current-weather');
const cityName = document.getElementById('city-name');
const weatherIcon = document.getElementById('weather-icon');
const temperature = document.getElementById('temperature');
const weatherDescription = document.getElementById('weather-description');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const forecastSection = document.getElementById('forecast');
const forecastCards = document.getElementById('forecast-cards');
const themeToggle = document.getElementById('theme-toggle');

initTheme();
themeToggle.addEventListener('click', toggleTheme);
searchForm.addEventListener('submit', handleSearch);

function initTheme() {
  const saved = localStorage.getItem('theme');
  const theme = saved || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
}

async function handleSearch(e) {
  e.preventDefault();
  const city = searchInput.value.trim();
  if (!city) return;

  hideError();
  showLoading();
  hideResults();

  try {
    const data = await getWeatherData(city);
    displayCurrentWeather(data.current);
    displayForecast(data.forecast);
    showResults();
    animateCards();
  } catch (err) {
    showError(err.message);
  } finally {
    hideLoading();
  }
}

async function getWeatherData(city) {
  const params = `key=${API_KEY}&q=${encodeURIComponent(city)}`;

  const [currentRes, forecastRes] = await Promise.all([
    fetch(`${BASE_URL}/current.json?${params}`),
    fetch(`${BASE_URL}/forecast.json?${params}&days=5`),
  ]);

  if (!currentRes.ok || !forecastRes.ok) {
    if (currentRes.status === 400 || forecastRes.status === 400) {
      throw new Error('City not found. Please check the name and try again.');
    }
    throw new Error('Unable to fetch weather data. Please try again later.');
  }

  const [current, forecast] = await Promise.all([
    currentRes.json(),
    forecastRes.json(),
  ]);

  return { current, forecast };
}

function displayCurrentWeather(data) {
  cityName.textContent = `${data.location.name}, ${data.location.country}`;
  weatherIcon.src = `https:${data.current.condition.icon}`;
  weatherIcon.alt = data.current.condition.text;
  temperature.textContent = `${Math.round(data.current.temp_c)}°C`;
  weatherDescription.textContent = data.current.condition.text;
  humidity.textContent = `${data.current.humidity}%`;
  windSpeed.textContent = `${Math.round(data.current.wind_kph)} km/h`;
}

function displayForecast(data) {
  forecastCards.innerHTML = data.forecast.forecastday.map((day) => {
    const date = new Date(day.date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

    return `
      <div class="forecast-card">
        <div class="day">${dayName}</div>
        <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
        <div class="temp">
          <span class="temp-high">${Math.round(day.day.maxtemp_c)}°</span> / ${Math.round(day.day.mintemp_c)}°
        </div>
      </div>
    `;
  }).join('');
}

function animateCards() {
  const cards = document.querySelectorAll('.forecast-card');
  cards.forEach((card, i) => {
    card.style.animation = 'none';
    card.offsetHeight;
    card.style.animation = `cardIn 0.4s ease both`;
    card.style.animationDelay = `${0.05 + i * 0.05}s`;
  });
}

function showLoading() {
  loading.classList.remove('hidden');
}

function hideLoading() {
  loading.classList.add('hidden');
}

function showError(msg) {
  error.textContent = msg;
  error.classList.remove('hidden');
}

function hideError() {
  error.textContent = '';
  error.classList.add('hidden');
}

function showResults() {
  currentWeather.classList.remove('hidden');
  forecastSection.classList.remove('hidden');
}

function hideResults() {
  currentWeather.classList.add('hidden');
  forecastSection.classList.add('hidden');
}
