const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const CACHE_TTL = 10 * 60 * 1000;

const elements = {
  cityName: document.getElementById('cityName'),
  weatherDesc: document.getElementById('weatherDesc'),
  currentTemp: document.getElementById('currentTemp'),
  feelsLike: document.getElementById('feelsLike'),
  humidity: document.getElementById('humidity'),
  wind: document.getElementById('wind'),
  pressure: document.getElementById('pressure'),
  visibility: document.getElementById('visibility'),
  sunrise: document.getElementById('sunrise'),
  sunset: document.getElementById('sunset'),
  currentDate: document.getElementById('currentDate'),
  weatherIcon: document.getElementById('weatherIcon'),
  forecastGrid: document.getElementById('forecastGrid'),
  globalGrid: document.getElementById('globalGrid'),
  globalStatus: document.getElementById('globalStatus'),
  loadGlobalButton: document.getElementById('loadGlobalButton'),
  refreshGlobalButton: document.getElementById('refreshGlobalButton'),
  searchInput: document.getElementById('searchInput'),
  searchButton: document.getElementById('searchButton'),
  locateButton: document.getElementById('locateButton'),
  refreshButton: document.getElementById('refreshButton'),
  themeToggle: document.getElementById('themeToggle'),
  loader: document.getElementById('loader'),
  recentList: document.getElementById('recentList'),
  favoriteList: document.getElementById('favoriteList'),
  favoriteButton: document.getElementById('favoriteButton'),
  bgAnim: document.getElementById('bgAnim')
};

const state = {
  lastQuery: null,
  lastCoords: null,
  recent: JSON.parse(localStorage.getItem('weather_recent') || '[]'),
  favorites: JSON.parse(localStorage.getItem('weather_favorites') || '[]'),
  theme: localStorage.getItem('weather_theme') || 'light',
  globalLoaded: false
};

const TOP_CITIES = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego',
  'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco',
  'Indianapolis', 'Seattle', 'Denver', 'Washington', 'Boston', 'El Paso', 'Nashville', 'Detroit',
  'Oklahoma City', 'Portland', 'Las Vegas', 'Memphis', 'Louisville', 'Baltimore', 'Milwaukee', 'Albuquerque',
  'Tucson', 'Fresno', 'Sacramento', 'Kansas City', 'Atlanta', 'Miami', 'Raleigh', 'Omaha',
  'London', 'Paris', 'Berlin', 'Madrid', 'Rome', 'Amsterdam', 'Vienna', 'Prague',
  'Warsaw', 'Budapest', 'Dublin', 'Lisbon', 'Zurich', 'Stockholm', 'Oslo', 'Helsinki',
  'Copenhagen', 'Brussels', 'Athens', 'Istanbul', 'Moscow', 'Kyiv', 'Bucharest', 'Sofia',
  'Tokyo', 'Osaka', 'Seoul', 'Beijing', 'Shanghai', 'Hong Kong', 'Singapore', 'Bangkok',
  'Kuala Lumpur', 'Jakarta', 'Manila', 'Ho Chi Minh City', 'Hanoi', 'Mumbai', 'Delhi', 'Bengaluru',
  'Kolkata', 'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad', 'Dubai', 'Abu Dhabi', 'Doha',
  'Riyadh', 'Jeddah', 'Cairo', 'Casablanca', 'Lagos', 'Nairobi', 'Johannesburg', 'Cape Town',
  'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Auckland', 'Wellington', 'Toronto', 'Vancouver',
  'Montreal', 'Mexico City', 'Sao Paulo', 'Rio de Janeiro'
];

function getApiKey() {
  return (window.__OPENWEATHER_API_KEY__ || '').trim();
}

function setLoading(isLoading) {
  elements.loader.classList.toggle('hidden', !isLoading);
}

function setTheme(theme) {
  state.theme = theme;
  localStorage.setItem('weather_theme', theme);
  document.body.classList.toggle('theme-dark', theme === 'dark');
  document.body.classList.toggle('theme-light', theme !== 'dark');
}

