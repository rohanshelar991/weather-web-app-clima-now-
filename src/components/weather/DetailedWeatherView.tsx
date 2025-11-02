import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Eye, 
  Gauge, 
  Sunrise, 
  Sunset, 
  Navigation, 
  CloudRain,
  Zap,
  Cloud,
  Sun,
  Moon,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3
} from 'lucide-react';
import { 
  CurrentWeather, 
  DailyForecastItem, 
  ForecastItem,
  AirQualityResponse,
  WeatherAlert,
  UserPreferences
} from '../../types/weather';
import { 
  formatTemperature, 
  formatWindSpeed, 
  formatTime, 
  getDayOfWeek,
  getWeatherConditionType,
  isNightTime
} from '../../utils/weatherUtils';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

interface DetailedWeatherViewProps {
  currentWeather: CurrentWeather;
  dailyForecast: DailyForecastItem[];
  hourlyForecast: ForecastItem[];
  airQuality: AirQualityResponse;
  alerts: WeatherAlert[];
  preferences: UserPreferences;
  className?: string;
}

interface HourlyDataPoint {
  time: string;
  temp: number;
  condition: string;
  precipitation: number;
}

interface DailyDataPoint {
  date: string;
  minTemp: number;
  maxTemp: number;
  condition: string;
}

