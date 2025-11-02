import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  CurrentWeather,
  ForecastResponse,
  DailyForecast,
  GeocodingResult,
  AirQualityResponse,
  AirQualityData,
  UVIndexResponse,
  WeatherAlert,
  CompleteWeatherData,
  ApiResponse,
  CacheEntry,
  PollenData,
  AstronomicalData
} from '../types/weather';
import { DemoWeatherService } from './demoWeatherService';

const BASE_URL = 'https://api.openweathermap.org';
const ONE_CALL_URL = 'https://api.openweathermap.org/data/3.0/onecall';
const GEOCODING_URL = 'https://api.openweathermap.org/geo/1.0';
const AIR_POLLUTION_URL = 'https://api.openweathermap.org/data/2.5/air_pollution';
const UV_INDEX_URL = 'https://api.openweathermap.org/data/2.5/uvi';
const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY || 'YOUR_API_KEY_HERE';

// Check if we have a valid API key
const HAS_VALID_API_KEY = API_KEY && API_KEY !== 'YOUR_API_KEY_HERE' && API_KEY !== 'demo_api_key_here';

// Cache for API responses
const cache = new Map<string, CacheEntry<any>>();
const CACHE_DURATION = {
  current: 10 * 60 * 1000, // 10 minutes
  forecast: 30 * 60 * 1000, // 30 minutes
  daily: 60 * 60 * 1000, // 1 hour
  airQuality: 30 * 60 * 1000, // 30 minutes
  uv: 60 * 60 * 1000, // 1 hour
  geocoding: 24 * 60 * 60 * 1000, // 24 hours
};

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (config.params) {
      config.params.appid = API_KEY;
    } else {
      config.params = { appid: API_KEY };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Invalid API key or unauthorized access');
    } else if (error.response?.status === 429) {
      console.error('API rate limit exceeded');
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    }
    return Promise.reject(error);
  }
);

// Cache management functions
function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCacheData<T>(key: string, data: T, duration: number): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + duration
  });
}

export class WeatherApiService {
  
  /**
   * Get current weather data by coordinates
   */
  static async getCurrentWeatherByCoords(lat: number, lon: number): Promise<CurrentWeather> {
    // If no valid API key, use demo service
    if (!HAS_VALID_API_KEY) {
      return DemoWeatherService.getCurrentWeatherByCoords(lat, lon);
    }
    
    try {
      const cacheKey = `current_${lat}_${lon}`;
      const cached = getCachedData<CurrentWeather>(cacheKey);
      
      if (cached) {
        return cached;
      }

      const response = await api.get('/data/2.5/weather', {
        params: {
          lat,
          lon,
          units: 'metric', // Use metric units (Celsius)
        },
      });

      const data = response.data as CurrentWeather;
      setCacheData(cacheKey, data, CACHE_DURATION.current);

      return data;
    } catch (error) {
      console.error('Error fetching current weather by coordinates:', error);
      throw new Error('Failed to fetch current weather data');
    }
  }