function formatTime(timestampSeconds, timezoneOffset) {
  const date = new Date((timestampSeconds + timezoneOffset) * 1000);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

function formatDate(timestampSeconds, timezoneOffset) {
  const date = new Date((timestampSeconds + timezoneOffset) * 1000);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

function getWeatherTheme(main, isNight) {
  const condition = main.toLowerCase();
  if (isNight) {
    return { background: 'var(--bg-night)', anim: 'cloudy' };
  }
  if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('thunder')) {
    return { background: 'var(--bg-rain)', anim: 'rain' };
  }
  if (condition.includes('snow')) {
    return { background: 'var(--bg-night)', anim: 'snow' };
  }
  if (condition.includes('cloud')) {
    return { background: 'var(--bg-day)', anim: 'cloudy' };
  }
  return { background: 'var(--bg-day)', anim: '' };
}

function setBackground(main, isNight) {
  const theme = getWeatherTheme(main, isNight);
  document.body.style.background = theme.background;
  elements.bgAnim.className = `bg-anim ${theme.anim}`.trim();
}

function updateLists() {
  elements.recentList.innerHTML = '';
  elements.favoriteList.innerHTML = '';

  state.recent.slice(0, 6).forEach(city => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.textContent = city;
    btn.addEventListener('click', () => fetchWeatherByCity(city));
    li.appendChild(btn);
    elements.recentList.appendChild(li);
  });

  state.favorites.forEach(city => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.textContent = city;
    btn.addEventListener('click', () => fetchWeatherByCity(city));
    li.appendChild(btn);
    elements.favoriteList.appendChild(li);
  });
}

function updateFavoriteButton(city) {
  const isFav = state.favorites.includes(city);
  elements.favoriteButton.textContent = isFav ? '★' : '☆';
}

function pushRecent(city) {
  if (!city) return;
  state.recent = [city, ...state.recent.filter(item => item !== city)].slice(0, 8);
  localStorage.setItem('weather_recent', JSON.stringify(state.recent));
  updateLists();
}

function toggleFavorite(city) {
  if (!city) return;
  if (state.favorites.includes(city)) {
    state.favorites = state.favorites.filter(item => item !== city);
  } else {
    state.favorites = [city, ...state.favorites];
  }
  localStorage.setItem('weather_favorites', JSON.stringify(state.favorites));
  updateLists();
  updateFavoriteButton(city);
}

function cacheSet(key, data) {
  localStorage.setItem(key, JSON.stringify({
    timestamp: Date.now(),
    data
  }));
}

function cacheGet(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp < CACHE_TTL) {
      return parsed.data;
    }
  } catch (err) {
    return null;
  }
  return null;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const message = data.message || 'Request failed';
    throw new Error(message);
  }
  return response.json();
}

function ensureApiKey(showModal = true) {
  const apiKey = getApiKey();
  if (!apiKey || apiKey === 'YOUR_API_KEY') {
    return false;
  }
  return true;
}

function buildWeatherUrl(query) {
  return `${BASE_URL}/weather?${query}&appid=${getApiKey()}&units=metric`;
}

function buildForecastUrl(query) {
  return `${BASE_URL}/forecast?${query}&appid=${getApiKey()}&units=metric`;
}

async function getCurrentWeather(query, cacheKey) {
  const cached = cacheGet(cacheKey);
  if (cached) return cached;
  const data = await fetchJson(buildWeatherUrl(query));
  cacheSet(cacheKey, data);
  return data;
}

async function getForecast(query, cacheKey) {
  const cached = cacheGet(cacheKey);
  if (cached) return cached;
  const data = await fetchJson(buildForecastUrl(query));
  cacheSet(cacheKey, data);
  return data;
}