const DetailedWeatherView: React.FC<DetailedWeatherViewProps> = ({
  currentWeather,
  dailyForecast,
  hourlyForecast,
  airQuality,
  alerts,
  preferences,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'hourly' | 'daily' | 'details' | 'alerts'>('hourly');
  const [hourlyData, setHourlyData] = useState<HourlyDataPoint[]>([]);
  const [dailyData, setDailyData] = useState<DailyDataPoint[]>([]);

  // Prepare hourly forecast data
  useEffect(() => {
    const data: HourlyDataPoint[] = hourlyForecast.slice(0, 24).map(item => ({
      time: new Date(item.dt * 1000).toLocaleTimeString('en-US', {
        hour: 'numeric',
        hour12: true
      }),
      temp: Math.round(item.main.temp),
      condition: item.weather[0].main,
      precipitation: Math.round((item.pop || 0) * 100)
    }));
    setHourlyData(data);
  }, [hourlyForecast]);

  // Prepare daily forecast data
  useEffect(() => {
    const data: DailyDataPoint[] = dailyForecast.slice(0, 7).map(day => ({
      date: getDayOfWeek(day.dt, currentWeather.timezone),
      minTemp: Math.round(day.temp.min),
      maxTemp: Math.round(day.temp.max),
      condition: day.weather[0].main
    }));
    setDailyData(data);
  }, [dailyForecast, currentWeather.timezone]);

  // Get weather icon component
  const getWeatherIcon = (condition: string, isNight: boolean = false) => {
    const size = 'w-6 h-6';
    
    switch (condition.toLowerCase()) {
      case 'clear':
        return isNight ? 
          <Moon className={`${size} text-yellow-200`} /> : 
          <Sun className={`${size} text-yellow-400`} />;
      case 'clouds':
        return <Cloud className={`${size} text-gray-300`} />;
      case 'rain':
        return <CloudRain className={`${size} text-blue-400`} />;
      case 'snow':
        return <CloudRain className={`${size} text-blue-100`} />;
      case 'thunderstorm':
        return <Zap className={`${size} text-yellow-400`} />;
      default:
        return <Sun className={`${size} text-yellow-400`} />;
    }
  };

  // Get UV index description
  const getUVDescription = (uvIndex: number) => {
    if (uvIndex <= 2) return { level: 'Low', color: 'text-green-400' };
    if (uvIndex <= 5) return { level: 'Moderate', color: 'text-yellow-400' };
    if (uvIndex <= 7) return { level: 'High', color: 'text-orange-400' };
    if (uvIndex <= 10) return { level: 'Very High', color: 'text-red-400' };
    return { level: 'Extreme', color: 'text-purple-400' };
  };

  // Get air quality description
  const getAQIDescription = (aqi: number) => {
    switch (aqi) {
      case 1: return { level: 'Good', color: 'text-green-400' };
      case 2: return { level: 'Fair', color: 'text-blue-400' };
      case 3: return { level: 'Moderate', color: 'text-yellow-400' };
      case 4: return { level: 'Poor', color: 'text-orange-400' };
      case 5: return { level: 'Very Poor', color: 'text-red-400' };
      default: return { level: 'Unknown', color: 'text-gray-400' };
    }
  };

  // Render hourly forecast chart
  const renderHourlyChart = () => (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={hourlyData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="time" 
            stroke="rgba(255,255,255,0.5)" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.5)" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value}°`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.7)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white'
              }}
            formatter={(value) => [`${value}°`, 'Temperature']}
            labelStyle={{ color: 'white' }}
          />
          <Line 
            type="monotone" 
            dataKey="temp" 
            stroke="#3B82F6" 
            strokeWidth={2}
            dot={{ stroke: '#3B82F6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  // Render daily forecast chart
  const renderDailyChart = () => (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dailyData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="date" 
            stroke="rgba(255,255,255,0.5)" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.5)" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value}°`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.7)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white'
            }}
            formatter={(value) => [`${value}°`, 'Temperature']}
            labelStyle={{ color: 'white' }}
          />
          <Bar 
            dataKey="maxTemp" 
            fill="#F59E0B" 
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="minTemp" 
            fill="#3B82F6" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  // Render detailed weather metrics
  const renderDetailedMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
        <div className="flex items-center mb-3">
          <Droplets className="w-5 h-5 text-blue-400 mr-2" />
          <h3 className="font-semibold text-white">Humidity</h3>
        </div>
        <div className="text-3xl font-bold text-white mb-1">
          {currentWeather.main.humidity}%
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div 
            className="bg-blue-400 h-2 rounded-full" 
            style={{ width: `${currentWeather.main.humidity}%` }}
          ></div>
        </div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
        <div className="flex items-center mb-3">
          <Wind className="w-5 h-5 text-gray-400 mr-2" />
          <h3 className="font-semibold text-white">Wind</h3>
        </div>
        <div className="text-3xl font-bold text-white mb-1">
          {Math.round(currentWeather.wind.speed * 3.6)} km/h
        </div>
        <div className="text-sm text-white/70">
          Direction: {Math.round(currentWeather.wind.deg)}°
        </div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
        <div className="flex items-center mb-3">
          <Gauge className="w-5 h-5 text-green-400 mr-2" />
          <h3 className="font-semibold text-white">Pressure</h3>
        </div>
        <div className="text-3xl font-bold text-white mb-1">
          {currentWeather.main.pressure} hPa
        </div>
        <div className="text-sm text-white/70">
          {currentWeather.main.pressure > 1013.25 ? 'High' : 'Low'} pressure
        </div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
        <div className="flex items-center mb-3">
          <Eye className="w-5 h-5 text-purple-400 mr-2" />
          <h3 className="font-semibold text-white">Visibility</h3>
        </div>
        <div className="text-3xl font-bold text-white mb-1">
          {Math.round((currentWeather.visibility || 0) / 1000)} km
        </div>
        <div className="text-sm text-white/70">
          {(currentWeather.visibility || 0) > 10000 ? 'Excellent' : 'Good'} visibility
        </div>
      </div>
    </div>
  );

  // Render weather alerts
  const renderAlerts = () => {
    if (alerts.length === 0) {
      return (
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">No Active Alerts</h3>
          <p className="text-white/70">No weather alerts for your area</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {alerts.map((alert, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-red-500/20 border border-red-400/30 rounded-xl p-4"
          >
            <div className="flex items-start">
              <Zap className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white mb-1">{alert.event}</h3>
                <p className="text-white/80 text-sm mb-2">{alert.description}</p>
                <div className="flex items-center text-xs text-white/60">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>
                    {new Date(alert.start * 1000).toLocaleString()} - 
                    {new Date(alert.end * 1000).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-white/10 backdrop-blur-md rounded-xl p-1 border border-white/20">
        <button
          onClick={() => setActiveTab('hourly')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'hourly'
              ? 'bg-white/20 text-white'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          Hourly
        </button>
        <button
          onClick={() => setActiveTab('daily')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'daily'
              ? 'bg-white/20 text-white'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          7-Day
        </button>
        <button
          onClick={() => setActiveTab('details')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'details'
              ? 'bg-white/20 text-white'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          Details
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors relative ${
            activeTab === 'alerts'
              ? 'bg-white/20 text-white'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          Alerts
          {alerts.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {alerts.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        {activeTab === 'hourly' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Hourly Forecast
            </h2>
            {renderHourlyChart()}
            
            {/* Hourly forecast list */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {hourlyData.slice(0, 12).map((hour, index) => (
                <div 
                  key={index} 
                  className="bg-white/10 rounded-lg p-3 text-center"
                >
                  <div className="text-xs text-white/70 mb-2">
                    {hour.time}
                  </div>
                  <div className="flex justify-center mb-2">
                    {getWeatherIcon(hour.condition)}
                  </div>
                  <div className="text-lg font-semibold text-white">
                    {hour.temp}°
                  </div>
                  <div className="text-xs text-blue-300 mt-1">
                    {hour.precipitation}%
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'daily' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              7-Day Forecast
            </h2>
            {renderDailyChart()}
            
            {/* Daily forecast list */}
            <div className="mt-6 space-y-3">
              {dailyForecast.slice(0, 7).map((day, index) => {
                const isNight = isNightTime(
                  day.dt, 
                  day.sunrise, 
                  day.sunset
                );
                
                return (
                  <motion.div
                    key={day.dt}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-white/10 rounded-lg"
                  >
                    <div className="flex items-center">
                      <span className="w-20 text-sm text-white/80">
                        {index === 0 ? 'Today' : getDayOfWeek(day.dt, currentWeather.timezone)}
                      </span>
                      <div className="mx-3">
                        {getWeatherIcon(day.weather[0].main, isNight)}
                      </div>
                      <span className="text-sm capitalize text-white/70">
                        {day.weather[0].description}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-white/60">
                          {Math.round(day.temp.min)}°
                        </div>
                      </div>
                      <div className="w-20 h-1 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-400 to-orange-400 rounded-full"
                          style={{ 
                            width: `${((day.temp.max - day.temp.min) / 30) * 100}%` 
                          }}
                        />
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {Math.round(day.temp.max)}°
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeTab === 'details' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Detailed Weather Metrics
            </h2>
            {renderDetailedMetrics()}
            
            {/* Additional details */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center mb-3">
                  <Sun className="w-5 h-5 text-yellow-400 mr-2" />
                  <h3 className="font-semibold text-white">Sunrise & Sunset</h3>
                </div>
                <div className="flex justify-between">
                  <div className="text-center">
                    <Sunrise className="w-6 h-6 text-orange-400 mx-auto mb-1" />
                    <div className="text-lg font-semibold text-white">
                      {new Date(currentWeather.sys.sunrise * 1000).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </div>
                    <div className="text-xs text-white/70">Sunrise</div>
                  </div>
                  <div className="text-center">
                    <Sunset className="w-6 h-6 text-orange-400 mx-auto mb-1" />
                    <div className="text-lg font-semibold text-white">
                      {new Date(currentWeather.sys.sunset * 1000).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </div>
                    <div className="text-xs text-white/70">Sunset</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center mb-3">
                  <Navigation className="w-5 h-5 text-purple-400 mr-2" />
                  <h3 className="font-semibold text-white">UV Index</h3>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">
                    5
                  </div>
                  <div className="text-sm text-yellow-400">
                    Moderate
                  </div>
                  <div className="text-xs text-white/70 mt-2">
                    Protection recommended
                  </div>
                </div>
              </div>
            </div>
            
            {/* Air Quality */}
            <div className="mt-4 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="flex items-center mb-3">
                <Activity className="w-5 h-5 text-green-400 mr-2" />
                <h3 className="font-semibold text-white">Air Quality</h3>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">
                    {airQuality.list[0].main.aqi}
                  </div>
                  <div className="text-sm text-green-400">
                    Good
                  </div>
                </div>
                <div className="text-sm text-white/70 text-right">
                  <div>PM2.5: {Math.round(airQuality.list[0].components.pm2_5)} μg/m³</div>
                  <div>PM10: {Math.round(airQuality.list[0].components.pm10)} μg/m³</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'alerts' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Weather Alerts
            </h2>
            {renderAlerts()}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DetailedWeatherView;