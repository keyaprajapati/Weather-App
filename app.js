// --- CONSTANTS & CONFIGURATION ---
const API_KEY = 'dcade78053msh8ee91da1fd0e3e3p134b5fjsnb87578d8062e';
const API_HOST = 'weather-by-api-ninjas.p.rapidapi.com';

// Comprehensive Local Weather Database focusing primarily on India
const CLIMATE_DATABASE = {
    "vadodara": { "temp": 33, "feels_like": 38, "humidity": 70, "min_temp": 28, "max_temp": 36, "wind_speed": 3.5, "wind_degrees": 230, "sunrise": 1613524200, "sunset": 1613568400, "cloud_pct": 40, "country": "IN" },
    "ahmedabad": { "temp": 35, "feels_like": 40, "humidity": 60, "min_temp": 29, "max_temp": 39, "wind_speed": 4.1, "wind_degrees": 240, "sunrise": 1613524300, "sunset": 1613568500, "cloud_pct": 30, "country": "IN" },
    "surat": { "temp": 32, "feels_like": 37, "humidity": 75, "min_temp": 27, "max_temp": 34, "wind_speed": 4.8, "wind_degrees": 220, "sunrise": 1613524400, "sunset": 1613568200, "cloud_pct": 50, "country": "IN" },
    "mumbai": { "temp": 31, "feels_like": 36, "humidity": 80, "min_temp": 26, "max_temp": 33, "wind_speed": 5.2, "wind_degrees": 210, "sunrise": 1613524500, "sunset": 1613568000, "cloud_pct": 60, "country": "IN" },
    "delhi": { "temp": 36, "feels_like": 42, "humidity": 55, "min_temp": 28, "max_temp": 41, "wind_speed": 3.8, "wind_degrees": 290, "sunrise": 1613523000, "sunset": 1613567500, "cloud_pct": 20, "country": "IN" },
    "bengaluru": { "temp": 27, "feels_like": 28, "humidity": 62, "min_temp": 21, "max_temp": 30, "wind_speed": 4.5, "wind_degrees": 130, "sunrise": 1613524000, "sunset": 1613567000, "cloud_pct": 45, "country": "IN" },
    "chennai": { "temp": 32, "feels_like": 38, "humidity": 82, "min_temp": 27, "max_temp": 35, "wind_speed": 4.0, "wind_degrees": 110, "sunrise": 1613523500, "sunset": 1613566500, "cloud_pct": 50, "country": "IN" },
    "tokyo": { "temp": 19, "feels_like": 18, "humidity": 55, "min_temp": 16, "max_temp": 22, "wind_speed": 3.2, "wind_degrees": 80, "sunrise": 1613511200, "sunset": 1613550400, "cloud_pct": 10, "country": "JP" },
    "london": { "temp": 8, "feels_like": 5, "humidity": 82, "min_temp": 6, "max_temp": 10, "wind_speed": 6.4, "wind_degrees": 240, "sunrise": 1613550800, "sunset": 1613584800, "cloud_pct": 90, "country": "GB" },
    "sydney": { "temp": 26, "feels_like": 27, "humidity": 60, "min_temp": 22, "max_temp": 29, "wind_speed": 5.1, "wind_degrees": 180, "sunrise": 1613485200, "sunset": 1613532000, "cloud_pct": 40, "country": "AU" },
    "cairo": { "temp": 32, "feels_like": 34, "humidity": 30, "min_temp": 25, "max_temp": 36, "wind_speed": 2.5, "wind_degrees": 340, "sunrise": 1613521200, "sunset": 1613560800, "cloud_pct": 5, "country": "EG" },
    "seattle": { "temp": 12, "feels_like": 11, "humidity": 65, "min_temp": 10, "max_temp": 14, "wind_speed": 4.12, "wind_degrees": 120, "sunrise": 1613547200, "sunset": 1613586400, "cloud_pct": 20, "country": "US" }
};

// --- GLOBAL APP STATES ---
let currentUnit = 'C';
let lastWeatherData = null;
let lastCitySearched = "Vadodara";
let particleSystem = [];
let canvas, ctx;
let animationFrameId;

