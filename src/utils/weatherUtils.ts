import { WeatherConditionType } from '../types/weather';

export interface WeatherTheme {
  gradient: string;
  isDark: boolean;
  textColor: string;
  cardClass: string;
}

/**
 * Get weather condition type from OpenWeatherMap weather data
 */
export function getWeatherConditionType(weatherMain: string): WeatherConditionType {
  switch (weatherMain.toLowerCase()) {
    case 'clear':
      return 'clear';
    case 'clouds':
      return 'clouds';
    case 'rain':
      return 'rain';
    case 'drizzle':
      return 'drizzle';
    case 'thunderstorm':
      return 'thunderstorm';
    case 'snow':
      return 'snow';
    case 'mist':
      return 'mist';
    case 'smoke':
      return 'smoke';
    case 'haze':
      return 'haze';
    case 'dust':
      return 'dust';
    case 'fog':
      return 'fog';
    case 'sand':
      return 'sand';
    case 'ash':
      return 'ash';
    case 'squall':
      return 'squall';
    case 'tornado':
      return 'tornado';
    default:
      return 'clear';
  }
}

/**
 * Get weather theme based on condition and time of day
 */
export function getWeatherTheme(
  condition: WeatherConditionType,
  isNight: boolean = false
): WeatherTheme {
  if (isNight) {
    return {
      gradient: 'bg-night',
      isDark: true,
      textColor: 'text-white',
      cardClass: 'weather-card-dark',
    };
  }

  switch (condition) {
    case 'clear':
      return {
        gradient: 'bg-sunny',
        isDark: false,
        textColor: 'text-white',
        cardClass: 'weather-card',
      };
    case 'clouds':
      return {
        gradient: 'bg-cloudy',
        isDark: false,
        textColor: 'text-white',
        cardClass: 'weather-card',
      };
    case 'rain':
    case 'drizzle':
      return {
        gradient: 'bg-rainy',
        isDark: false,
        textColor: 'text-white',
        cardClass: 'weather-card',
      };
    case 'snow':
      return {
        gradient: 'bg-snowy',
        isDark: false,
        textColor: 'text-gray-800',
        cardClass: 'weather-card',
      };
    case 'thunderstorm':
      return {
        gradient: 'bg-storm',
        isDark: true,
        textColor: 'text-white',
        cardClass: 'weather-card-dark',
      };
    default:
      return {
        gradient: 'bg-sunny',
        isDark: false,
        textColor: 'text-white',
        cardClass: 'weather-card',
      };
  }
}

/**
 * Get Lottie animation name for weather condition
 */
export function getWeatherAnimation(condition: WeatherConditionType): string {
  switch (condition) {
    case 'clear':
      return 'sunny';
    case 'clouds':
      return 'cloudy';
    case 'rain':
      return 'rain';
    case 'drizzle':
      return 'drizzle';
    case 'thunderstorm':
      return 'thunder';
    case 'snow':
      return 'snow';
    case 'mist':
    case 'fog':
      return 'fog';
    default:
      return 'sunny';
  }
}

/**
 * Format temperature with unit
 */
export function formatTemperature(temp: number, unit: 'celsius' | 'fahrenheit' = 'celsius'): string {
  const rounded = Math.round(temp);
  return unit === 'celsius' ? `${rounded}°C` : `${Math.round((temp * 9/5) + 32)}°F`;
}

/**
 * Format wind speed with unit
 */
export function formatWindSpeed(speed: number, unit: 'kmh' | 'mph' = 'kmh'): string {
  const converted = unit === 'kmh' ? Math.round(speed * 3.6) : Math.round(speed * 2.237);
  return `${converted} ${unit}`;
}

/**
 * Format time from timestamp
 */
export function formatTime(timestamp: number, timezone: number = 0, format: '12h' | '24h' = '24h'): string {
  const date = new Date((timestamp + timezone) * 1000);
  
  if (format === '12h') {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC',
    });
  }
  
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  });
}

/**
 * Format date from timestamp
 */
export function formatDate(timestamp: number, timezone: number = 0): string {
  const date = new Date((timestamp + timezone) * 1000);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Get day of week from timestamp
 */
export function getDayOfWeek(timestamp: number, timezone: number = 0): string {
  const date = new Date((timestamp + timezone) * 1000);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    timeZone: 'UTC',
  });
}

/**
 * Check if it's currently night time
 */
export function isNightTime(currentTime: number, sunrise: number, sunset: number): boolean {
  return currentTime < sunrise || currentTime > sunset;
}

/**
 * Get weather description with proper capitalization
 */
export function formatWeatherDescription(description: string): string {
  return description
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Get pressure trend description
 */
export function getPressureTrend(pressure: number): { level: string; description: string } {
  if (pressure < 1000) {
    return { level: 'Low', description: 'Stormy weather likely' };
  } else if (pressure > 1020) {
    return { level: 'High', description: 'Clear weather expected' };
  } else {
    return { level: 'Normal', description: 'Stable conditions' };
  }
}

/**
 * Get humidity level description
 */
export function getHumidityLevel(humidity: number): string {
  if (humidity < 30) {
    return 'Dry';
  } else if (humidity < 60) {
    return 'Comfortable';
  } else if (humidity < 80) {
    return 'Humid';
  } else {
    return 'Very Humid';
  }
}

/**
 * Get visibility description
 */
export function getVisibilityDescription(visibility: number): string {
  // Visibility is in meters
  const km = visibility / 1000;
  
  if (km >= 10) {
    return 'Excellent';
  } else if (km >= 4) {
    return 'Good';
  } else if (km >= 2) {
    return 'Moderate';
  } else if (km >= 1) {
    return 'Poor';
  } else {
    return 'Very Poor';
  }
}

/**
 * Calculate feels like temperature description
 */
export function getFeelsLikeDescription(actual: number, feelsLike: number): string {
  const diff = Math.abs(feelsLike - actual);
  
  if (diff < 2) {
    return 'Similar to actual';
  } else if (feelsLike > actual) {
    return `Feels ${Math.round(diff)}° warmer`;
  } else {
    return `Feels ${Math.round(diff)}° cooler`;
  }
}

/**
 * Get clothing recommendation based on temperature and weather
 */
export function getClothingRecommendation(temp: number, condition: WeatherConditionType): string {
  if (temp < 0) {
    return 'Heavy winter coat, gloves, and warm layers';
  } else if (temp < 10) {
    return 'Warm jacket and layers';
  } else if (temp < 20) {
    return 'Light jacket or sweater';
  } else if (temp < 30) {
    return 'T-shirt or light clothing';
  } else {
    return 'Light, breathable clothing';
  }
}
