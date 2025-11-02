import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Droplets, 
  Wind, 
  Eye, 
  Thermometer,
  Sun,
  Moon,
  CloudRain,
  Snowflake
} from 'lucide-react';
import { 
  ForecastResponse, 
  DailyForecast, 
  DailyForecastItem, 
  ForecastItem, 
  UserPreferences 
} from '../../types/weather';
import { format, fromUnixTime } from 'date-fns';

interface ForecastCardProps {
  hourlyForecast?: ForecastResponse;
  dailyForecast?: DailyForecast;
  preferences: UserPreferences;
  className?: string;
}

interface ForecastTabProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: React.ReactNode;
}

const ForecastTab: React.FC<ForecastTabProps> = ({ active, onClick, children, icon }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
      active 
        ? 'bg-white/30 text-white shadow-lg' 
        : 'bg-white/10 text-white/70 hover:bg-white/20'
    }`}
  >
    {icon}
    <span className="font-medium">{children}</span>
  </motion.button>
);

interface HourlyItemProps {
  item: ForecastItem;
  preferences: UserPreferences;
  index: number;
}

const HourlyItem: React.FC<HourlyItemProps> = ({ item, preferences, index }) => {
  const temp = preferences.temperatureUnit === 'fahrenheit' 
    ? Math.round((item.main.temp * 9/5) + 32)
    : Math.round(item.main.temp);
  
  const time = format(fromUnixTime(item.dt), preferences.timeFormat === '12h' ? 'h:mm a' : 'HH:mm');
  const tempUnit = preferences.temperatureUnit === 'fahrenheit' ? '°F' : '°C';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex flex-col items-center space-y-2 p-3 bg-white/10 rounded-xl backdrop-blur-sm min-w-[80px]"
    >
      <span className="text-sm opacity-75">{time}</span>
      <img
        src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
        alt={item.weather[0].description}
        className="w-8 h-8"
      />
      <span className="font-semibold">{temp}{tempUnit}</span>
      <div className="flex items-center space-x-1 text-xs opacity-75">
        <Droplets className="w-3 h-3" />
        <span>{Math.round(item.pop * 100)}%</span>
      </div>
    </motion.div>
  );
};

interface DailyItemProps {
  item: DailyForecastItem;
  preferences: UserPreferences;
  index: number;
}

const DailyItem: React.FC<DailyItemProps> = ({ item, preferences, index }) => {
  const tempMax = preferences.temperatureUnit === 'fahrenheit' 
    ? Math.round((item.temp.max * 9/5) + 32)
    : Math.round(item.temp.max);
  
  const tempMin = preferences.temperatureUnit === 'fahrenheit' 
    ? Math.round((item.temp.min * 9/5) + 32)
    : Math.round(item.temp.min);

  const windSpeed = preferences.windSpeedUnit === 'mph' 
    ? Math.round(item.wind_speed * 2.237)
    : preferences.windSpeedUnit === 'kmh'
    ? Math.round(item.wind_speed * 3.6)
    : Math.round(item.wind_speed);

  const windUnit = preferences.windSpeedUnit === 'mph' ? 'mph' : 
                   preferences.windSpeedUnit === 'kmh' ? 'km/h' : 'm/s';

  const dayName = format(fromUnixTime(item.dt), 'EEEE');
  const date = format(fromUnixTime(item.dt), 'MMM d');
  const tempUnit = preferences.temperatureUnit === 'fahrenheit' ? '°F' : '°C';

  const getMoonPhaseIcon = (moonPhase: number) => {
    if (moonPhase === 0 || moonPhase === 1) return '🌑'; // New Moon
    if (moonPhase < 0.25) return '🌒'; // Waxing Crescent
    if (moonPhase === 0.25) return '🌓'; // First Quarter
    if (moonPhase < 0.5) return '🌔'; // Waxing Gibbous
    if (moonPhase === 0.5) return '🌕'; // Full Moon
    if (moonPhase < 0.75) return '🌖'; // Waning Gibbous
    if (moonPhase === 0.75) return '🌗'; // Last Quarter
    return '🌘'; // Waning Crescent
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-left">
            <h3 className="font-semibold">{dayName}</h3>
            <p className="text-sm opacity-75">{date}</p>
          </div>
          <img
            src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
            alt={item.weather[0].description}
            className="w-10 h-10"
          />
        </div>
        
        <div className="text-right">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold">{tempMax}{tempUnit}</span>
            <span className="text-sm opacity-75">{tempMin}{tempUnit}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="flex items-center space-x-1">
          <Droplets className="w-3 h-3 text-blue-300" />
          <span>{Math.round(item.pop * 100)}%</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <Wind className="w-3 h-3 text-gray-300" />
          <span>{windSpeed} {windUnit}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <Thermometer className="w-3 h-3 text-red-300" />
          <span>{item.humidity}%</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <Sun className="w-3 h-3 text-yellow-300" />
          <span>UV {Math.round(item.uvi)}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs opacity-75">
        <div className="flex items-center space-x-2">
          <Sun className="w-3 h-3" />
          <span>{format(fromUnixTime(item.sunrise), 'HH:mm')}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Moon className="w-3 h-3" />
          <span>{format(fromUnixTime(item.sunset), 'HH:mm')}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <span>{getMoonPhaseIcon(item.moon_phase)}</span>
          <span>{Math.round(item.moon_phase * 100)}%</span>
        </div>
      </div>

      <div className="mt-2 text-xs opacity-75 capitalize">
        {item.weather[0].description}
      </div>
    </motion.div>
  );
};

const ForecastCard: React.FC<ForecastCardProps> = ({ 
  hourlyForecast, 
  dailyForecast, 
  preferences, 
  className = '' 
}) => {
  const [activeTab, setActiveTab] = useState<'hourly' | 'daily'>('hourly');

  const hourlyItems = hourlyForecast?.list?.slice(0, 24) || [];
  const dailyItems = dailyForecast?.daily?.slice(0, 7) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/20 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Calendar className="w-6 h-6 mr-2" />
          Weather Forecast
        </h2>

        {/* Tab Switcher */}
        <div className="flex space-x-2">
          <ForecastTab
            active={activeTab === 'hourly'}
            onClick={() => setActiveTab('hourly')}
            icon={<Clock className="w-4 h-4" />}
          >
            Hourly
          </ForecastTab>
          <ForecastTab
            active={activeTab === 'daily'}
            onClick={() => setActiveTab('daily')}
            icon={<Calendar className="w-4 h-4" />}
          >
            Daily
          </ForecastTab>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'hourly' && (
          <motion.div
            key="hourly"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">Next 24 Hours</h3>
              <p className="text-sm text-white/70">
                Detailed hourly weather conditions and precipitation chances
              </p>
            </div>
            
            {hourlyItems.length > 0 ? (
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/30">
                <div className="flex space-x-3 pb-2">
                  {hourlyItems.map((item, index) => (
                    <HourlyItem 
                      key={item.dt} 
                      item={item} 
                      preferences={preferences} 
                      index={index}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-white/70">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Hourly forecast data not available</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'daily' && (
          <motion.div
            key="daily"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">7-Day Forecast</h3>
              <p className="text-sm text-white/70">
                Extended forecast with detailed weather conditions
              </p>
            </div>
            
            {dailyItems.length > 0 ? (
              <div className="space-y-3">
                {dailyItems.map((item, index) => (
                  <DailyItem 
                    key={item.dt} 
                    item={item} 
                    preferences={preferences} 
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/70">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Daily forecast data not available</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ForecastCard;
