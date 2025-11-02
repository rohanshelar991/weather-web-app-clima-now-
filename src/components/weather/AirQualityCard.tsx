import React from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { AirQualityResponse, UserPreferences } from '../../types/weather';

interface AirQualityCardProps {
  airQuality: AirQualityResponse;
  preferences: UserPreferences;
  className?: string;
}

interface PollutantItemProps {
  name: string;
  value: number;
  unit: string;
  description: string;
  level: 'good' | 'moderate' | 'poor' | 'unhealthy';
  color: string;
}

const PollutantItem: React.FC<PollutantItemProps> = ({
  name,
  value,
  unit,
  description,
  level,
  color
}) => {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'good': return 'text-green-300 bg-green-500/20';
      case 'moderate': return 'text-yellow-300 bg-yellow-500/20';
      case 'poor': return 'text-orange-300 bg-orange-500/20';
      case 'unhealthy': return 'text-red-300 bg-red-500/20';
      default: return 'text-gray-300 bg-gray-500/20';
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-white">{name}</span>
        <span className={`px-2 py-1 rounded-full text-xs ${getLevelColor(level)}`}>
          {level}
        </span>
      </div>
      <div className="text-lg font-bold text-white">
        {value.toFixed(1)} <span className="text-sm font-normal opacity-75">{unit}</span>
      </div>
      <p className="text-xs opacity-75 mt-1">{description}</p>
    </div>
  );
};