// --- LIFECYCLE & INITIALIZATION ---
window.onload = function() {
    lucide.createIcons();
    initCanvas();
    loadRecentSearches();

    // First display default Vadodara
    fetchWeather('Vadodara');

    // Responsive canvas sizing
    window.addEventListener('resize', resizeCanvas);

    // Start Canvas Atmospheric Loop
    animateCanvas();
};

// --- TOAST NOTIFICATIONS ---
function showToast(message, type = "info") {
    const toast = document.getElementById('toastNotification');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');

    toastMessage.textContent = message;

    if (type === "error") {
        toastIcon.innerHTML = `<i data-lucide="alert-circle" class="w-5 h-5 text-rose-300"></i>`;
        toastIcon.className = "p-2 rounded-lg bg-rose-500/20 text-rose-300";
    } else if (type === "success") {
        toastIcon.innerHTML = `<i data-lucide="check-circle" class="w-5 h-5 text-emerald-300"></i>`;
        toastIcon.className = "p-2 rounded-lg bg-emerald-500/20 text-emerald-300";
    } else {
        toastIcon.innerHTML = `<i data-lucide="info" class="w-5 h-5 text-indigo-300"></i>`;
        toastIcon.className = "p-2 rounded-lg bg-indigo-500/20 text-indigo-300";
    }
    lucide.createIcons();

    toast.classList.remove('translate-y-[-100px]', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(closeToast, 4000);
}

function closeToast() {
    const toast = document.getElementById('toastNotification');
    toast.classList.add('translate-y-[-100px]', 'opacity-0');
    toast.classList.remove('translate-y-0', 'opacity-100');
}

// --- API INTEGRATION ---
async function fetchWeather(city) {
    if (!city || city.trim() === "") return;
    const normalizedCity = city.trim();
    showToast(`Sensing atmospheric metrics for ${normalizedCity}...`, "info");

    const url = `https://weather-by-api-ninjas.p.rapidapi.com/v1/weather?city=${encodeURIComponent(normalizedCity)}`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': API_KEY,
            'x-rapidapi-host': API_HOST,
            'Content-Type': 'application/json'
        }
    };

    let isUsingMock = false;
    let weatherData = null;

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`);
        }
        const resultText = await response.text();
        weatherData = JSON.parse(resultText);

        weatherData.country = guessCountry(normalizedCity);
        showToast(`Live weather loaded successfully!`, "success");
    } catch (error) {
        console.warn("RapidAPI Ninjas fetching failed or limit exceeded. Triggering advanced mock engine.", error);
        isUsingMock = true;
        weatherData = generateFallbackWeather(normalizedCity);
        showToast(`Simulation engine active for ${normalizedCity}.`, "info");
    }

    const dataSourceBadge = document.getElementById('dataSourceBadge');
    if (isUsingMock) {
        dataSourceBadge.innerHTML = `<i data-lucide="shield-alert" class="w-3.5 h-3.5 inline mr-1 text-amber-400"></i> Simulated Intelligence Mode`;
        dataSourceBadge.className = "flex items-center gap-1 text-amber-300";
    } else {
        dataSourceBadge.innerHTML = `<i data-lucide="zap" class="w-3.5 h-3.5 inline mr-1 text-emerald-400"></i> Live Premium API`;
        dataSourceBadge.className = "flex items-center gap-1 text-emerald-400";
    }
    lucide.createIcons();

    lastWeatherData = weatherData;
    lastCitySearched = normalizedCity;
    saveRecentSearch(normalizedCity);
    renderWeather(normalizedCity, weatherData);
}

function generateFallbackWeather(city) {
    const key = city.toLowerCase().trim();
    if (CLIMATE_DATABASE[key]) {
        return CLIMATE_DATABASE[key];
    }

    const charSum = city.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const seedTemp = 20 + (charSum % 20);
    const seedHumidity = 40 + (charSum % 51);
    const seedClouds = charSum % 100;

    return {
        temp: seedTemp,
        feels_like: Math.round(seedTemp + (seedHumidity > 70 ? 4 : 1)),
        humidity: seedHumidity,
        min_temp: seedTemp - 4,
        max_temp: seedTemp + 4,
        wind_speed: parseFloat(((charSum % 12) + 1.5).toFixed(2)),
        wind_degrees: charSum % 360,
        sunrise: Math.round(Date.now() / 1000 - 18000),
        sunset: Math.round(Date.now() / 1000 + 18000),
        cloud_pct: seedClouds,
        country: guessCountry(city)
    };
}

function guessCountry(city) {
    const normalized = city.toLowerCase().trim();
    if (CLIMATE_DATABASE[normalized]) {
        return CLIMATE_DATABASE[normalized].country === "IN" ? "GUJARAT, INDIA" : CLIMATE_DATABASE[normalized].country;
    }

    const majorCitesCountries = {
        "vadodara": "IN", "ahmedabad": "IN", "surat": "IN", "mumbai": "IN", "delhi": "IN",
        "bengaluru": "IN", "chennai": "IN", "kolkata": "IN", "pune": "IN", "hyderabad": "IN",
        "rajkot": "IN", "gandhinagar": "IN", "anand": "IN", "nadiad": "IN", "bharuch": "IN"
    };

    if (majorCitesCountries[normalized]) {
        return "GUJARAT, INDIA";
    }

    if (normalized.includes("india") || normalized.endsWith("in")) {
        return "INDIA";
    }

    return "GLOBAL REGION";
}

function renderWeather(cityName, data) {
    const displayTemp = convertTemp(data.temp);
    const displayMin = convertTemp(data.min_temp);
    const displayMax = convertTemp(data.max_temp);
    const displayFeels = convertTemp(data.feels_like);

    document.getElementById('cityName').textContent = cityName;

    let displayCountry = data.country || "WORLDWIDE";
    if (displayCountry === "IN" || ["vadodara", "ahmedabad", "surat"].includes(cityName.toLowerCase())) {
        displayCountry = "GUJARAT, INDIA";
    } else if (data.country === "IN" || ["mumbai", "delhi", "bengaluru", "chennai", "kolkata"].includes(cityName.toLowerCase())) {
        displayCountry = "INDIA";
    }

    document.getElementById('countryLabel').textContent = displayCountry;
    document.getElementById('heroTemp').textContent = Math.round(displayTemp);
    document.getElementById('heroUnit').textContent = `°${currentUnit}`;
    document.getElementById('minTempDisplay').textContent = `${Math.round(displayMin)}°${currentUnit}`;
    document.getElementById('maxTempDisplay').textContent = `${Math.round(displayMax)}°${currentUnit}`;
    document.getElementById('feelsLikeDisplay').textContent = `Feels like ${Math.round(displayFeels)}°${currentUnit}`;

    document.getElementById('windSpeed').textContent = data.wind_speed;
    document.getElementById('humidity').textContent = data.humidity;
    document.getElementById('humidityBar').style.width = `${data.humidity}%`;
    document.getElementById('cloudPct').textContent = data.cloud_pct;

    const windDegrees = data.wind_degrees;
    let windDirection = "North";
    if (windDegrees > 22.5 && windDegrees <= 67.5) windDirection = "Northeast";
    else if (windDegrees > 67.5 && windDegrees <= 112.5) windDirection = "East";
    else if (windDegrees > 112.5 && windDegrees <= 157.5) windDirection = "Southeast";
    else if (windDegrees > 157.5 && windDegrees <= 202.5) windDirection = "South";
    else if (windDegrees > 202.5 && windDegrees <= 247.5) windDirection = "Southwest";
    else if (windDegrees > 247.5 && windDegrees <= 292.5) windDirection = "West";
    else if (windDegrees > 292.5 && windDegrees <= 337.5) windDirection = "Northwest";
    document.getElementById('windDir').textContent = `${windDegrees}° ${windDirection}`;

    let cloudStatus = "Clear skies";
    if (data.cloud_pct > 80) cloudStatus = "Overcast conditions";
    else if (data.cloud_pct > 50) cloudStatus = "Heavy cloud cover";
    else if (data.cloud_pct > 20) cloudStatus = "Moderate scattering";
    document.getElementById('cloudStatus').textContent = cloudStatus;

    const formatUnixTime = (unixSec) => {
        if (!unixSec) return "06:05";
        const date = new Date(unixSec * 1000);
        let hours = date.getHours();
        let minutes = date.getMinutes();
        const strHours = hours < 10 ? '0' + hours : hours;
        const strMinutes = minutes < 10 ? '0' + minutes : minutes;
        return `${strHours}:${strMinutes}`;
    };
    document.getElementById('sunriseTime').textContent = formatUnixTime(data.sunrise);
    document.getElementById('sunsetTime').textContent = formatUnixTime(data.sunset);

    const state = determineWeatherState(data);
    applyDynamicAtmosphere(state);
    generateSmartRecommendations(data, state);
    updateWeatherIcon(state);
}

function determineWeatherState(data) {
    if (data.temp <= 5) return 'snowy';
    if (data.cloud_pct > 55 && data.humidity > 70) return 'rainy';
    if (data.cloud_pct > 60) return 'cloudy';
    if (data.temp > 32) return 'sunny-hot';
    return 'temperate';
}

function applyDynamicAtmosphere(state) {
    const body = document.body;
    const heroAmbient = document.getElementById('heroAmbientLight');
    body.className = "weather-bg-transition min-h-screen font-sans text-slate-100 flex flex-col justify-between overflow-x-hidden bg-gradient-to-br";

    if (state === 'snowy') {
        body.classList.add('from-slate-900', 'via-blue-950', 'to-slate-800');
        heroAmbient.className = "absolute -right-20 -top-20 w-64 h-64 bg-cyan-300/10 rounded-full blur-3xl pointer-events-none";
        setupParticles('snow');
    } else if (state === 'rainy') {
        body.classList.add('from-slate-950', 'via-indigo-950', 'to-slate-900');
        heroAmbient.className = "absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none";
        setupParticles('rain');
    } else if (state === 'cloudy') {
        body.classList.add('from-slate-900', 'via-slate-800', 'to-indigo-950');
        heroAmbient.className = "absolute -right-20 -top-20 w-64 h-64 bg-slate-400/10 rounded-full blur-3xl pointer-events-none";
        setupParticles('clouds');
    } else if (state === 'sunny-hot') {
        body.classList.add('from-amber-950', 'via-neutral-900', 'to-orange-950');
        heroAmbient.className = "absolute -right-20 -top-20 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none";
        setupParticles('sunny');
    } else {
        body.classList.add('from-slate-900', 'via-indigo-950', 'to-slate-900');
        heroAmbient.className = "absolute -right-20 -top-20 w-64 h-64 bg-sky-500/15 rounded-full blur-3xl pointer-events-none";
        setupParticles('temperate');
    }
}

function generateSmartRecommendations(data, state) {
    const attireEl = document.getElementById('attireRec');
    const activityEl = document.getElementById('activityRec');
    const advisoryEl = document.getElementById('advisoryRec');
    const indexEl = document.getElementById('climateIndex');

    if (state === 'snowy') {
        attireEl.textContent = "Thick thermal coat, insulated gloves, and windproof scarf recommended.";
        activityEl.textContent = "Optimal for indoor winter exercises or cozy local exploration.";
        advisoryEl.textContent = "Take precaution on walking sidewalks; surface freeze possible.";
        indexEl.textContent = "Frosty Focus";
    } else if (state === 'rainy') {
        attireEl.textContent = "Water-resistant outer shell, waterproof boots, and reliable umbrella.";
        activityEl.textContent = "Great day for indoor activities, library visits, or cozy cafes.";
        advisoryEl.textContent = "Monsoon shower pattern detected. Check local street flooding statuses.";
        indexEl.textContent = "High Monsoon";
    } else if (state === 'cloudy') {
        attireEl.textContent = "Light pullover or versatile transition trench coat is best.";
        activityEl.textContent = "Pleasant for photography or urban neighborhood walks.";
        advisoryEl.textContent = "Low UV radiation today. Comfortable outdoor day with no heat pressure.";
        indexEl.textContent = "Soft Cover";
    } else if (state === 'sunny-hot') {
        attireEl.textContent = "Linen garments, dark sunglasses, and sunscreen are absolute essentials.";
        activityEl.textContent = "Avoid direct mid-day sun; high hydration intake needed.";
        advisoryEl.textContent = "Intense UV peaks. Enjoy shaded indoor architectures.";
        indexEl.textContent = "Solar Peak";
    } else {
        attireEl.textContent = "Cozy cotton cardigan or light casual wear will feel perfectly comfortable.";
        activityEl.textContent = "Perfect for bike rides, outdoor dining, and park excursions.";
        advisoryEl.textContent = "Exceptional atmospheric conditions. Ideal for local travel.";
        indexEl.textContent = "Goldilocks Zone";
    }
}

function updateWeatherIcon(state) {
    const container = document.getElementById('heroIconContainer');
    const desc = document.getElementById('weatherDesc');

    if (state === 'snowy') {
        container.innerHTML = `<i data-lucide="snowflake" class="w-10 h-10 text-cyan-200"></i>`;
        desc.innerHTML = `<i data-lucide="snowflake" class="w-5 h-5 text-cyan-300"></i> <span>Crisp Cold Climate</span>`;
    } else if (state === 'rainy') {
        container.innerHTML = `<i data-lucide="cloud-drizzle" class="w-10 h-10 text-indigo-300"></i>`;
        desc.innerHTML = `<i data-lucide="cloud-rain" class="w-5 h-5 text-indigo-400"></i> <span>Refreshing Showers</span>`;
    } else if (state === 'cloudy') {
        container.innerHTML = `<i data-lucide="cloud" class="w-10 h-10 text-slate-300"></i>`;
        desc.innerHTML = `<i data-lucide="cloudy" class="w-5 h-5 text-slate-400"></i> <span>Overcast Skies</span>`;
    } else if (state === 'sunny-hot') {
        container.innerHTML = `<i data-lucide="sun" class="w-10 h-10 text-amber-400 animate-spin-slow"></i>`;
        desc.innerHTML = `<i data-lucide="sun" class="w-5 h-5 text-amber-500"></i> <span>Sun-Drenched Heat</span>`;
    } else {
        container.innerHTML = `<i data-lucide="cloud-sun" class="w-10 h-10 text-amber-300"></i>`;
        desc.innerHTML = `<i data-lucide="sun-medium" class="w-5 h-5 text-yellow-400"></i> <span>Pristine Warm Weather</span>`;
    }
    lucide.createIcons();
}

function toggleUnits(unit) {
    if (currentUnit === unit) return;
    currentUnit = unit;

    const unitCBtn = document.getElementById('unitCBtn');
    const unitFBtn = document.getElementById('unitFBtn');

    if (unit === 'C') {
        unitCBtn.className = "px-3 py-1.5 text-xs font-bold rounded-lg bg-white/20 text-white shadow transition-all duration-300";
        unitFBtn.className = "px-3 py-1.5 text-xs font-bold rounded-lg text-slate-400 hover:text-white transition-all duration-300";
    } else {
        unitFBtn.className = "px-3 py-1.5 text-xs font-bold rounded-lg bg-white/20 text-white shadow transition-all duration-300";
        unitCBtn.className = "px-3 py-1.5 text-xs font-bold rounded-lg text-slate-400 hover:text-white transition-all duration-300";
    }

    if (lastWeatherData) {
        renderWeather(lastCitySearched, lastWeatherData);
    }
}

function convertTemp(celsiusValue) {
    return currentUnit === 'C' ? celsiusValue : (celsiusValue * 9/5) + 32;
}

function handleSearch(event) {
    event.preventDefault();
    const input = document.getElementById('citySearchInput');
    const rawCity = input.value.trim();
    if (rawCity !== "") {
        fetchWeather(rawCity);
        input.value = "";
    }
}

function loadRecentSearches() {
    const recents = getRecentCities();
    const container = document.getElementById('recentSearchesList');
    container.innerHTML = "";

    if (recents.length === 0) {
        container.innerHTML = `<span class="text-xs text-slate-500 italic">No recent explorations yet</span>`;
        return;
    }

    recents.forEach(city => {
        const btn = document.createElement('button');
        btn.className = "px-3 py-1.5 text-xs bg-white/5 border border-white/10 text-slate-300 rounded-xl hover:bg-white/10 hover:text-white transition-all flex items-center gap-1.5 active:scale-95";
        btn.onclick = () => fetchWeather(city);
        btn.innerHTML = `<i data-lucide="search" class="w-3 h-3 text-slate-500"></i><span>${city}</span>`;
        container.appendChild(btn);
    });
    lucide.createIcons();
}

function getRecentCities() {
    try {
        const stored = localStorage.getItem('auraRecentCities');
        return stored ? JSON.parse(stored) : ["Vadodara", "Ahmedabad", "Surat"];
    } catch (e) {
        return ["Vadodara", "Ahmedabad", "Surat"];
    }
}

function saveRecentSearch(city) {
    try {
        let recents = getRecentCities();
        recents = recents.filter(item => item.toLowerCase() !== city.toLowerCase());
        recents.unshift(city);
        if (recents.length > 5) recents.pop();
        localStorage.setItem('auraRecentCities', JSON.stringify(recents));
        loadRecentSearches();
    } catch (e) {
        console.error("Local storage access restricted.", e);
    }
}

function initCanvas() {
    canvas = document.getElementById('weatherCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
}

function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function setupParticles(type) {
    particleSystem = [];
    const count = type === 'snow' ? 80 : (type === 'rain' ? 120 : (type === 'clouds' ? 20 : 15));

    for (let i = 0; i < count; i++) {
        particleSystem.push(createParticle(type, true));
    }
}

function createParticle(type, randomizeY = false) {
    const w = canvas.width;
    const h = canvas.height;
    const yStart = randomizeY ? Math.random() * h : -20;

    if (type === 'snow') {
        return {
            type: 'snow',
            x: Math.random() * w,
            y: yStart,
            r: Math.random() * 3.5 + 1.2,
            d: Math.random() * 1.5 + 0.5,
            swing: Math.random() * 2,
            swingSpeed: Math.random() * 0.02 + 0.005
        };
    } else if (type === 'rain') {
        return {
            type: 'rain',
            x: Math.random() * w,
            y: yStart,
            len: Math.random() * 25 + 12,
            d: Math.random() * 12 + 8,
            weight: Math.random() * 1.5 + 0.5
        };
    } else if (type === 'clouds') {
        return {
            type: 'clouds',
            x: Math.random() * (w + 400) - 200,
            y: Math.random() * (h * 0.5),
            r: Math.random() * 100 + 60,
            d: Math.random() * 0.3 + 0.05,
            opacity: Math.random() * 0.12 + 0.03
        };
    } else {
        return {
            type: 'ember',
            x: Math.random() * w,
            y: randomizeY ? Math.random() * h : h + 20,
            r: Math.random() * 4 + 1,
            d: -(Math.random() * 0.6 + 0.2),
            opacity: Math.random() * 0.3 + 0.1,
            wobble: Math.random() * 1.5
        };
    }
}

function animateCanvas() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particleSystem.forEach((p, index) => {
        if (p.type === 'snow') {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fill();
            p.y += p.d;
            p.x += Math.sin(p.y * p.swingSpeed) * p.swing * 0.5;
            if (p.y > canvas.height) {
                particleSystem[index] = createParticle('snow', false);
            }
        } else if (p.type === 'rain') {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(174, 196, 255, 0.3)';
            ctx.lineWidth = p.weight;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + (p.d * 0.05), p.y + p.len);
            ctx.stroke();
            p.y += p.d;
            p.x += p.d * 0.05;
            if (p.y > canvas.height) {
                particleSystem[index] = createParticle('rain', false);
            }
        } else if (p.type === 'clouds') {
            ctx.beginPath();
            const gradient = ctx.createRadialGradient(p.x, p.y, p.r * 0.1, p.x, p.y, p.r);
            gradient.addColorStop(0, `rgba(255, 255, 255, ${p.opacity})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
            p.x += p.d;
            if (p.x - p.r > canvas.width) {
                p.x = -p.r;
            }
        } else if (p.type === 'ember') {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(253, 224, 71, ${p.opacity})`;
            ctx.fill();
            p.y += p.d;
            p.x += Math.sin(p.y * 0.01) * p.wobble * 0.2;
            if (p.y < -20) {
                particleSystem[index] = createParticle('sunny', false);
            }
        }
    });

    animationFrameId = requestAnimationFrame(animateCanvas);
}

function toggleVisualizerDetails() {
    showToast("Atmospheric effects updated successfully.", "success");
}
