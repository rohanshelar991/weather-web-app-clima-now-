export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface MainWeatherData {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
  sea_level?: number;
  grnd_level?: number;
}

export interface WindData {
  speed: number;
  deg: number;
  gust?: number;
}

export interface CloudData {
  all: number;
}

export interface SysData {
  type?: number;
  id?: number;
  country: string;
  sunrise: number;
  sunset: number;
}

export interface CurrentWeather {
  coord: {
    lon: number;
    lat: number;
  };
  weather: WeatherCondition[];
  base: string;
  main: MainWeatherData;
  visibility: number;
  wind: WindData;
  clouds: CloudData;
  dt: number;
  sys: SysData;
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface ForecastItem {
  dt: number;
  main: MainWeatherData;
  weather: WeatherCondition[];
  clouds: CloudData;
  wind: WindData;
  visibility: number;
  pop: number; // Probability of precipitation
  sys: {
    pod: string; // Part of day (n-night, d-day)
  };
  dt_txt: string;
}

export interface ForecastResponse {
  cod: string;
  message: number;
  cnt: number;
  list: ForecastItem[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

export interface GeocodingResult {
  name: string;
  local_names?: { [key: string]: string };
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export interface AirQualityResponse {
  coord: {
    lon: number;
    lat: number;
  };
  list: Array<{
    main: {
      aqi: number; // Air Quality Index (1-5)
    };
    components: {
      co: number;
      no: number;
      no2: number;
      o3: number;
      so2: number;
      pm2_5: number;
      pm10: number;
      nh3: number;
    };
    dt: number;
  }>;
}

export interface UVIndexResponse {
  lat: number;
  lon: number;
  date_iso: string;
  date: number;
  value: number;
}

export interface SavedCity {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
  addedAt: string;
}

export interface WeatherBackground {
  gradient: string;
  theme: 'light' | 'dark';
}

export type WeatherConditionType = 
  | 'clear'
  | 'clouds'
  | 'rain'
  | 'drizzle' 
  | 'thunderstorm'
  | 'snow'
  | 'mist'
  | 'smoke'
  | 'haze'
  | 'dust'
  | 'fog'
  | 'sand'
  | 'ash'
  | 'squall'
  | 'tornado';

// Base location interface
export interface LocationCoords {
  latitude: number;
  longitude: number;
}

// Enhanced forecast interfaces for daily forecasts
export interface DailyForecastItem {
  dt: number;
  sunrise: number;
  sunset: number;
  moonrise: number;
  moonset: number;
  moon_phase: number;
  temp: {
    day: number;
    min: number;
    max: number;
    night: number;
    eve: number;
    morn: number;
  };
  feels_like: {
    day: number;
    night: number;
    eve: number;
    morn: number;
  };
  pressure: number;
  humidity: number;
  dew_point: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust?: number;
  weather: WeatherCondition[];
  clouds: number;
  pop: number;
  rain?: number;
  snow?: number;
  uvi: number;
}

export interface DailyForecast {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  daily: DailyForecastItem[];
}

// Enhanced air quality interface
export interface AirQualityComponents {
  co: number;      // Carbon monoxide (μg/m³)
  no: number;      // Nitrogen monoxide (μg/m³)
  no2: number;     // Nitrogen dioxide (μg/m³)
  o3: number;      // Ozone (μg/m³)
  so2: number;     // Sulphur dioxide (μg/m³)
  pm2_5: number;   // Fine particles matter (μg/m³)
  pm10: number;    // Coarse particulate matter (μg/m³)
  nh3: number;     // Ammonia (μg/m³)
}

export interface AirQualityData {
  coord: LocationCoords;
  list: {
    dt: number;
    main: {
      aqi: number; // Air Quality Index (1-5)
    };
    components: AirQualityComponents;
  }[];
}

// Pollen data interface
export interface PollenData {
  grass_pollen?: number;
  tree_pollen?: number;
  weed_pollen?: number;
  overall_pollen_index?: number;
}

// Astronomical data
export interface AstronomicalData {
  sunrise: number;
  sunset: number;
  moonrise: number;
  moonset: number;
  moon_phase: number;
  moon_illumination: number;
}

// Weather alerts
export interface WeatherAlert {
  sender_name: string;
  event: string;
  start: number;
  end: number;
  description: string;
  tags: string[];
}

// Complete weather data combining all sources
export interface CompleteWeatherData {
  current: CurrentWeather;
  hourlyForecast: ForecastResponse;
  dailyForecast: DailyForecast;
  airQuality?: AirQualityData;
  uvIndex?: UVIndexResponse;
  pollen?: PollenData;
  alerts?: WeatherAlert[];
  astronomical?: AstronomicalData;
  lastUpdated: number;
}

// Weather map layer types
export type WeatherMapLayer = 
  | 'temperature'
  | 'precipitation'
  | 'pressure'
  | 'wind'
  | 'clouds'
  | 'humidity';

export interface WeatherMapData {
  layer: WeatherMapLayer;
  data: any[];
  timestamp: number;
}

// User preferences and settings
export interface UserPreferences {
  temperatureUnit: 'celsius' | 'fahrenheit';
  windSpeedUnit: 'kmh' | 'mph' | 'ms';
  pressureUnit: 'hPa' | 'inHg' | 'mmHg';
  timeFormat: '12h' | '24h';
  theme: 'light' | 'dark' | 'auto';
  backgroundAnimations: boolean;
  notifications: {
    enabled: boolean;
    dailyWeather: boolean;
    severeAlerts: boolean;
    rainAlerts: boolean;
    uvAlerts: boolean;
    airQualityAlerts: boolean;
  };
  voiceSearch: boolean;
  autoLocation: boolean;
}

// Widget configuration
export interface WeatherWidget {
  id: string;
  type: 'current' | 'forecast' | 'airQuality' | 'uvIndex' | 'astronomy';
  size: 'small' | 'medium' | 'large';
  cityId?: string;
  position: {
    x: number;
    y: number;
  };
  settings: Record<string, any>;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  lastUpdated?: number;
}

// Cache entry type
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// Enhanced weather condition types for theming
export type DetailedWeatherConditionType = 
  | 'clear-day'
  | 'clear-night' 
  | 'cloudy'
  | 'partly-cloudy-day'
  | 'partly-cloudy-night'
  | 'rain'
  | 'rain-heavy'
  | 'snow'
  | 'snow-heavy'
  | 'thunderstorm'
  | 'fog'
  | 'wind'
  | 'extreme';

// Theme configuration
export interface WeatherTheme {
  gradient: string;
  isDark: boolean;
  textColor: string;
  cardClass: string;
  primaryColor: string;
  secondaryColor: string;
  animationType?: string;
}

// Search history
export interface SearchHistoryItem {
  id: string;
  query: string;
  result: GeocodingResult;
  searchedAt: number;
}

// Notification types
export interface WeatherNotification {
  id: string;
  type: 'alert' | 'daily' | 'rain' | 'uv' | 'air-quality';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'extreme';
  timestamp: number;
  location: string;
  data?: any;
  isRead: boolean;
}
