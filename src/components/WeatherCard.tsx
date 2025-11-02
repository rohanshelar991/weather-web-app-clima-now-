import React from 'react';
import { motion } from 'framer-motion';
import { 
  Wind, 
  Eye, 
  Droplets, 
  Gauge,
  Sunrise,
  Sunset,
  Heart,
  MapPin
} from 'lucide-react';
import { CurrentWeather } from '../types/weather';
import {
  formatTemperature,
  formatWindSpeed,
  formatTime,
  formatWeatherDescription,
  getHumidityLevel,
  getVisibilityDescription,
  getPressureTrend,
  isNightTime,
  getWeatherConditionType,
  getFeelsLikeDescription
} from '../utils/weatherUtils';
import { WeatherApiService } from '../services/weatherApi';

interface WeatherCardProps {
  weather: CurrentWeather;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
  tempUnit?: 'celsius' | 'fahrenheit';
  windUnit?: 'kmh' | 'mph';
  timeFormat?: '12h' | '24h';
  className?: string;
}

const WeatherCard: React.FC<WeatherCardProps> = ({
  weather,
  onToggleFavorite,
  isFavorite = false,
  tempUnit = 'celsius',
  windUnit = 'kmh',
  timeFormat = '24h',
  className = ''
}) => {
  const mainWeather = weather.weather[0];
  const conditionType = getWeatherConditionType(mainWeather.main);
  const nightTime = isNightTime(weather.dt, weather.sys.sunrise, weather.sys.sunset);
  const pressureTrend = getPressureTrend(weather.main.pressure);
  const humidityLevel = getHumidityLevel(weather.main.humidity);
  const visibilityDesc = getVisibilityDescription(weather.visibility);
  const feelsLikeDesc = getFeelsLikeDescription(weather.main.temp, weather.main.feels_like);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`weather-card relative overflow-hidden ${className}`}
    >
      {/* Favorite Button */}
      {onToggleFavorite && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onToggleFavorite}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors z-10"
        >
          <Heart
            className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-white'}`}
          />
        </motion.button>
      )}

      {/* Main Weather Info */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <MapPin className="w-4 h-4 mr-1 opacity-70" />
            <h2 className="text-lg font-semibold">{weather.name}, {weather.sys.country}</h2>
          </div>
          <p className="text-sm opacity-70">
            {formatWeatherDescription(mainWeather.description)}
          </p>
        </div>
        
        {/* Weather Icon */}
        <div className="flex-shrink-0 ml-4">
          <img
            src={WeatherApiService.getIconUrl(mainWeather.icon, '4x')}
            alt={mainWeather.description}
            className="w-20 h-20 drop-shadow-lg animate-float"
          />
        </div>
      </div>

      {/* Temperature */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="text-6xl font-light mb-2"
        >
          {formatTemperature(weather.main.temp, tempUnit)}
        </motion.div>
        <p className="text-sm opacity-80">
          Feels like {formatTemperature(weather.main.feels_like, tempUnit)}
        </p>
        <p className="text-xs opacity-60 mt-1">{feelsLikeDesc}</p>
      </div>

      {/* Temperature Range */}
      <div className="flex justify-between items-center mb-6 px-4 py-3 bg-white/10 rounded-xl">
        <div className="text-center">
          <p className="text-xs opacity-70 mb-1">Min</p>
          <p className="font-semibold">{formatTemperature(weather.main.temp_min, tempUnit)}</p>
        </div>
        <div className="w-px h-8 bg-white/20"></div>
        <div className="text-center">
          <p className="text-xs opacity-70 mb-1">Max</p>
          <p className="font-semibold">{formatTemperature(weather.main.temp_max, tempUnit)}</p>
        </div>
      </div>

      {/* Weather Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Humidity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center p-3 bg-white/10 rounded-xl"
        >
          <Droplets className="w-5 h-5 mr-3 opacity-70" />
          <div>
            <p className="text-sm font-semibold">{weather.main.humidity}%</p>
            <p className="text-xs opacity-70">{humidityLevel}</p>
          </div>
        </motion.div>

        {/* Wind */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center p-3 bg-white/10 rounded-xl"
        >
          <Wind className="w-5 h-5 mr-3 opacity-70" />
          <div>
            <p className="text-sm font-semibold">{formatWindSpeed(weather.wind.speed, windUnit)}</p>
            <p className="text-xs opacity-70">
              {WeatherApiService.getWindDirection(weather.wind.deg)}
            </p>
          </div>
        </motion.div>

        {/* Pressure */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center p-3 bg-white/10 rounded-xl"
        >
          <Gauge className="w-5 h-5 mr-3 opacity-70" />
          <div>
            <p className="text-sm font-semibold">{weather.main.pressure} hPa</p>
            <p className="text-xs opacity-70">{pressureTrend.level}</p>
          </div>
        </motion.div>

        {/* Visibility */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center p-3 bg-white/10 rounded-xl"
        >
          <Eye className="w-5 h-5 mr-3 opacity-70" />
          <div>
            <p className="text-sm font-semibold">{Math.round(weather.visibility / 1000)} km</p>
            <p className="text-xs opacity-70">{visibilityDesc}</p>
          </div>
        </motion.div>
      </div>

      {/* Sun Times */}
      <div className="flex justify-between items-center p-4 bg-white/10 rounded-xl">
        <div className="flex items-center">
          <Sunrise className="w-5 h-5 mr-2 opacity-70" />
          <div>
            <p className="text-xs opacity-70">Sunrise</p>
            <p className="text-sm font-semibold">
              {formatTime(weather.sys.sunrise, weather.timezone, timeFormat)}
            </p>
          </div>
        </div>
        
        <div className="w-px h-8 bg-white/20"></div>
        
        <div className="flex items-center">
          <Sunset className="w-5 h-5 mr-2 opacity-70" />
          <div>
            <p className="text-xs opacity-70">Sunset</p>
            <p className="text-sm font-semibold">
              {formatTime(weather.sys.sunset, weather.timezone, timeFormat)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WeatherCard;
