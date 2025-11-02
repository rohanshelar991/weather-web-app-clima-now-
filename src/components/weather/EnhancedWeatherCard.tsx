import React from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MapPin, 
  Thermometer, 
  Droplets, 
  Wind, 
  Gauge, 
  Eye,
  Sun,
  Sunrise,
  Sunset,
  Activity,
  CloudRain,
  CloudSnow,
  Zap,
  Cloud
} from 'lucide-react';
import { CurrentWeather } from '../../types/weather';
import { formatTemperature, formatWindSpeed } from '../../utils/weatherUtils';
import {
  getWeatherConditionType,
  isNightTime
} from '../../utils/weatherUtils';

interface EnhancedWeatherCardProps {
  weather: CurrentWeather;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
  className?: string;
}

const EnhancedWeatherCard: React.FC<EnhancedWeatherCardProps> = ({
  weather,
  onToggleFavorite,
  isFavorite = false,
  className = ''
}) => {
  const mainWeather = weather.weather[0];
  const conditionType = getWeatherConditionType(mainWeather.main);
  const nightTime = isNightTime(weather.dt, weather.sys.sunrise, weather.sys.sunset);

  // Get dynamic weather icon
  const getWeatherIconComponent = (condition: string, isNight: boolean) => {
    switch (condition.toLowerCase()) {
      case 'rain':
      case 'drizzle':
        return <CloudRain className="w-16 h-16 text-blue-300 animate-pulse" />;
      case 'snow':
        return <CloudSnow className="w-16 h-16 text-blue-100 animate-bounce" />;
      case 'thunderstorm':
        return <Zap className="w-16 h-16 text-yellow-300 animate-pulse" />;
      case 'clouds':
        return <Cloud className="w-16 h-16 text-gray-300" />;
      case 'clear':
        return isNight ? 
          <Sun className="w-16 h-16 text-blue-200" /> : 
          <Sun className="w-16 h-16 text-yellow-400 animate-spin" style={{ animationDuration: '10s' }} />;
      default:
        return <Sun className="w-16 h-16 text-yellow-400" />;
    }
  };

  // Dynamic gradient based on weather and time
  const getWeatherGradient = () => {
    if (nightTime) {
      switch (conditionType) {
        case 'rain':
        case 'drizzle':
          return 'from-slate-900 via-slate-700 to-blue-900';
        case 'snow':
          return 'from-slate-800 via-blue-900 to-indigo-900';
        case 'thunderstorm':
          return 'from-gray-900 via-purple-900 to-indigo-900';
        case 'clear':
          return 'from-indigo-900 via-purple-800 to-blue-900';
        default:
          return 'from-slate-800 via-gray-800 to-blue-900';
      }
    } else {
      switch (conditionType) {
        case 'rain':
        case 'drizzle':
          return 'from-slate-600 via-blue-500 to-blue-400';
        case 'snow':
          return 'from-blue-300 via-white to-blue-200';
        case 'thunderstorm':
          return 'from-gray-700 via-purple-600 to-blue-600';
        case 'clear':
          return 'from-blue-400 via-sky-300 to-orange-300';
        case 'clouds':
          return 'from-gray-500 via-gray-400 to-blue-300';
        default:
          return 'from-blue-500 via-sky-400 to-blue-300';
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        duration: 0.8, 
        type: "spring", 
        stiffness: 100,
        damping: 15
      }}
      className={`relative w-full ${className}`}
    >
      {/* Main Weather Card */}
      <div className={`bg-gradient-to-br ${getWeatherGradient()} backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/20 text-white relative overflow-hidden`}>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Favorite Button */}
        {onToggleFavorite && (
          <motion.button
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleFavorite}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 sm:p-3 rounded-full bg-white/20 hover:bg-white/30 transition-all z-10 backdrop-blur-sm"
          >
            <Heart
              className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${
                isFavorite ? 'text-red-400 fill-red-400' : 'text-white/70 hover:text-red-400'
              }`}
            />
          </motion.button>
        )}

        {/* Location Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center mb-4 sm:mb-6"
        >
          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-white/70" />
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold">{weather.name}</h2>
            <p className="text-xs sm:text-sm text-white/70">{weather.sys.country}</p>
          </div>
        </motion.div>

        {/* Main Temperature Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          className="text-center mb-6 sm:mb-8"
        >
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            {getWeatherIconComponent(mainWeather.main, nightTime)}
          </div>
          
          <div className="text-6xl sm:text-7xl md:text-8xl font-thin mb-2 leading-none">
            {Math.round(weather.main.temp)}°
          </div>
          
          <p className="text-base sm:text-lg md:text-xl text-white/80 capitalize font-medium mb-2">
            {mainWeather.description}
          </p>
          
          <p className="text-white/60 text-sm sm:text-base">
            Feels like {Math.round(weather.main.feels_like)}°
          </p>
        </motion.div>

        {/* Temperature Range Bar */}
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: '100%' }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="bg-white/10 rounded-full p-3 sm:p-4 mb-5 sm:mb-6 backdrop-blur-sm"
        >
          <div className="flex justify-between items-center">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-white/60 mb-1">Min</p>
              <p className="text-lg sm:text-xl font-semibold">{Math.round(weather.main.temp_min)}°</p>
            </div>
            
            <div className="flex-1 mx-4 sm:mx-6">
              <div className="h-2 sm:h-3 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '70%' }}
                  transition={{ delay: 0.8, duration: 1 }}
                  className="h-full bg-gradient-to-r from-blue-400 to-orange-400 rounded-full"
                />
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-xs sm:text-sm text-white/60 mb-1">Max</p>
              <p className="text-lg sm:text-xl font-semibold">{Math.round(weather.main.temp_max)}°</p>
            </div>
          </div>
        </motion.div>

        {/* Weather Details Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5 sm:mb-6">
          {/* Humidity */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="card-base p-3 sm:p-4"
          >
            <div className="flex items-center">
              <Droplets className="w-5 h-5 sm:w-6 sm:h-6 text-blue-300 mr-2 sm:mr-3" />
              <div>
                <p className="text-xl sm:text-2xl font-bold">{weather.main.humidity}%</p>
                <p className="text-xs sm:text-sm text-white/60">Humidity</p>
              </div>
            </div>
          </motion.div>

          {/* Wind Speed */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="card-base p-3 sm:p-4"
          >
            <div className="flex items-center">
              <Wind className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300 mr-2 sm:mr-3" />
              <div>
                <p className="text-xl sm:text-2xl font-bold">{Math.round(weather.wind?.speed * 3.6 || 0)}</p>
                <p className="text-xs sm:text-sm text-white/60">km/h</p>
              </div>
            </div>
          </motion.div>

          {/* Pressure */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
            className="card-base p-3 sm:p-4"
          >
            <div className="flex items-center">
              <Gauge className="w-5 h-5 sm:w-6 sm:h-6 text-green-300 mr-2 sm:mr-3" />
              <div>
                <p className="text-xl sm:text-2xl font-bold">{weather.main.pressure}</p>
                <p className="text-xs sm:text-sm text-white/60">hPa</p>
              </div>
            </div>
          </motion.div>

          {/* Visibility */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0 }}
            className="card-base p-3 sm:p-4"
          >
            <div className="flex items-center">
              <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-purple-300 mr-2 sm:mr-3" />
              <div>
                <p className="text-xl sm:text-2xl font-bold">{Math.round((weather.visibility || 0) / 1000)}</p>
                <p className="text-xs sm:text-sm text-white/60">km</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sun Times */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="card-base p-3 sm:p-4"
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
            <div className="flex items-center">
              <Sunrise className="w-4 h-4 sm:w-5 sm:h-5 text-orange-300 mr-2" />
              <div>
                <p className="text-xs sm:text-sm text-white/60">Sunrise</p>
                <p className="font-semibold text-sm sm:text-base">
                  {new Date(weather.sys.sunrise * 1000).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
              </div>
            </div>

            <div className="w-full sm:w-px h-px sm:h-8 bg-white/20"></div>

            <div className="flex items-center">
              <Sunset className="w-4 h-4 sm:w-5 sm:h-5 text-orange-300 mr-2" />
              <div>
                <p className="text-xs sm:text-sm text-white/60">Sunset</p>
                <p className="font-semibold text-sm sm:text-base">
                  {new Date(weather.sys.sunset * 1000).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Last Updated */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center mt-4 text-xs sm:text-sm text-white/50"
        >
          Updated {new Date().toLocaleTimeString()}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EnhancedWeatherCard;