function summarizeForecast(list) {
  const days = {};
  list.forEach(item => {
    const date = item.dt_txt.split(' ')[0];
    if (!days[date]) {
      days[date] = {
        date,
        temps: [],
        icons: [],
        descriptions: []
      };
    }
    days[date].temps.push(item.main.temp);
    days[date].icons.push(item.weather[0].icon);
    days[date].descriptions.push(item.weather[0].description);
  });

  const entries = Object.values(days).slice(0, 5);
  return entries.map(day => {
    const min = Math.min(...day.temps);
    const max = Math.max(...day.temps);
    const icon = day.icons[Math.floor(day.icons.length / 2)];
    const description = day.descriptions[Math.floor(day.descriptions.length / 2)];
    return { date: day.date, min, max, icon, description };
  });
}

function updateForecast(forecast) {
  elements.forecastGrid.innerHTML = '';
  const days = summarizeForecast(forecast.list || []);

  days.forEach(day => {
    const card = document.createElement('div');
    card.className = 'forecast-card glass';
    const dateLabel = new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(new Date(day.date));

    card.innerHTML = `
      <div>${dateLabel}</div>
      <img src="https://openweathermap.org/img/wn/${day.icon}@2x.png" alt="${day.description}" />
      <div>${day.description}</div>
      <strong>${Math.round(day.max)}° / ${Math.round(day.min)}°</strong>
    `;

    elements.forecastGrid.appendChild(card);
  });
}

function updateGlobalStatus(message) {
  elements.globalStatus.textContent = message;
}

function createCityCard(city, data) {
  const card = document.createElement('div');
  card.className = 'city-card glass';
  card.innerHTML = `
    <div class="city-name">${city}</div>
    <div class="city-temp">${Math.round(data.main.temp)}°</div>
    <div class="city-desc">${data.weather[0].description}</div>
    <div class="city-meta">H: ${Math.round(data.main.temp_max)}°  L: ${Math.round(data.main.temp_min)}°</div>
  `;
  return card;
}

function createCityErrorCard(city, message) {
  const card = document.createElement('div');
  card.className = 'city-card glass';
  card.innerHTML = `
    <div class="city-name">${city}</div>
    <div class="city-temp">—</div>
    <div class="city-desc">${message}</div>
  `;
  return card;
}

async function mapWithConcurrency(items, limit, iterator) {
  const results = [];
  let index = 0;

  const workers = new Array(limit).fill(null).map(async () => {
    while (index < items.length) {
      const current = index++;
      results[current] = await iterator(items[current], current);
    }
  });

  await Promise.all(workers);
  return results;
}

async function loadGlobalCities(forceRefresh = false) {
  if (!ensureApiKey()) return;
  const cities = TOP_CITIES.slice(0, 100);
  elements.globalGrid.innerHTML = '';
  updateGlobalStatus('Loading 0 / 100');
  setLoading(true);

  let loaded = 0;

  await mapWithConcurrency(cities, 6, async city => {
    try {
      const cacheKey = `weather_city_${city.toLowerCase()}`;
      let data = forceRefresh ? null : cacheGet(cacheKey);
      if (!data) {
        data = await getCurrentWeather(`q=${encodeURIComponent(city)}`, cacheKey);
      }
      const card = createCityCard(city, data);
      elements.globalGrid.appendChild(card);
    } catch (err) {
      const card = createCityErrorCard(city, 'Unavailable');
      elements.globalGrid.appendChild(card);
    } finally {
      loaded += 1;
      updateGlobalStatus(`Loading ${loaded} / 100`);
    }
  });

  updateGlobalStatus('Updated just now');
  setLoading(false);
  state.globalLoaded = true;
}