const AirQualityCard: React.FC<AirQualityCardProps> = ({
  airQuality,
  preferences,
  className = ''
}) => {
  const currentAQI = airQuality.list[0];
  const aqi = currentAQI.main.aqi;
  const components = currentAQI.components;

  const getAQIInfo = (aqi: number) => {
    switch (aqi) {
      case 1:
        return {
          label: 'Good',
          description: 'Air quality is excellent. Great day for outdoor activities!',
          color: 'text-green-300',
          bgColor: 'bg-green-500/20',
          icon: <CheckCircle className="w-6 h-6" />,
          advice: 'Perfect air quality. Enjoy your time outdoors!'
        };
      case 2:
        return {
          label: 'Fair',
          description: 'Air quality is acceptable for most people.',
          color: 'text-blue-300',
          bgColor: 'bg-blue-500/20',
          icon: <CheckCircle className="w-6 h-6" />,
          advice: 'Good air quality. Safe for outdoor activities.'
        };
      case 3:
        return {
          label: 'Moderate',
          description: 'Sensitive individuals should consider limiting outdoor activities.',
          color: 'text-yellow-300',
          bgColor: 'bg-yellow-500/20',
          icon: <Info className="w-6 h-6" />,
          advice: 'Moderate air quality. Sensitive people should be cautious.'
        };
      case 4:
        return {
          label: 'Poor',
          description: 'Everyone may experience health effects. Limit outdoor activities.',
          color: 'text-orange-300',
          bgColor: 'bg-orange-500/20',
          icon: <AlertTriangle className="w-6 h-6" />,
          advice: 'Poor air quality. Consider reducing outdoor activities.'
        };
      case 5:
        return {
          label: 'Very Poor',
          description: 'Health warnings of emergency conditions. Avoid outdoor activities.',
          color: 'text-red-300',
          bgColor: 'bg-red-500/20',
          icon: <AlertTriangle className="w-6 h-6" />,
          advice: 'Very poor air quality! Avoid outdoor activities.'
        };
      default:
        return {
          label: 'Unknown',
          description: 'Air quality information is not available.',
          color: 'text-gray-300',
          bgColor: 'bg-gray-500/20',
          icon: <Info className="w-6 h-6" />,
          advice: 'Air quality data unavailable.'
        };
    }
  };

  const aqiInfo = getAQIInfo(aqi);

  const getPollutantLevel = (pollutant: string, value: number): 'good' | 'moderate' | 'poor' | 'unhealthy' => {
    const thresholds: Record<string, number[]> = {
      pm2_5: [12, 35, 55], // WHO guidelines
      pm10: [20, 50, 100],
      no2: [40, 100, 200],
      so2: [20, 80, 250],
      co: [4000, 14000, 30000],
      o3: [100, 160, 240],
      nh3: [200, 400, 800]
    };

    const limits = thresholds[pollutant] || [50, 100, 200];
    
    if (value <= limits[0]) return 'good';
    if (value <= limits[1]) return 'moderate';
    if (value <= limits[2]) return 'poor';
    return 'unhealthy';
  };

  const pollutants = [
    {
      name: 'PM2.5',
      value: components.pm2_5,
      unit: 'μg/m³',
      description: 'Fine particulate matter',
      level: getPollutantLevel('pm2_5', components.pm2_5)
    },
    {
      name: 'PM10',
      value: components.pm10,
      unit: 'μg/m³',
      description: 'Coarse particulate matter',
      level: getPollutantLevel('pm10', components.pm10)
    },
    {
      name: 'NO₂',
      value: components.no2,
      unit: 'μg/m³',
      description: 'Nitrogen dioxide',
      level: getPollutantLevel('no2', components.no2)
    },
    {
      name: 'SO₂',
      value: components.so2,
      unit: 'μg/m³',
      description: 'Sulfur dioxide',
      level: getPollutantLevel('so2', components.so2)
    },
    {
      name: 'CO',
      value: components.co,
      unit: 'μg/m³',
      description: 'Carbon monoxide',
      level: getPollutantLevel('co', components.co)
    },
    {
      name: 'O₃',
      value: components.o3,
      unit: 'μg/m³',
      description: 'Ground-level ozone',
      level: getPollutantLevel('o3', components.o3)
    }
  ];

  const AQIScale = () => (
    <div className="mt-6">
      <h4 className="text-white font-semibold mb-3">Air Quality Scale</h4>
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {[
          { level: 1, label: 'Good', color: 'bg-green-500' },
          { level: 2, label: 'Fair', color: 'bg-blue-500' },
          { level: 3, label: 'Moderate', color: 'bg-yellow-500' },
          { level: 4, label: 'Poor', color: 'bg-orange-500' },
          { level: 5, label: 'Very Poor', color: 'bg-red-500' }
        ].map((item) => (
          <div
            key={item.level}
            className={`p-2 rounded text-center text-white text-xs ${item.color} ${
              aqi === item.level ? 'ring-2 ring-white' : 'opacity-70'
            }`}
          >
            <div className="font-bold">{item.level}</div>
            <div>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/20 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Activity className="w-6 h-6 mr-2" />
          Air Quality
        </h2>
        
        <div className={`flex items-center space-x-2 px-3 py-2 rounded-full ${aqiInfo.bgColor}`}>
          <span className={`${aqiInfo.color}`}>
            {aqiInfo.icon}
          </span>
          <span className={`font-semibold ${aqiInfo.color}`}>
            AQI {aqi}
          </span>
        </div>
      </div>

      {/* Main AQI Info */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
        <div className="text-center">
          <div className={`text-4xl font-bold mb-2 ${aqiInfo.color}`}>
            {aqi}
          </div>
          <div className={`text-xl font-semibold mb-2 ${aqiInfo.color}`}>
            {aqiInfo.label}
          </div>
          <p className="text-white/80 text-sm mb-3">{aqiInfo.description}</p>
          
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${aqiInfo.bgColor}`}>
            <Info className="w-4 h-4" />
            <span className="text-sm font-medium">{aqiInfo.advice}</span>
          </div>
        </div>
      </div>

      {/* Pollutant Details */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Pollutant Levels</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {pollutants.map((pollutant) => (
            <PollutantItem
              key={pollutant.name}
              name={pollutant.name}
              value={pollutant.value}
              unit={pollutant.unit}
              description={pollutant.description}
              level={pollutant.level}
              color=""
            />
          ))}
        </div>
      </div>

      {/* Health Recommendations */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
        <h4 className="text-white font-semibold mb-3 flex items-center">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Health Recommendations
        </h4>
        <div className="space-y-2 text-sm text-white/80">
          {aqi <= 2 && (
            <ul className="space-y-1">
              <li>• Perfect conditions for outdoor activities</li>
              <li>• Windows can be kept open for fresh air</li>
              <li>• Great day for exercising outdoors</li>
            </ul>
          )}
          {aqi === 3 && (
            <ul className="space-y-1">
              <li>• Generally safe for outdoor activities</li>
              <li>• Sensitive individuals should be cautious</li>
              <li>• Consider shorter outdoor exercise sessions</li>
            </ul>
          )}
          {aqi >= 4 && (
            <ul className="space-y-1">
              <li>• Limit outdoor activities, especially for children and elderly</li>
              <li>• Keep windows closed</li>
              <li>• Consider using an air purifier indoors</li>
              <li>• Wear a mask if you must go outside</li>
            </ul>
          )}
        </div>
      </div>

      {/* AQI Scale */}
      <AQIScale />
    </motion.div>
  );
};

export default AirQualityCard;