  /**
   * Get current weather data by city name
   */
  static async getCurrentWeatherByCity(cityName: string): Promise<CurrentWeather> {
    // If no valid API key, use demo service
    if (!HAS_VALID_API_KEY) {
      return DemoWeatherService.getCurrentWeatherByCity(cityName);
    }
    
    try {
      const response = await api.get('/data/2.5/weather', {
        params: {
          q: cityName,
          appid: API_KEY,
          units: 'metric',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching current weather by city:', error);
      throw new Error('Failed to fetch weather data for the specified city');
    }
  }

  /**
   * Get 5-day weather forecast by coordinates
   */
  static async getForecastByCoords(lat: number, lon: number): Promise<ForecastResponse> {
    // If no valid API key, use demo service
    if (!HAS_VALID_API_KEY) {
      // Create a mock forecast response
      const currentWeather = await this.getCurrentWeatherByCoords(lat, lon);
      return {
        cod: '200',
        message: 0,
        cnt: 5,
        list: Array(5).fill(null).map((_, index) => ({
          dt: currentWeather.dt + (index * 86400), // 1 day intervals
          main: {
            temp: currentWeather.main.temp + (Math.random() * 10 - 5),
            feels_like: currentWeather.main.feels_like + (Math.random() * 10 - 5),
            temp_min: currentWeather.main.temp_min + (Math.random() * 5 - 2.5),
            temp_max: currentWeather.main.temp_max + (Math.random() * 5 - 2.5),
            pressure: currentWeather.main.pressure,
            sea_level: currentWeather.main.sea_level,
            grnd_level: currentWeather.main.grnd_level,
            humidity: currentWeather.main.humidity,
            temp_kf: 0
          },
          weather: currentWeather.weather,
          clouds: {
            all: Math.round(Math.random() * 100)
          },
          wind: {
            speed: currentWeather.wind.speed + (Math.random() * 5 - 2.5),
            deg: currentWeather.wind.deg,
            gust: currentWeather.wind.gust
          },
          visibility: currentWeather.visibility,
          pop: Math.random(),
          sys: {
            pod: index % 2 === 0 ? 'd' : 'n'
          },
          dt_txt: new Date((currentWeather.dt + (index * 86400)) * 1000).toISOString()
        })),
        city: {
          id: currentWeather.id,
          name: currentWeather.name,
          coord: currentWeather.coord,
          country: currentWeather.sys.country,
          population: 1000000,
          timezone: currentWeather.timezone,
          sunrise: currentWeather.sys.sunrise,
          sunset: currentWeather.sys.sunset
        }
      };
    }
    
    try {
      const response = await api.get('/data/2.5/forecast', {
        params: {
          lat,
          lon,
          appid: API_KEY,
          units: 'metric',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching forecast by coordinates:', error);
      throw new Error('Failed to fetch weather forecast');
    }
  }

  /**
   * Get 5-day weather forecast by city name
   */
  static async getForecastByCity(cityName: string): Promise<ForecastResponse> {
    // If no valid API key, use demo service
    if (!HAS_VALID_API_KEY) {
      // Create a mock forecast response
      const currentWeather = await this.getCurrentWeatherByCity(cityName);
      return {
        cod: '200',
        message: 0,
        cnt: 5,
        list: Array(5).fill(null).map((_, index) => ({
          dt: currentWeather.dt + (index * 86400), // 1 day intervals
          main: {
            temp: currentWeather.main.temp + (Math.random() * 10 - 5),
            feels_like: currentWeather.main.feels_like + (Math.random() * 10 - 5),
            temp_min: currentWeather.main.temp_min + (Math.random() * 5 - 2.5),
            temp_max: currentWeather.main.temp_max + (Math.random() * 5 - 2.5),
            pressure: currentWeather.main.pressure,
            sea_level: currentWeather.main.sea_level,
            grnd_level: currentWeather.main.grnd_level,
            humidity: currentWeather.main.humidity,
            temp_kf: 0
          },
          weather: currentWeather.weather,
          clouds: {
            all: Math.round(Math.random() * 100)
          },
          wind: {
            speed: currentWeather.wind.speed + (Math.random() * 5 - 2.5),
            deg: currentWeather.wind.deg,
            gust: currentWeather.wind.gust
          },
          visibility: currentWeather.visibility,
          pop: Math.random(),
          sys: {
            pod: index % 2 === 0 ? 'd' : 'n'
          },
          dt_txt: new Date((currentWeather.dt + (index * 86400)) * 1000).toISOString()
        })),
        city: {
          id: currentWeather.id,
          name: currentWeather.name,
          coord: currentWeather.coord,
          country: currentWeather.sys.country,
          population: 1000000,
          timezone: currentWeather.timezone,
          sunrise: currentWeather.sys.sunrise,
          sunset: currentWeather.sys.sunset
        }
      };
    }
    
    try {
      const response = await api.get('/data/2.5/forecast', {
        params: {
          q: cityName,
          appid: API_KEY,
          units: 'metric',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching forecast by city:', error);
      throw new Error('Failed to fetch weather forecast');
    }
  }

  /**
   * Search for cities using geocoding API with comprehensive global coverage
   */
  static async searchCities(query: string, limit: number = 30): Promise<ApiResponse<GeocodingResult[]>> {
    // If no valid API key, use demo service
    if (!HAS_VALID_API_KEY) {
      const cities = await DemoWeatherService.searchCities(query);
      return { success: true, data: cities.slice(0, limit) };
    }
    
    try {
      const cacheKey = `geocoding_${query}_${limit}`;
      const cached = getCachedData<GeocodingResult[]>(cacheKey);
      
      if (cached) {
        return { success: true, data: cached };
      }

      // Try multiple search approaches for comprehensive coverage
      const searchApproaches = [
        { q: query, limit: Math.min(limit, 50) }, // Direct search with higher limit
        { q: `${query}*`, limit: Math.min(limit, 30) }, // Wildcard search
        { q: query, type: 'like', limit: Math.min(limit, 30) }, // Fuzzy search
      ];

      let data: GeocodingResult[] = [];
      let success = false;

      // Try each search approach
      for (const params of searchApproaches) {
        try {
          const response = await api.get(`${GEOCODING_URL}/direct`, { params });
          if (response.data && response.data.length > 0) {
            data = [...data, ...response.data];
            success = true;
          }
        } catch (error) {
          // Continue to next approach if this one fails
          console.warn('Search approach failed:', params, error);
        }
      }

      if (success) {
        // Remove duplicates based on name, country, lat, and lon
        const uniqueCities = data.filter((city, index, self) =>
          index === self.findIndex(c => 
            c.name === city.name && 
            c.country === city.country && 
            Math.abs(c.lat - city.lat) < 0.01 && 
            Math.abs(c.lon - city.lon) < 0.01
          )
        );
        
        // Sort by relevance (exact matches first)
        const sortedCities = uniqueCities.sort((a, b) => {
          const aExact = a.name.toLowerCase() === query.toLowerCase() ? 0 : 1;
          const bExact = b.name.toLowerCase() === query.toLowerCase() ? 0 : 1;
          
          return aExact - bExact;
        });
        
        setCacheData(cacheKey, sortedCities, CACHE_DURATION.geocoding);
        return { success: true, data: sortedCities.slice(0, limit) };
      } else {
        return { success: true, data: [] };
      }
    } catch (error) {
      console.error('Error searching cities:', error);
      return { success: false, error: 'Failed to search cities' };
    }
  }

  /**
   * Search for all cities in a country with comprehensive coverage
   */
  static async searchAllCitiesInCountry(countryCode: string, limit: number = 100): Promise<ApiResponse<GeocodingResult[]>> {
    // If no valid API key, return empty result
    if (!HAS_VALID_API_KEY) {
      return { success: true, data: [] };
    }
    
    try {
      const cacheKey = `all_cities_${countryCode}_${limit}`;
      const cached = getCachedData<GeocodingResult[]>(cacheKey);
      
      if (cached) {
        return { success: true, data: cached };
      }

      // Search for cities in the country with a high limit
      const response = await api.get(`${GEOCODING_URL}/direct`, {
        params: {
          q: `country:${countryCode}`,
          limit: Math.min(limit, 500), // OpenWeatherMap has limits
        },
      });

      const data = response.data as GeocodingResult[];
      
      // Sort alphabetically to show cities in order
      const sortedData = data.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
      
      setCacheData(cacheKey, sortedData, CACHE_DURATION.geocoding);
      return { success: true, data: sortedData.slice(0, limit) };
    } catch (error) {
      console.error('Error searching all cities in country:', error);
      return { success: false, error: 'Failed to search all cities in country' };
    }
  }

  /**
   * Search for cities in a state/province/region
   */
  static async searchCitiesInState(countryCode: string, stateName: string, limit: number = 50): Promise<ApiResponse<GeocodingResult[]>> {
    // If no valid API key, return empty result
    if (!HAS_VALID_API_KEY) {
      return { success: true, data: [] };
    }
    
    try {
      const cacheKey = `cities_${countryCode}_${stateName}_${limit}`;
      const cached = getCachedData<GeocodingResult[]>(cacheKey);
      
      if (cached) {
        return { success: true, data: cached };
      }

      // Search for cities in the state
      const response = await api.get(`${GEOCODING_URL}/direct`, {
        params: {
          q: `${stateName},${countryCode}`,
          limit: Math.min(limit, 100),
        },
      });

      const data = response.data as GeocodingResult[];
      
      // Sort alphabetically
      const sortedData = data.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
      
      setCacheData(cacheKey, sortedData, CACHE_DURATION.geocoding);
      return { success: true, data: sortedData.slice(0, limit) };
    } catch (error) {
      console.error('Error searching cities in state:', error);
      return { success: false, error: 'Failed to search cities in state' };
    }
  }

  /**
   * Get comprehensive global city data
   */
  static async getGlobalCitiesData(): Promise<ApiResponse<GeocodingResult[]>> {
    if (HAS_VALID_API_KEY) {
      // In a real implementation with a valid API key, this would fetch comprehensive global data
      // For now, we'll return the demo cities for consistency
      const cities = await DemoWeatherService.getAllCities();
      return { success: true, data: cities };
    }
    const cities = await DemoWeatherService.getAllCities();
    return { success: true, data: cities };
  }

  /**
   * Get all major cities worldwide (for demo purposes when no API key)
   */
  static async getAllMajorCities(): Promise<GeocodingResult[]> {
    if (HAS_VALID_API_KEY) {
      // If we have a valid API key, we could fetch from the API
      // But for now, we'll still return the demo cities for consistency
      // In a real implementation, this would fetch all major cities from the API
      return await DemoWeatherService.getAllCities();
    }
    return await DemoWeatherService.getAllCities();
  }

  /**
   * Get location data by coordinates (reverse geocoding)
   */
  static async getLocationByCoords(lat: number, lon: number): Promise<GeocodingResult[]> {
    // If no valid API key, use demo service
    if (!HAS_VALID_API_KEY) {
      // Find the closest demo city
      const cities = await DemoWeatherService.searchCities('');
      const closestCity = cities.reduce((closest, city) => {
        const distanceToCurrent = Math.sqrt(
          Math.pow(city.lat - lat, 2) + Math.pow(city.lon - lon, 2)
        );
        const distanceToClosest = Math.sqrt(
          Math.pow(closest.lat - lat, 2) + Math.pow(closest.lon - lon, 2)
        );
        return distanceToCurrent < distanceToClosest ? city : closest;
      });
      return [closestCity];
    }
    
    try {
      const response = await api.get('/geo/1.0/reverse', {
        params: {
          lat,
          lon,
          limit: 1,
          appid: API_KEY,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting location by coordinates:', error);
      throw new Error('Failed to get location data');
    }
  }

  /**
   * Get air quality data by coordinates
   */
  static async getAirQuality(lat: number, lon: number): Promise<AirQualityResponse> {
    // If no valid API key, create mock air quality data
    if (!HAS_VALID_API_KEY) {
      return {
        coord: {
          lon,
          lat
        },
        list: [
          {
            main: {
              aqi: Math.floor(Math.random() * 5) + 1
            },
            components: {
              co: Math.random() * 500,
              no: Math.random() * 50,
              no2: Math.random() * 50,
              o3: Math.random() * 200,
              so2: Math.random() * 20,
              pm2_5: Math.random() * 50,
              pm10: Math.random() * 100,
              nh3: Math.random() * 5
            },
            dt: Math.floor(Date.now() / 1000)
          }
        ]
      };
    }
    
    try {
      const response = await api.get('/data/2.5/air_pollution', {
        params: {
          lat,
          lon,
          appid: API_KEY,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching air quality data:', error);
      throw new Error('Failed to fetch air quality data');
    }
  }

  /**
   * Get UV Index data by coordinates
   */
  static async getUVIndex(lat: number, lon: number): Promise<number> {
    // If no valid API key, return mock UV index
    if (!HAS_VALID_API_KEY) {
      return Math.random() * 10; // Random UV index between 0-10
    }
    
    try {
      // Note: UV Index is part of One Call API, using current weather as fallback
      const response = await api.get('/data/2.5/uvi', {
        params: {
          lat,
          lon,
          appid: API_KEY,
        },
      });
      return response.data.value || 0;
    } catch (error) {
      console.error('Error fetching UV index:', error);
      // Return 0 as fallback if UV index is not available
      return 0;
    }
  }

  /**
   * Get weather icon URL
   */
  static getIconUrl(iconCode: string, size: '2x' | '4x' = '2x'): string {
    return `https://openweathermap.org/img/wn/${iconCode}@${size}.png`;
  }

  /**
   * Convert temperature from Kelvin to Celsius
   */
  static kelvinToCelsius(kelvin: number): number {
    return Math.round(kelvin - 273.15);
  }

  /**
   * Convert temperature from Celsius to Fahrenheit
   */
  static celsiusToFahrenheit(celsius: number): number {
    return Math.round((celsius * 9/5) + 32);
  }

  /**
   * Convert wind speed from m/s to km/h
   */
  static msToKmh(ms: number): number {
    return Math.round(ms * 3.6);
  }

  /**
   * Convert wind speed from m/s to mph
   */
  static msToMph(ms: number): number {
    return Math.round(ms * 2.237);
  }

  /**
   * Get wind direction from degrees
   */
  static getWindDirection(degrees: number): string {
    const directions = [
      'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
    ];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }

  /**
   * Get Air Quality Index description
   */
  static getAQIDescription(aqi: number): string {
    switch (aqi) {
      case 1: return 'Good';
      case 2: return 'Fair';
      case 3: return 'Moderate';
      case 4: return 'Poor';
      case 5: return 'Very Poor';
      default: return 'Unknown';
    }
  }

  /**
   * Get UV Index description
   */
  static getUVDescription(uv: number): string {
    if (uv <= 2) return 'Low';
    if (uv <= 5) return 'Moderate';
    if (uv <= 7) return 'High';
    if (uv <= 10) return 'Very High';
    return 'Extreme';
  }

  /**
   * Get daily forecast using One Call API
   */
  static async getDailyForecast(lat: number, lon: number, days: number = 7): Promise<ApiResponse<DailyForecast>> {
    // If no valid API key, create mock daily forecast
    if (!HAS_VALID_API_KEY) {
      const currentWeather = await this.getCurrentWeatherByCoords(lat, lon);
      const dailyData = Array(days).fill(null).map((_, index) => {
        const date = new Date();
        date.setDate(date.getDate() + index);
        
        return {
          dt: Math.floor(date.getTime() / 1000),
          sunrise: currentWeather.sys.sunrise + (index * 86400),
          sunset: currentWeather.sys.sunset + (index * 86400),
          moonrise: currentWeather.sys.sunrise + (index * 86400) + 43200,
          moonset: currentWeather.sys.sunset + (index * 86400) + 43200,
          moon_phase: 0.5,
          temp: {
            day: currentWeather.main.temp + (Math.random() * 10 - 5),
            min: currentWeather.main.temp_min + (Math.random() * 5 - 2.5),
            max: currentWeather.main.temp_max + (Math.random() * 5 - 2.5),
            night: currentWeather.main.temp + (Math.random() * 8 - 4),
            eve: currentWeather.main.temp + (Math.random() * 6 - 3),
            morn: currentWeather.main.temp + (Math.random() * 6 - 3)
          },
          feels_like: {
            day: currentWeather.main.feels_like + (Math.random() * 10 - 5),
            night: currentWeather.main.feels_like + (Math.random() * 8 - 4),
            eve: currentWeather.main.feels_like + (Math.random() * 6 - 3),
            morn: currentWeather.main.feels_like + (Math.random() * 6 - 3)
          },
          pressure: currentWeather.main.pressure,
          humidity: currentWeather.main.humidity,
          dew_point: currentWeather.main.temp - 5,
          wind_speed: currentWeather.wind.speed + (Math.random() * 5 - 2.5),
          wind_deg: currentWeather.wind.deg,
          wind_gust: currentWeather.wind.gust,
          weather: currentWeather.weather,
          clouds: Math.round(Math.random() * 100),
          pop: Math.random(),
          uvi: Math.random() * 10
        };
      });
      
      return { 
        success: true, 
        data: {
          lat,
          lon,
          timezone: 'UTC',
          timezone_offset: 0,
          daily: dailyData
        } as DailyForecast
      };
    }
    
    try {
      const cacheKey = `daily_${lat}_${lon}_${days}`;
      const cached = getCachedData<DailyForecast>(cacheKey);
      
      if (cached) {
        return { success: true, data: cached };
      }

      const response = await api.get(`${ONE_CALL_URL}`, {
        params: { 
          lat, 
          lon, 
          exclude: 'current,minutely,hourly,alerts',
          units: 'metric'
        }
      });

      const data = response.data as DailyForecast;
      setCacheData(cacheKey, data, CACHE_DURATION.daily);

      return { success: true, data };
    } catch (error) {
      console.error('Error fetching daily forecast:', error);
      return { success: false, error: 'Failed to fetch daily forecast' };
    }
  }

  /**
   * Get weather alerts
   */
  static async getWeatherAlerts(lat: number, lon: number): Promise<ApiResponse<WeatherAlert[]>> {
    // If no valid API key, return empty alerts
    if (!HAS_VALID_API_KEY) {
      return { success: true, data: [] };
    }
    
    try {
      const response = await api.get(`${ONE_CALL_URL}`, {
        params: { 
          lat, 
          lon, 
          exclude: 'current,minutely,hourly,daily',
          units: 'metric'
        }
      });

      const alerts = response.data.alerts || [];
      return { success: true, data: alerts as WeatherAlert[] };
    } catch (error) {
      console.error('Error fetching weather alerts:', error);
      return { success: false, error: 'Failed to fetch weather alerts' };
    }
  }

  /**
   * Get comprehensive weather data for a location
   */
  static async getCompleteWeatherData(lat: number, lon: number): Promise<ApiResponse<CompleteWeatherData>> {
    try {
      const [
        currentWeather,
        hourlyForecast,
        dailyForecast,
        airQuality,
        alerts
      ] = await Promise.allSettled([
        this.getCurrentWeatherByCoords(lat, lon),
        this.getForecastByCoords(lat, lon),
        this.getDailyForecast(lat, lon),
        this.getAirQuality(lat, lon),
        this.getWeatherAlerts(lat, lon)
      ]);

      const completeData: CompleteWeatherData = {
        current: currentWeather.status === 'fulfilled' ? currentWeather.value : {} as CurrentWeather,
        hourlyForecast: hourlyForecast.status === 'fulfilled' ? hourlyForecast.value : {} as ForecastResponse,
        dailyForecast: dailyForecast.status === 'fulfilled' && dailyForecast.value.success ? 
          dailyForecast.value.data! : {} as DailyForecast,
        airQuality: airQuality.status === 'fulfilled' && airQuality.value ? {
          coord: {
            latitude: airQuality.value.coord.lat,
            longitude: airQuality.value.coord.lon
          },
          list: airQuality.value.list
        } as AirQualityData : undefined,
        alerts: alerts.status === 'fulfilled' && alerts.value.success ? 
          alerts.value.data : undefined,
        lastUpdated: Date.now()
      };

      return { success: true, data: completeData };
    } catch (error) {
      console.error('Error fetching complete weather data:', error);
      return { success: false, error: 'Failed to fetch complete weather data' };
    }
  }

  /**
   * Get comprehensive weather data for a location with insights
   */
  static async getCompleteWeatherDataWithInsights(
    lat: number, 
    lon: number,
    preferences: any // UserPreferences type
  ): Promise<ApiResponse<CompleteWeatherData & { insights: any }>> {
    try {
      const [
        currentWeather,
        hourlyForecast,
        dailyForecast,
        airQuality,
        alerts
      ] = await Promise.allSettled([
        this.getCurrentWeatherByCoords(lat, lon),
        this.getForecastByCoords(lat, lon),
        this.getDailyForecast(lat, lon),
        this.getAirQuality(lat, lon),
        this.getWeatherAlerts(lat, lon)
      ]);

      const completeData: CompleteWeatherData = {
        current: currentWeather.status === 'fulfilled' ? currentWeather.value : {} as CurrentWeather,
        hourlyForecast: hourlyForecast.status === 'fulfilled' ? hourlyForecast.value : {} as ForecastResponse,
        dailyForecast: dailyForecast.status === 'fulfilled' && dailyForecast.value.success ? 
          dailyForecast.value.data! : {} as DailyForecast,
        airQuality: airQuality.status === 'fulfilled' && airQuality.value ? {
          coord: {
            latitude: airQuality.value.coord.lat,
            longitude: airQuality.value.coord.lon
          },
          list: airQuality.value.list
        } as AirQualityData : undefined,
        alerts: alerts.status === 'fulfilled' && alerts.value.success ? 
          alerts.value.data : undefined,
        lastUpdated: Date.now()
      };

      // Generate insights (in a real implementation, this would use the actual service)
      const insights = {
        health: [],
        activities: [],
        clothing: [],
        travel: [],
        other: []
      };

      return { 
        success: true, 
        data: { 
          ...completeData, 
          insights 
        } as CompleteWeatherData & { insights: any }
      };
    } catch (error) {
      console.error('Error fetching complete weather data with insights:', error);
      return { success: false, error: 'Failed to fetch complete weather data with insights' };
    }
  }

  /**
   * Get reverse geocoding data
   */
  static async reverseGeocode(lat: number, lon: number): Promise<ApiResponse<GeocodingResult[]>> {
    // If no valid API key, use demo service
    if (!HAS_VALID_API_KEY) {
      const cities = await DemoWeatherService.searchCities('');
      const closestCity = cities.reduce((closest, city) => {
        const distanceToCurrent = Math.sqrt(
          Math.pow(city.lat - lat, 2) + Math.pow(city.lon - lon, 2)
        );
        const distanceToClosest = Math.sqrt(
          Math.pow(closest.lat - lat, 2) + Math.pow(closest.lon - lon, 2)
        );
        return distanceToCurrent < distanceToClosest ? city : closest;
      });
      return { success: true, data: [closestCity] };
    }
    
    try {
      const cacheKey = `reverse_${lat}_${lon}`;
      const cached = getCachedData<GeocodingResult[]>(cacheKey);
      
      if (cached) {
        return { success: true, data: cached };
      }

      const response = await api.get(`${GEOCODING_URL}/reverse`, {
        params: { lat, lon, limit: 1 }
      });

      const data = response.data as GeocodingResult[];
      setCacheData(cacheKey, data, CACHE_DURATION.geocoding);

      return { success: true, data };
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return { success: false, error: 'Failed to reverse geocode' };
    }
  }

  /**
   * Clear cache
   */
  static clearCache(): void {
    cache.clear();
  }

  /**
   * Get cache size
   */
  static getCacheSize(): number {
    return cache.size;
  }

  /**
   * Check if online
   */
  static isOnline(): boolean {
    return navigator.onLine;
  }
  
  /**
   * Enhanced search with comprehensive global coverage
   */
  static async searchWithGlobalCoverage(
    query: string,
    options: {
      type?: 'city' | 'country' | 'state';
      countryCode?: string;
      limit?: number;
    } = {}
  ): Promise<ApiResponse<GeocodingResult[]>> {
    const { type = 'city', countryCode, limit = 30 } = options;
    
    // If no valid API key, use demo service
    if (!HAS_VALID_API_KEY) {
      const cities = await DemoWeatherService.searchCities(query);
      return { success: true, data: cities.slice(0, limit) };
    }
    
    try {
      let searchQuery = query;
      
      // Add country code if provided
      if (countryCode) {
        searchQuery = `${query},${countryCode}`;
      }
      
      // Perform the search
      const response = await api.get(`${GEOCODING_URL}/direct`, {
        params: {
          q: searchQuery,
          limit: Math.min(limit, 100),
        },
      });
      
      const data = response.data as GeocodingResult[];
      
      return { success: true, data };
    } catch (error) {
      console.error('Error in enhanced global search:', error);
      return { success: false, error: 'Failed to perform global search' };
    }
  }
  
  /**
   * Get cities by bounding box for comprehensive regional coverage
   */
  static async getCitiesByBoundingBox(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
    limit: number = 50
  ): Promise<ApiResponse<GeocodingResult[]>> {
    // If no valid API key, return empty result
    if (!HAS_VALID_API_KEY) {
      return { success: true, data: [] };
    }
    
    try {
      const response = await api.get(`${GEOCODING_URL}/direct`, {
        params: {
          bbox: [lon1, lat1, lon2, lat2].join(','),
          limit: Math.min(limit, 100),
        },
      });
      
      const data = response.data as GeocodingResult[];
      
      return { success: true, data };
    } catch (error) {
      console.error('Error getting cities by bounding box:', error);
      return { success: false, error: 'Failed to get cities by bounding box' };
    }
  }
}