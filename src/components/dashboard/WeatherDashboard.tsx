import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Eye, 
  Gauge, 
  Sun, 
  Cloud, 
  CloudRain,
  Zap,
  Activity,
  TrendingUp,
  Calendar,
  MapPin,
  Clock,
  BarChart3,
  LineChart,
  PieChart
} from 'lucide-react';
import { 
  CurrentWeather, 
  DailyForecastItem, 
  AirQualityResponse, 
  UserPreferences,
  WeatherWidget
} from '../../types/weather';
import { formatTemperature, formatWindSpeed } from '../../utils/weatherUtils';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell
} from 'recharts';

interface WeatherDashboardProps {
  currentWeather: CurrentWeather;
  dailyForecast: DailyForecastItem[];
  airQuality: AirQualityResponse;
  preferences: UserPreferences;
  onWidgetChange?: (widgets: WeatherWidget[]) => void;
  className?: string;
}

const WeatherDashboard: React.FC<WeatherDashboardProps> = ({
  currentWeather,
  dailyForecast,
  airQuality,
  preferences,
  onWidgetChange,
  className = ''
}) => {
  const [widgets, setWidgets] = useState<WeatherWidget[]>([
    { id: 'current', type: 'current', size: 'large', position: { x: 0, y: 0 }, settings: {} },
    { id: 'forecast', type: 'forecast', size: 'medium', position: { x: 1, y: 0 }, settings: {} },
    { id: 'airQuality', type: 'airQuality', size: 'medium', position: { x: 2, y: 0 }, settings: {} },
    { id: 'temperatureChart', type: 'forecast', size: 'medium', position: { x: 0, y: 1 }, settings: {} },
    { id: 'precipitationChart', type: 'forecast', size: 'medium', position: { x: 1, y: 1 }, settings: {} },
    { id: 'windChart', type: 'forecast', size: 'medium', position: { x: 2, y: 1 }, settings: {} }
  ]);

  // Prepare data for charts
  const temperatureData = dailyForecast.slice(0, 7).map(day => ({
    date: new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
    min: Math.round(day.temp.min),
    max: Math.round(day.temp.max),
    feelsLike: Math.round(day.feels_like.day)
  }));

  const precipitationData = dailyForecast.slice(0, 7).map(day => ({
    date: new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
    precipitation: Math.round((day.rain || 0) * 10) / 10,
    probability: Math.round(day.pop * 100)
  }));

  const windData = dailyForecast.slice(0, 7).map(day => ({
    date: new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
    speed: Math.round(day.wind_speed),
    gust: Math.round(day.wind_gust || day.wind_speed)
  }));

  const airQualityData = [
    { name: 'PM2.5', value: airQuality.list[0].components.pm2_5 },
    { name: 'PM10', value: airQuality.list[0].components.pm10 },
    { name: 'NO2', value: airQuality.list[0].components.no2 },
    { name: 'SO2', value: airQuality.list[0].components.so2 },
    { name: 'O3', value: airQuality.list[0].components.o3 },
    { name: 'CO', value: airQuality.list[0].components.co }
  ];

  const getAQIColor = (value: number, pollutant: string): string => {
    // Simplified color coding based on WHO guidelines
    const thresholds: Record<string, number[]> = {
      pm2_5: [15, 45, 75],
      pm10: [45, 150, 250],
      no2: [40, 100, 200],
      so2: [20, 80, 250],
      o3: [100, 160, 240],
      co: [4400, 9400, 12400]
    };

    const limits = thresholds[pollutant] || [50, 100, 200];
    
    if (value <= limits[0]) return '#10B981'; // green
    if (value <= limits[1]) return '#F59E0B'; // yellow
    if (value <= limits[2]) return '#EF4444'; // red
    return '#8B5CF6'; // purple
  };

  const CurrentWeatherWidget = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Current Weather</h3>
        <MapPin className="w-5 h-5 text-white/70" />
      </div>
      
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          {getWeatherIcon(currentWeather.weather[0].main)}
        </div>
        
        <div className="text-5xl font-thin mb-2">
          {Math.round(currentWeather.main.temp)}°
        </div>
        
        <p className="text-white/80 capitalize font-medium mb-4">
          {currentWeather.weather[0].description}
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center">
              <Droplets className="w-4 h-4 text-blue-300 mr-2" />
              <span className="text-sm text-white/70">Humidity</span>
            </div>
            <p className="text-lg font-semibold">{currentWeather.main.humidity}%</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center">
              <Wind className="w-4 h-4 text-gray-300 mr-2" />
              <span className="text-sm text-white/70">Wind</span>
            </div>
            <p className="text-lg font-semibold">
              {Math.round(currentWeather.wind.speed * 3.6)} km/h
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const ForecastWidget = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-gradient-to-br from-indigo-500/20 to-blue-500/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">7-Day Forecast</h3>
        <Calendar className="w-5 h-5 text-white/70" />
      </div>
      
      <div className="space-y-3">
        {dailyForecast.slice(0, 5).map((day, index) => (
          <div key={day.dt} className="flex items-center justify-between py-2">
            <div className="flex items-center">
              <span className="text-white/80 w-12 text-sm">
                {new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <div className="ml-3">
                {getWeatherIcon(day.weather[0].main)}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-white/60 text-sm">
                {Math.round(day.temp.min)}°
              </span>
              <div className="w-16 h-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-orange-400 rounded-full"
                  style={{ width: `${((day.temp.max - day.temp.min) / 30) * 100}%` }}
                />
              </div>
              <span className="font-medium">
                {Math.round(day.temp.max)}°
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const AirQualityWidget = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gradient-to-br from-green-500/20 to-teal-500/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Air Quality</h3>
        <Activity className="w-5 h-5 text-white/70" />
      </div>
      
      <div className="text-center mb-4">
        <div className="text-3xl font-bold text-white">
          {airQuality.list[0].main.aqi}
        </div>
        <p className="text-white/80">
          {getAQIDescription(airQuality.list[0].main.aqi)}
        </p>
      </div>
      
      <div className="space-y-2">
        {airQualityData.slice(0, 4).map((pollutant, index) => (
          <div key={pollutant.name} className="flex items-center justify-between">
            <span className="text-sm text-white/70">{pollutant.name}</span>
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2">
                {Math.round(pollutant.value)}
              </span>
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getAQIColor(pollutant.value, pollutant.name.toLowerCase()) }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const TemperatureChartWidget = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Temperature Trend</h3>
        <Thermometer className="w-5 h-5 text-white/70" />
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={temperatureData}>
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
              formatter={(value) => [`${value}°`, '']}
            />
            <Line 
              type="monotone" 
              dataKey="max" 
              stroke="#F59E0B" 
              strokeWidth={2}
              dot={{ stroke: '#F59E0B', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="min" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={{ stroke: '#3B82F6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );

  const PrecipitationChartWidget = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Precipitation</h3>
        <CloudRain className="w-5 h-5 text-white/70" />
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={precipitationData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="date" 
              stroke="rgba(255,255,255,0.5)" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.5)" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value}mm`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.7)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: 'white'
              }}
              formatter={(value, name) => {
                if (name === 'probability') {
                  return [`${value}%`, 'Rain Probability'];
                }
                return [`${value}mm`, 'Precipitation'];
              }}
            />
            <Bar 
              dataKey="precipitation" 
              fill="#3B82F6" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );

  const WindChartWidget = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-gradient-to-br from-gray-500/20 to-slate-500/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Wind Speed</h3>
        <Wind className="w-5 h-5 text-white/70" />
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={windData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="date" 
              stroke="rgba(255,255,255,0.5)" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.5)" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value} km/h`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.7)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: 'white'
              }}
              formatter={(value) => [`${value} km/h`, '']}
            />
            <Line 
              type="monotone" 
              dataKey="speed" 
              stroke="#94A3B8" 
              strokeWidth={2}
              dot={{ stroke: '#94A3B8', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="gust" 
              stroke="#64748B" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ stroke: '#64748B', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );

  const renderWidget = (widget: WeatherWidget) => {
    switch (widget.id) {
      case 'current':
        return <CurrentWeatherWidget />;
      case 'forecast':
        return <ForecastWidget />;
      case 'airQuality':
        return <AirQualityWidget />;
      case 'temperatureChart':
        return <TemperatureChartWidget />;
      case 'precipitationChart':
        return <PrecipitationChartWidget />;
      case 'windChart':
        return <WindChartWidget />;
      default:
        return <div>Unknown widget type</div>;
    }
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {widgets.map((widget, index) => (
        <motion.div
          key={widget.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className={`
            ${widget.size === 'small' ? 'col-span-1' : ''}
            ${widget.size === 'medium' ? 'col-span-1' : ''}
            ${widget.size === 'large' ? 'col-span-1 md:col-span-2 lg:col-span-3' : ''}
          `}
        >
          {renderWidget(widget)}
        </motion.div>
      ))}
    </div>
  );
};

// Helper functions
const getWeatherIcon = (condition: string) => {
  switch (condition.toLowerCase()) {
    case 'clear':
      return <Sun className="w-6 h-6 text-yellow-400" />;
    case 'clouds':
      return <Cloud className="w-6 h-6 text-gray-300" />;
    case 'rain':
      return <CloudRain className="w-6 h-6 text-blue-400" />;
    case 'snow':
      return <CloudRain className="w-6 h-6 text-blue-100" />;
    case 'thunderstorm':
      return <Zap className="w-6 h-6 text-yellow-400" />;
    default:
      return <Sun className="w-6 h-6 text-yellow-400" />;
  }
};

const getAQIDescription = (aqi: number): string => {
  switch (aqi) {
    case 1: return 'Good';
    case 2: return 'Fair';
    case 3: return 'Moderate';
    case 4: return 'Poor';
    case 5: return 'Very Poor';
    default: return 'Unknown';
  }
};

export default WeatherDashboard;