function updateWeatherUI(data) {
  const isNight = data.dt > data.sys.sunset || data.dt < data.sys.sunrise;
  setBackground(data.weather[0].main, isNight);

  elements.cityName.textContent = `${data.name}, ${data.sys.country}`;
  elements.weatherDesc.textContent = data.weather[0].description;
  elements.currentTemp.textContent = `${Math.round(data.main.temp)}°`;
  elements.feelsLike.textContent = `Feels like ${Math.round(data.main.feels_like)}°`;
  elements.humidity.textContent = `${data.main.humidity}%`;
  elements.wind.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
  elements.pressure.textContent = `${data.main.pressure} hPa`;
  elements.visibility.textContent = `${Math.round((data.visibility || 0) / 1000)} km`;
  elements.sunrise.textContent = formatTime(data.sys.sunrise, data.timezone);
  elements.sunset.textContent = formatTime(data.sys.sunset, data.timezone);
  elements.currentDate.textContent = formatDate(data.dt, data.timezone);

  elements.weatherIcon.innerHTML = `
    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png" alt="${data.weather[0].description}" />
  `;

  updateFavoriteButton(data.name);
}

async function fetchWeatherByCity(city) {
  if (!ensureApiKey()) return;
  const query = `q=${encodeURIComponent(city)}`;
  const cacheKeyWeather = `weather_city_${city.toLowerCase()}`;
  const cacheKeyForecast = `forecast_city_${city.toLowerCase()}`;

  try {
    setLoading(true);
    const [current, forecast] = await Promise.all([
      getCurrentWeather(query, cacheKeyWeather),
      getForecast(query, cacheKeyForecast)
    ]);
    updateWeatherUI(current);
    updateForecast(forecast);
    state.lastQuery = city;
    pushRecent(current.name);
  } catch (err) {
    alert(`Unable to fetch weather: ${err.message}`);
  } finally {
    setLoading(false);
  }
}

async function fetchWeatherByCoords(lat, lon) {
  if (!ensureApiKey()) return;
  const query = `lat=${lat}&lon=${lon}`;
  const cacheKeyWeather = `weather_coords_${lat.toFixed(2)}_${lon.toFixed(2)}`;
  const cacheKeyForecast = `forecast_coords_${lat.toFixed(2)}_${lon.toFixed(2)}`;

  try {
    setLoading(true);
    const [current, forecast] = await Promise.all([
      getCurrentWeather(query, cacheKeyWeather),
      getForecast(query, cacheKeyForecast)
    ]);
    updateWeatherUI(current);
    updateForecast(forecast);
    state.lastCoords = { lat, lon };
    pushRecent(current.name);
  } catch (err) {
    alert(`Unable to fetch weather: ${err.message}`);
  } finally {
    setLoading(false);
  }
}

function useGeolocation() {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser.');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    position => {
      fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
    },
    () => {
      alert('Location access denied. Please search for a city.');
    }
  );
}

function initListeners() {
  elements.searchButton.addEventListener('click', () => {
    const city = elements.searchInput.value.trim();
    if (city) fetchWeatherByCity(city);
  });

  elements.searchInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      const city = elements.searchInput.value.trim();
      if (city) fetchWeatherByCity(city);
    }
  });

  elements.locateButton.addEventListener('click', useGeolocation);

  elements.refreshButton.addEventListener('click', () => {
    if (state.lastQuery) return fetchWeatherByCity(state.lastQuery);
    if (state.lastCoords) return fetchWeatherByCoords(state.lastCoords.lat, state.lastCoords.lon);
    useGeolocation();
  });

  elements.themeToggle.addEventListener('click', () => {
    setTheme(state.theme === 'dark' ? 'light' : 'dark');
  });

  elements.favoriteButton.addEventListener('click', () => {
    const city = elements.cityName.textContent.split(',')[0];
    if (city && city !== '—') toggleFavorite(city);
  });

  elements.loadGlobalButton.addEventListener('click', () => {
    if (!state.globalLoaded) loadGlobalCities(false);
  });

  elements.refreshGlobalButton.addEventListener('click', () => {
    loadGlobalCities(true);
  });

}

function init() {
  setTheme(state.theme);
  updateLists();
  initListeners();
  if (ensureApiKey(false)) {
    useGeolocation();
    loadGlobalCities(false);
  }
}

init();
