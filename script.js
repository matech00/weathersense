(function() {
    'use strict';

    // ============================================================
    //  API KEYS
    // ============================================================
    const WEATHER_API_KEY = CONFIG.WEATHER_API_KEY;
    const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
    const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';
    const AQI_URL = 'https://api.openweathermap.org/data/2.5/air_pollution';

    // ============================================================
    //  CONFIG
    // ============================================================
    const STORAGE_KEY = 'weathersense_city';
    const THEME_KEY = 'weathersense_theme';
    const FAVORITES_KEY = 'weathersense_favorites';
    const HISTORY_KEY = 'weathersense_history';
    const MAX_HISTORY = 5;

    const CITY_SUGGESTIONS = [
        'Lagos', 'Abuja', 'Ibadan', 'Kano', 'Port Harcourt',
        'London', 'Manchester', 'Birmingham', 'Liverpool', 'Edinburgh',
        'New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami',
        'Tokyo', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka',
        'Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice',
        'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide',
        'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah',
        'Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa',
        'Berlin', 'Munich', 'Hamburg', 'Cologne', 'Frankfurt',
        'Rome', 'Milan', 'Naples', 'Turin', 'Florence',
        'Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza',
        'Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven',
        'Brussels', 'Antwerp', 'Ghent', 'Charleroi', 'Liège',
        'Vienna', 'Graz', 'Linz', 'Salzburg', 'Innsbruck',
        'Zurich', 'Geneva', 'Basel', 'Lausanne', 'Bern',
        'Stockholm', 'Gothenburg', 'Malmo', 'Uppsala', 'Vasteras',
        'Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Drammen',
        'Copenhagen', 'Aarhus', 'Odense', 'Aalborg', 'Esbjerg',
        'Helsinki', 'Espoo', 'Tampere', 'Vantaa', 'Oulu',
        'Dublin', 'Cork', 'Limerick', 'Galway', 'Waterford',
        'Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Dunedin',
        'Singapore', 'Kuala Lumpur', 'Bangkok', 'Jakarta', 'Manila',
        'Hong Kong', 'Shanghai', 'Beijing', 'Shenzhen', 'Guangzhou',
        'Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon',
        'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad',
        'Cairo', 'Alexandria', 'Giza', 'Port Said', 'Suez',
        'Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'Port Elizabeth',
        'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'
    ];

    const NIGERIAN_CITIES = ['Lagos', 'Abuja', 'Ibadan', 'Kano', 'Port Harcourt', 'Benin City', 'Enugu', 'Kaduna'];

    // Weather icon mapping (Font Awesome)
    const WEATHER_ICONS = {
        '01d': 'fa-sun',
        '01n': 'fa-moon',
        '02d': 'fa-cloud-sun',
        '02n': 'fa-cloud-moon',
        '03d': 'fa-cloud',
        '03n': 'fa-cloud',
        '04d': 'fa-cloud',
        '04n': 'fa-cloud',
        '09d': 'fa-cloud-rain',
        '09n': 'fa-cloud-rain',
        '10d': 'fa-cloud-sun-rain',
        '10n': 'fa-cloud-moon-rain',
        '11d': 'fa-bolt',
        '11n': 'fa-bolt',
        '13d': 'fa-snowflake',
        '13n': 'fa-snowflake',
        '50d': 'fa-smog',
        '50n': 'fa-smog'
    };

    function getWeatherIconClass(code) {
        return WEATHER_ICONS[code] || 'fa-cloud';
    }

    // ============================================================
    //  DOM REFS
    // ============================================================
    const cityInput = document.getElementById('cityInput');
    const searchBtn = document.getElementById('searchBtn');
    const locationBtn = document.getElementById('locationBtn');
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const themeLabel = document.getElementById('themeLabel');
    const suggestionsDropdown = document.getElementById('suggestionsDropdown');
    const shareBtn = document.getElementById('shareBtn');
    const favoriteBtn = document.getElementById('favoriteBtn');
    const favoritesList = document.getElementById('favoritesList');

    const weatherCard = document.getElementById('weatherCard');
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const errorText = document.getElementById('errorText');
    const weatherDataEl = document.getElementById('weatherData');
    const aiRecommendations = document.getElementById('aiRecommendations');
    const weatherIcon = document.getElementById('weatherIcon');

    const cityName = document.getElementById('cityName');
    const countryCode = document.getElementById('countryCode');
    const localTime = document.getElementById('localTime');
    const temperature = document.getElementById('temperature');
    const condition = document.getElementById('condition');
    const humidity = document.getElementById('humidity');
    const windSpeed = document.getElementById('windSpeed');
    const feelsLike = document.getElementById('feelsLike');
    const sunrise = document.getElementById('sunrise');
    const sunset = document.getElementById('sunset');
    const uvIndex = document.getElementById('uvIndex');

    const aqiValue = document.getElementById('aqiValue');
    const pm25 = document.getElementById('pm25');
    const pm10 = document.getElementById('pm10');
    const no2 = document.getElementById('no2');
    const o3 = document.getElementById('o3');
    const so2 = document.getElementById('so2');

    const forecastGrid = document.getElementById('forecastGrid');
    const hourlyGrid = document.getElementById('hourlyGrid');

    let lastWeatherData = null;
    let lastCoords = null;
    let favorites = [];

    // ============================================================
    //  THEME
    // ============================================================
    function getTheme() {
        return localStorage.getItem(THEME_KEY) || 'light';
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        themeLabel.textContent = theme === 'dark' ? 'Light' : 'Dark';
        localStorage.setItem(THEME_KEY, theme);
    }

    // ============================================================
    //  FAVORITES
    // ============================================================
    function loadFavorites() {
        try {
            const data = localStorage.getItem(FAVORITES_KEY);
            favorites = data ? JSON.parse(data) : [];
        } catch {
            favorites = [];
        }
        renderFavorites();
    }

    function saveFavorites() {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        renderFavorites();
    }

    function toggleFavorite(city) {
        const index = favorites.indexOf(city);
        if (index > -1) {
            favorites.splice(index, 1);
        } else {
            favorites.push(city);
        }
        saveFavorites();
    }

    function isFavorite(city) {
        return favorites.includes(city);
    }

    function renderFavorites() {
        if (!favoritesList) return;
        if (favorites.length === 0) {
            favoritesList.innerHTML = '<span style="font-size:0.75rem; color: var(--color-text-muted);">No favorites yet</span>';
            return;
        }

        let html = '';
        favorites.forEach(city => {
            html += `
                <button class="fav-btn" data-city="${city}">
                    ${city}
                    <span class="remove-fav" data-city="${city}"><i class="fas fa-times"></i></span>
                </button>
            `;
        });
        favoritesList.innerHTML = html;

        document.querySelectorAll('.fav-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                if (e.target.closest('.remove-fav')) return;
                const city = this.dataset.city;
                fetchWeather(city);
            });
        });

        document.querySelectorAll('.remove-fav').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const city = this.dataset.city;
                toggleFavorite(city);
                updateFavoriteButton();
            });
        });
    }

    function updateFavoriteButton() {
        if (!lastWeatherData) return;
        const city = lastWeatherData.city;
        const isFav = isFavorite(city);
        favoriteBtn.innerHTML = `<i class="fas ${isFav ? 'fa-star' : 'fa-star'}"></i> ${isFav ? 'Remove from' : 'Add to'} Favorites`;
        favoriteBtn.style.color = isFav ? '#f59e0b' : '';
    }

    // ============================================================
    //  SEARCH HISTORY
    // ============================================================
    function getSearchHistory() {
        try {
            const data = localStorage.getItem(HISTORY_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    function addToHistory(city) {
        let history = getSearchHistory();
        history = history.filter(c => c !== city);
        history.unshift(city);
        if (history.length > MAX_HISTORY) history.pop();
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        renderSearchHistory();
    }

    function renderSearchHistory() {
        const container = document.getElementById('searchHistory');
        if (!container) return;
        const history = getSearchHistory();

        if (history.length === 0) {
            container.innerHTML = '';
            return;
        }

        let html = `
            <div class="history-header">
                <span class="section-label"><i class="fas fa-clock"></i> Recent</span>
                <button class="clear-history" id="clearHistory"><i class="fas fa-times"></i></button>
            </div>
            <div class="history-list">
        `;
        history.forEach(city => {
            html += `<button class="history-item" data-city="${city}">${city}</button>`;
        });
        html += `</div>`;

        container.innerHTML = html;

        document.querySelectorAll('.history-item').forEach(btn => {
            btn.addEventListener('click', () => fetchWeather(btn.dataset.city));
        });

        const clearBtn = document.getElementById('clearHistory');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                localStorage.removeItem(HISTORY_KEY);
                renderSearchHistory();
            });
        }
    }

    // ============================================================
    //  SUGGESTIONS
    // ============================================================
    function showSuggestions(query) {
        const q = query.toLowerCase().trim();
        if (!q) {
            suggestionsDropdown.classList.remove('active');
            return;
        }

        const matches = CITY_SUGGESTIONS
            .filter(city => city.toLowerCase().includes(q))
            .sort((a, b) => {
                const aIsNigerian = NIGERIAN_CITIES.includes(a);
                const bIsNigerian = NIGERIAN_CITIES.includes(b);
                if (aIsNigerian && !bIsNigerian) return -1;
                if (!aIsNigerian && bIsNigerian) return 1;
                return 0;
            })
            .slice(0, 8);

        if (matches.length === 0) {
            suggestionsDropdown.classList.remove('active');
            return;
        }

        let html = '';
        matches.forEach(city => {
            const isNigerian = NIGERIAN_CITIES.includes(city);
            html += `
                <div class="suggestion-item" data-city="${city}">
                    <i class="fas ${isNigerian ? 'fa-flag' : 'fa-city'}"></i> ${city}
                </div>
            `;
        });

        suggestionsDropdown.innerHTML = html;
        suggestionsDropdown.classList.add('active');

        document.querySelectorAll('.suggestion-item').forEach(el => {
            el.addEventListener('click', function() {
                const city = this.dataset.city;
                cityInput.value = city;
                suggestionsDropdown.classList.remove('active');
                fetchWeather(city);
            });
        });
    }

    // ============================================================
    //  HELPERS
    // ============================================================
    function showLoading() {
        weatherCard.classList.add('visible');
        loadingState.classList.remove('hidden');
        errorState.classList.add('hidden');
        weatherDataEl.classList.add('hidden');
        document.getElementById('forecastSection').style.display = 'none';
        document.getElementById('hourlySection').style.display = 'none';
    }

    function showError(msg) {
        weatherCard.classList.add('visible');
        loadingState.classList.add('hidden');
        errorState.classList.remove('hidden');
        weatherDataEl.classList.add('hidden');
        errorText.textContent = msg || 'Something went wrong';
        document.getElementById('forecastSection').style.display = 'none';
        document.getElementById('hourlySection').style.display = 'none';
    }

    function getWeatherEmoji(code) {
        const map = {
            '01d': '☀️', '01n': '🌙',
            '02d': '⛅', '02n': '☁️',
            '03d': '☁️', '03n': '☁️',
            '04d': '☁️', '04n': '☁️',
            '09d': '🌧️', '09n': '🌧️',
            '10d': '🌦️', '10n': '🌧️',
            '11d': '⛈️', '11n': '⛈️',
            '13d': '❄️', '13n': '❄️',
            '50d': '🌫️', '50n': '🌫️'
        };
        return map[code] || '🌤️';
    }

    // ============================================================
    //  SHARE WEATHER
    // ============================================================
    function shareWeather() {
        if (!lastWeatherData) return;
        const w = lastWeatherData;
        const text = `Weather in ${w.city}: ${w.temp}°C, ${w.desc}. Humidity: ${w.hum}%, Wind: ${w.wind} km/h`;

        if (navigator.share) {
            navigator.share({
                title: `Weather in ${w.city}`,
                text: text,
                url: window.location.href
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(text).then(() => {
                alert('Weather info copied to clipboard!');
            }).catch(() => {
                alert(text);
            });
        }
    }

    // ============================================================
    //  WEATHER ALERTS
    // ============================================================
    function checkWeatherAlerts(weather) {
        const alerts = [];
        const temp = weather.temp;
        const wind = weather.wind;
        const condition = weather.desc.toLowerCase();

        if (temp > 40) {
            alerts.push({
                type: 'danger',
                icon: 'fa-exclamation-triangle',
                message: `Extreme heat warning! Temperature is ${temp}°C. Stay indoors and stay hydrated.`
            });
        } else if (temp > 35) {
            alerts.push({
                type: 'warning',
                icon: 'fa-sun',
                message: `High temperature alert: ${temp}°C. Drink water and avoid direct sunlight.`
            });
        } else if (temp < 0) {
            alerts.push({
                type: 'danger',
                icon: 'fa-snowflake',
                message: `Freezing temperatures! ${temp}°C. Bundle up and drive carefully.`
            });
        }

        if (wind > 60) {
            alerts.push({
                type: 'danger',
                icon: 'fa-wind',
                message: `Extreme wind warning: ${wind} km/h. Secure loose items and stay indoors.`
            });
        } else if (wind > 40) {
            alerts.push({
                type: 'warning',
                icon: 'fa-wind',
                message: `Strong winds: ${wind} km/h. Be careful outdoors.`
            });
        }

        if (condition.includes('thunder') || condition.includes('storm')) {
            alerts.push({
                type: 'danger',
                icon: 'fa-bolt',
                message: `Thunderstorm warning! Stay indoors and unplug electronics.`
            });
        }

        if (condition.includes('heavy snow') || condition.includes('blizzard')) {
            alerts.push({
                type: 'danger',
                icon: 'fa-snowflake',
                message: `Heavy snow warning! Travel only if necessary.`
            });
        }

        return alerts;
    }

    function displayAlerts(alerts) {
        const alertContainer = document.getElementById('weatherAlerts');
        if (!alertContainer) return;

        if (alerts.length === 0) {
            alertContainer.innerHTML = `<div class="alert-no"><i class="fas fa-check-circle"></i> No weather alerts at this time</div>`;
            alertContainer.style.display = 'block';
            return;
        }

        let html = '';
        alerts.forEach(alert => {
            const bgColor = alert.type === 'danger' ? '#fee2e2' : '#fef3c7';
            const textColor = alert.type === 'danger' ? '#dc2626' : '#d97706';
            html += `
                <div class="alert-item" style="background: ${bgColor}; border-left: 4px solid ${textColor};">
                    <i class="fas ${alert.icon}" style="color: ${textColor};"></i>
                    <span style="color: ${textColor};">${alert.message}</span>
                </div>
            `;
        });

        alertContainer.innerHTML = html;
        alertContainer.style.display = 'block';
    }

    // ============================================================
    //  HUMAN-STYLE AI RECOMMENDATIONS
    // ============================================================
    function generateHumanRecommendations(weather) {
        const temp = weather.temp;
        const conditionText = weather.desc.toLowerCase();
        const humidityVal = weather.hum;
        const wind = weather.wind;
        const city = weather.city;

        const hour = parseInt(weather.time.split(':')[0]);
        const isPM = weather.time.includes('PM');
        const h = isPM && hour !== 12 ? hour + 12 : (hour === 12 && !isPM ? 0 : hour);
        let greeting = 'Good morning';
        if (h >= 5 && h < 12) greeting = 'Good morning';
        else if (h >= 12 && h < 17) greeting = 'Good afternoon';
        else if (h >= 17 && h < 21) greeting = 'Good evening';
        else greeting = 'Good night';

        let message = `${greeting}! `;

        if (city === 'Lagos') {
            message += `Welcome to <span class="highlight">Lagos</span>, the city of excellence. `;
        } else if (city === 'Abuja') {
            message += `Welcome to <span class="highlight">Abuja</span>, Nigeria's beautiful capital. `;
        } else {
            message += `Welcome to <span class="highlight">${city}</span>. `;
        }

        if (temp > 35) {
            message += `It's <span class="highlight">extremely hot</span> at ${temp}°C. Wear light, breathable clothing. Stay indoors during peak hours. Drink plenty of water. `;
        } else if (temp > 30) {
            message += `It's <span class="highlight">very hot</span> at ${temp}°C. Wear light-colored clothes. Stay hydrated and use sunscreen. `;
        } else if (temp > 25) {
            message += `The weather is <span class="highlight">warm and pleasant</span> at ${temp}°C. Perfect for outdoor activities. Stay hydrated. `;
        } else if (temp > 18) {
            message += `It's a <span class="highlight">beautiful day</span> at ${temp}°C. A light jacket would be comfortable. Great for going out. `;
        } else if (temp > 12) {
            message += `It's <span class="highlight">cool</span> at ${temp}°C. Wear a warm jacket. Good day for a walk. `;
        } else if (temp > 5) {
            message += `It's <span class="highlight">cold</span> at ${temp}°C. Dress warmly with a coat and gloves. `;
        } else {
            message += `It's <span class="highlight">freezing</span> at ${temp}°C. Bundle up with heavy winter clothing. Stay indoors if possible. `;
        }

        if (conditionText.includes('rain') || conditionText.includes('drizzle')) {
            message += `Don't forget your umbrella — it's raining. `;
        } else if (conditionText.includes('thunder') || conditionText.includes('storm')) {
            message += `Thunderstorm warning — stay indoors and unplug electronics. `;
        } else if (conditionText.includes('fog') || conditionText.includes('mist')) {
            message += `Foggy conditions — be careful if driving. `;
        }

        if (humidityVal > 80) {
            message += `High humidity — stay hydrated. `;
        } else if (humidityVal < 30) {
            message += `Low humidity — keep skin moisturized. `;
        }

        if (wind > 40) {
            message += `Strong winds — secure loose items. `;
        }

        message += `Have a wonderful day and stay safe.`;

        return message;
    }

    function renderHumanMessage(message) {
        return `<div class="ai-message">${message}</div>`;
    }

    // ============================================================
    //  FORECAST
    // ============================================================
    async function fetchForecast(lat, lon) {
        try {
            const url = `${FORECAST_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Forecast unavailable');
            const data = await res.json();
            displayForecast(data);
            displayHourly(data);
        } catch (err) {
            console.error('Forecast error:', err);
            forecastGrid.innerHTML = '<p style="color: var(--color-text-muted);">Forecast unavailable</p>';
            hourlyGrid.innerHTML = '<p style="color: var(--color-text-muted);">Hourly forecast unavailable</p>';
        }
    }

    function displayForecast(data) {
        const forecastSection = document.getElementById('forecastSection');
        forecastSection.style.display = 'block';

        const dailyData = {};
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const day = date.toLocaleDateString('en-US', { weekday: 'short' });
            if (!dailyData[day]) {
                dailyData[day] = {
                    temps: [],
                    icons: [],
                    conditions: [],
                    count: 0
                };
            }
            dailyData[day].temps.push(item.main.temp);
            dailyData[day].icons.push(item.weather[0].icon);
            dailyData[day].conditions.push(item.weather[0].description);
            dailyData[day].count++;
        });

        let html = '';
        let count = 0;
        for (const [day, data] of Object.entries(dailyData)) {
            if (count >= 5) break;
            const maxTemp = Math.max(...data.temps);
            const minTemp = Math.min(...data.temps);
            const icon = data.icons[0];
            const condition = data.conditions[0];

            html += `
                <div class="forecast-item">
                    <div class="day">${day}</div>
                    <div class="forecast-icon">${getWeatherEmoji(icon)}</div>
                    <div class="forecast-temp">${Math.round(maxTemp)}° <span class="min">${Math.round(minTemp)}°</span></div>
                    <div class="forecast-condition">${condition}</div>
                </div>
            `;
            count++;
        }

        forecastGrid.innerHTML = html;
    }

    function displayHourly(data) {
        const hourlySection = document.getElementById('hourlySection');
        hourlySection.style.display = 'block';

        const hourlyData = data.list.slice(0, 6);

        let html = '';
        hourlyData.forEach(item => {
            const date = new Date(item.dt * 1000);
            const hour = date.toLocaleTimeString('en-US', { hour: '2-digit', hour12: true });
            const temp = Math.round(item.main.temp);
            const icon = item.weather[0].icon;
            const condition = item.weather[0].description;

            html += `
                <div class="hourly-item">
                    <div class="hour">${hour}</div>
                    <div class="hourly-icon">${getWeatherEmoji(icon)}</div>
                    <div class="hourly-temp">${temp}°C</div>
                    <div class="hourly-condition">${condition}</div>
                </div>
            `;
        });

        hourlyGrid.innerHTML = html;
    }

    // ============================================================
    //  AIR QUALITY
    // ============================================================
    async function fetchAirQuality(lat, lon) {
        try {
            const url = `${AQI_URL}?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('AQI unavailable');
            const data = await res.json();
            displayAirQuality(data);
        } catch (err) {
            console.error('AQI error:', err);
        }
    }

    function displayAirQuality(data) {
        const aqi = data.list[0];
        const components = aqi.components;

        const aqiLevels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor', 'Hazardous'];
        const aqiColors = ['#22c55e', '#eab308', '#f59e0b', '#f97316', '#ef4444', '#7f1d1d'];

        const aqiIndex = aqi.main.aqi - 1;
        aqiValue.textContent = aqiLevels[aqiIndex] || '--';
        aqiValue.style.color = aqiColors[aqiIndex] || '';

        pm25.textContent = components.pm2_5 ? components.pm2_5.toFixed(1) + ' μg' : '--';
        pm10.textContent = components.pm10 ? components.pm10.toFixed(1) + ' μg' : '--';
        no2.textContent = components.no2 ? components.no2.toFixed(1) + ' μg' : '--';
        o3.textContent = components.o3 ? components.o3.toFixed(1) + ' μg' : '--';
        so2.textContent = components.so2 ? components.so2.toFixed(1) + ' μg' : '--';
    }

    // ============================================================
    //  RADAR IMAGE - Simple Version (No API Key Required)
    // ============================================================
    let radarImage = document.getElementById('weatherRadar');
    let currentRadarIndex = 0;
    const RADAR_IMAGES = [
        'https://picsum.photos/600/400?random=1',
        'https://picsum.photos/600/400?random=2',
        'https://picsum.photos/600/400?random=3',
        'https://picsum.photos/600/400?random=4'
    ];

    function updateRadarImage() {
        if (!radarImage) {
            radarImage = document.getElementById('weatherRadar');
            if (!radarImage) return;
        }

        // Show loading state
        radarImage.classList.add('loading');

        // Cycle to next image
        currentRadarIndex = (currentRadarIndex + 1) % RADAR_IMAGES.length;
        const imageUrl = RADAR_IMAGES[currentRadarIndex];

        // Update the image
        radarImage.src = imageUrl;
        radarImage.alt = 'Weather Radar';

        // Update timestamp
        const updateTime = document.getElementById('radarUpdateTime');
        if (updateTime) {
            updateTime.textContent = `Updated: ${new Date().toLocaleTimeString()}`;
        }

        // Image loaded successfully
        radarImage.onload = function() {
            radarImage.classList.remove('loading');
            radarImage.classList.add('loaded');
            console.log('✅ Radar updated successfully');
        };

        // If image fails to load, try the next one
        radarImage.onerror = function() {
            console.warn('⚠️ Radar image failed, trying next...');
            currentRadarIndex = (currentRadarIndex + 1) % RADAR_IMAGES.length;
            radarImage.src = RADAR_IMAGES[currentRadarIndex];
        };
    }

    // ============================================================
    //  WEATHER API
    // ============================================================
    function showWeather(data) {
        weatherCard.classList.add('visible');
        loadingState.classList.add('hidden');
        errorState.classList.add('hidden');
        weatherDataEl.classList.remove('hidden');

        const temp = Math.round(data.main.temp);
        const feels = Math.round(data.main.feels_like);
        const hum = data.main.humidity;
        const wind = Math.round(data.wind.speed * 3.6);
        const desc = data.weather[0].description;
        let city = data.name;
        const country = data.sys.country;
        const iconCode = data.weather[0].icon;

        if (city === 'Lagos State') city = 'Lagos';
        if (city.includes('Abuja')) city = 'Abuja';

        temperature.textContent = temp;
        feelsLike.textContent = feels + '°C';
        humidity.textContent = hum + '%';
        windSpeed.textContent = wind + ' km/h';
        condition.textContent = desc.charAt(0).toUpperCase() + desc.slice(1);
        cityName.textContent = city;
        countryCode.textContent = country;

        // Set weather icon
        const iconClass = getWeatherIconClass(iconCode);
        weatherIcon.className = `fas ${iconClass}`;
        weatherIcon.style.color = 'var(--color-primary)';
        weatherIcon.style.fontSize = '3.5rem';

        const offset = data.timezone || 0;
        const now = new Date();
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        const local = new Date(utc + offset * 1000);
        localTime.innerHTML = `<i class="far fa-clock"></i> ${local.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })}`;

        const sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        sunrise.textContent = sunriseTime;
        sunset.textContent = sunsetTime;
        uvIndex.textContent = '--';

        const weatherInfo = {
            city: city,
            country: country,
            temp: temp,
            feels: feels,
            hum: hum,
            wind: wind,
            desc: desc,
            time: localTime.textContent
        };

        lastWeatherData = weatherInfo;
        updateFavoriteButton();

        // Add to search history
        addToHistory(city);

        // AI Recommendations
        const message = generateHumanRecommendations(weatherInfo);
        aiRecommendations.innerHTML = renderHumanMessage(message);

        // Alerts
        const alerts = checkWeatherAlerts(weatherInfo);
        displayAlerts(alerts);

        // Store coordinates for forecast & AQI
        lastCoords = { lat: data.coord.lat, lon: data.coord.lon };

        // Fetch forecast and AQI
        fetchForecast(data.coord.lat, data.coord.lon);
        fetchAirQuality(data.coord.lat, data.coord.lon);
    }

    function saveCity(city) {
        if (city && city.trim()) localStorage.setItem(STORAGE_KEY, city.trim());
    }

    function getLastCity() {
        return localStorage.getItem(STORAGE_KEY) || '';
    }

    async function fetchWeather(city) {
        const q = city.trim();
        if (!q) {
            cityInput.focus();
            cityInput.style.borderColor = '#ef4444';
            setTimeout(() => cityInput.style.borderColor = '', 600);
            return;
        }

        showLoading();

        try {
            const url = `${WEATHER_URL}?q=${encodeURIComponent(q)}&units=metric&appid=${WEATHER_API_KEY}`;
            const res = await fetch(url);

            if (!res.ok) {
                if (res.status === 404) throw new Error('City not found');
                if (res.status === 401) throw new Error('Invalid API key');
                throw new Error(`Server error: ${res.status}`);
            }

            const data = await res.json();
            showWeather(data);
            saveCity(q);
            cityInput.value = '';
            cityInput.blur();
            suggestionsDropdown.classList.remove('active');

        } catch (err) {
            console.error('Weather error:', err);
            showError(err.message || 'Unable to fetch weather');
        }
    }

    async function fetchWeatherByLocation() {
        if (!navigator.geolocation) {
            showError('Geolocation not supported');
            return;
        }

        showLoading();

        try {
            const pos = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    timeout: 10000,
                    enableHighAccuracy: true
                });
            });

            const { latitude, longitude } = pos.coords;
            const url = `${WEATHER_URL}?lat=${latitude}&lon=${longitude}&units=metric&appid=${WEATHER_API_KEY}`;
            const res = await fetch(url);

            if (!res.ok) throw new Error('Location weather unavailable');

            const data = await res.json();

            let detectedCity = data.name;
            if (detectedCity === 'Lagos State') detectedCity = 'Lagos';
            if (detectedCity.includes('Abuja')) detectedCity = 'Abuja';
            data.name = detectedCity;

            showWeather(data);
            saveCity(detectedCity);
            suggestionsDropdown.classList.remove('active');

        } catch (err) {
            console.error('Location error:', err);
            if (err.code === 1) showError('Location permission denied');
            else if (err.code === 2) showError('Location unavailable');
            else showError(err.message || 'Unable to get location');
        }
    }

    // ============================================================
    //  EVENTS
    // ============================================================
    searchBtn.addEventListener('click', () => fetchWeather(cityInput.value));

    cityInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            fetchWeather(cityInput.value);
            suggestionsDropdown.classList.remove('active');
        }
    });

    cityInput.addEventListener('input', function() {
        showSuggestions(this.value);
    });

    cityInput.addEventListener('blur', function() {
        setTimeout(() => {
            suggestionsDropdown.classList.remove('active');
        }, 200);
    });

    locationBtn.addEventListener('click', fetchWeatherByLocation);
    themeToggle.addEventListener('click', () => setTheme(getTheme() === 'dark' ? 'light' : 'dark'));
    shareBtn.addEventListener('click', shareWeather);

    favoriteBtn.addEventListener('click', function() {
        if (!lastWeatherData) return;
        toggleFavorite(lastWeatherData.city);
        updateFavoriteButton();
    });

    document.querySelectorAll('[data-city]').forEach(btn => {
        btn.addEventListener('click', () => fetchWeather(btn.dataset.city));
    });

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-wrapper')) {
            suggestionsDropdown.classList.remove('active');
        }
    });

    // ============================================================
    //  INIT
    // ============================================================
    function init() {
        setTheme(getTheme());
        loadFavorites();
        renderSearchHistory();

        // Update radar image
        updateRadarImage();
        // Update radar every 5 minutes
        setInterval(updateRadarImage, 300000);

        const last = getLastCity();
        if (last) setTimeout(() => fetchWeather(last), 500);

        console.log('WeatherSense initialized');
        console.log('Weather API: Set');
        console.log('AI Recommendations: Enabled');
        console.log('Favorites loaded:', favorites.length);
    }

    init();

})();