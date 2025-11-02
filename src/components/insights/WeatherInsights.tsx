import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Bike, 
  Shirt, 
  Car, 
  Zap, 
  Sprout,
  ChevronRight,
  AlertTriangle,
  Info,
  CheckCircle
} from 'lucide-react';
import { WeatherInsight, PersonalizedInsights } from '../../services/weatherInsightsService';
import { CurrentWeather, DailyForecastItem, AirQualityResponse, UserPreferences } from '../../types/weather';

interface WeatherInsightsProps {
  currentWeather: CurrentWeather;
  dailyForecast: DailyForecastItem[];
  airQuality: AirQualityResponse;
  preferences: UserPreferences;
  className?: string;
}

const WeatherInsights: React.FC<WeatherInsightsProps> = ({
  currentWeather,
  dailyForecast,
  airQuality,
  preferences,
  className = ''
}) => {
  const [insights, setInsights] = useState<PersonalizedInsights>({
    health: [],
    activities: [],
    clothing: [],
    travel: [],
    other: []
  });
  const [activeCategory, setActiveCategory] = useState<'all' | keyof PersonalizedInsights>('all');

  useEffect(() => {
    // In a real implementation, this would import and use the weatherInsightsService
    // For now, we'll simulate the insights generation
    const mockInsights: PersonalizedInsights = {
      health: [
        {
          id: 'hydration',
          title: 'Stay Hydrated',
          description: 'With current temperatures, it\'s important to maintain proper hydration.',
          severity: 'low',
          category: 'health',
          recommendation: 'Drink at least 8 glasses of water today.',
          icon: '💧'
        }
      ],
      activities: [
        {
          id: 'outdoor-activities',
          title: 'Great for Outdoor Activities',
          description: 'Weather conditions are ideal for outdoor exercise.',
          severity: 'low',
          category: 'activity',
          recommendation: 'Consider a morning jog or afternoon walk in the park.',
          icon: '🌳'
        }
      ],
      clothing: [
        {
          id: 'layered-clothing',
          title: 'Layered Clothing Recommended',
          description: 'Temperatures may fluctuate throughout the day.',
          severity: 'low',
          category: 'clothing',
          recommendation: 'Wear layers that can be easily added or removed.',
          icon: '👕'
        }
      ],
      travel: [],
      other: [
        {
          id: 'energy-saving',
          title: 'Energy Saving Tips',
          description: 'Moderate temperatures reduce heating/cooling needs.',
          severity: 'low',
          category: 'energy',
          recommendation: 'Take advantage of natural temperatures to save energy.',
          icon: '⚡'
        }
      ]
    };
    
    setInsights(mockInsights);
  }, [currentWeather, dailyForecast, airQuality, preferences]);

  const getSeverityColor = (severity: WeatherInsight['severity']) => {
    switch (severity) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-400/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-400/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
    }
  };

  const getCategoryIcon = (category: WeatherInsight['category']) => {
    switch (category) {
      case 'health': return <Heart className="w-5 h-5" />;
      case 'activity': return <Bike className="w-5 h-5" />;
      case 'clothing': return <Shirt className="w-5 h-5" />;
      case 'travel': return <Car className="w-5 h-5" />;
      case 'energy': return <Zap className="w-5 h-5" />;
      case 'agriculture': return <Sprout className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getCategoryLabel = (category: WeatherInsight['category']) => {
    switch (category) {
      case 'health': return 'Health';
      case 'activity': return 'Activities';
      case 'clothing': return 'Clothing';
      case 'travel': return 'Travel';
      case 'energy': return 'Energy';
      case 'agriculture': return 'Gardening';
      default: return 'General';
    }
  };

  const getFilteredInsights = () => {
    if (activeCategory === 'all') {
      return Object.values(insights).flat();
    }
    return insights[activeCategory] || [];
  };

  const categories = [
    { id: 'all', label: 'All Insights', count: Object.values(insights).flat().length },
    { id: 'health', label: 'Health', count: insights.health.length },
    { id: 'activities', label: 'Activities', count: insights.activities.length },
    { id: 'clothing', label: 'Clothing', count: insights.clothing.length },
    { id: 'travel', label: 'Travel', count: insights.travel.length },
    { id: 'other', label: 'Other', count: insights.other.length }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id as any)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeCategory === category.id
                ? 'bg-white/20 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
            }`}
          >
            {category.label} {category.count > 0 && `(${category.count})`}
          </button>
        ))}
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {getFilteredInsights().length > 0 ? (
          getFilteredInsights().map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white/10 backdrop-blur-md rounded-xl p-4 border ${getSeverityColor(insight.severity)}`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mr-3">
                  <span className="text-lg">{insight.icon}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white">{insight.title}</h3>
                    <div className="flex items-center">
                      {getCategoryIcon(insight.category)}
                      <span className="ml-1 text-xs text-white/70">
                        {getCategoryLabel(insight.category)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-white/80 text-sm mt-1">{insight.description}</p>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm text-white/70">{insight.recommendation}</p>
                    <ChevronRight className="w-4 h-4 text-white/50" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-1">No Insights Available</h3>
            <p className="text-white/70">No personalized insights for current conditions</p>
          </div>
        )}
      </div>

      {/* Daily Summary */}
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-md rounded-xl p-4 border border-white/20">
        <h3 className="font-semibold text-white mb-2 flex items-center">
          <Info className="w-5 h-5 mr-2" />
          Today's Summary
        </h3>
        <p className="text-white/80 text-sm">
          With temperatures between 18°C and 25°C and clear skies, it's a pleasant day overall. 
          Air quality is good, making it ideal for outdoor activities. Remember to stay hydrated.
        </p>
      </div>
    </div>
  );
};

export default WeatherInsights;