import { 
  CurrentWeather, 
  DailyForecastItem, 
  AirQualityResponse,
  UserPreferences
} from '../types/weather';

export interface WeatherInsight {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  category: 'health' | 'activity' | 'clothing' | 'travel' | 'energy' | 'agriculture';
  recommendation: string;
  icon: string;
}

export interface PersonalizedInsights {
  health: WeatherInsight[];
  activities: WeatherInsight[];
  clothing: WeatherInsight[];
  travel: WeatherInsight[];
  other: WeatherInsight[];
}

class WeatherInsightsService {
  // Generate personalized weather insights based on current conditions
  generateInsights(
    currentWeather: CurrentWeather,
    dailyForecast: DailyForecastItem[],
    airQuality: AirQualityResponse,
    preferences: UserPreferences
  ): PersonalizedInsights {
    const insights: PersonalizedInsights = {
      health: [],
      activities: [],
      clothing: [],
      travel: [],
      other: []
    };

    // Get current conditions
    const temp = Math.round(currentWeather.main.temp);
    const feelsLike = Math.round(currentWeather.main.feels_like);
    const humidity = currentWeather.main.humidity;
    const windSpeed = currentWeather.wind.speed;
    const condition = currentWeather.weather[0].main.toLowerCase();
    const description = currentWeather.weather[0].description;
    const aqi = airQuality.list[0].main.aqi;
    const pm25 = airQuality.list[0].components.pm2_5;

    // Health insights
    insights.health.push(...this.generateHealthInsights(temp, humidity, windSpeed, aqi, pm25));
    
    // Activity insights
    insights.activities.push(...this.generateActivityInsights(condition, temp, windSpeed, description));
    
    // Clothing insights
    insights.clothing.push(...this.generateClothingInsights(temp, condition, feelsLike));
    
    // Travel insights
    insights.travel.push(...this.generateTravelInsights(condition, temp, windSpeed, description));
    
    // Other insights
    insights.other.push(...this.generateOtherInsights(currentWeather, dailyForecast));

    return insights;
  }

  private generateHealthInsights(
    temp: number,
    humidity: number,
    windSpeed: number,
    aqi: number,
    pm25: number
  ): WeatherInsight[] {
    const insights: WeatherInsight[] = [];

    // Temperature-related health insights
    if (temp > 35) {
      insights.push({
        id: 'heat-alert',
        title: 'Extreme Heat Warning',
        description: 'Temperatures are dangerously high. Stay hydrated and avoid prolonged sun exposure.',
        severity: 'high',
        category: 'health',
        recommendation: 'Drink plenty of water, stay in air-conditioned spaces, and avoid outdoor activities during peak hours.',
        icon: '🌡️'
      });
    } else if (temp < 0) {
      insights.push({
        id: 'cold-alert',
        title: 'Extreme Cold Warning',
        description: 'Temperatures are dangerously low. Risk of hypothermia and frostbite.',
        severity: 'high',
        category: 'health',
        recommendation: 'Dress in multiple layers, cover exposed skin, and limit time outdoors.',
        icon: '❄️'
      });
    }

    // Humidity-related health insights
    if (humidity > 80) {
      insights.push({
        id: 'high-humidity',
        title: 'High Humidity',
        description: 'High humidity levels can make it harder for your body to cool itself.',
        severity: 'medium',
        category: 'health',
        recommendation: 'Stay hydrated and take breaks in cooler, drier environments.',
        icon: '💧'
      });
    }

    // Air quality insights
    if (aqi >= 4) {
      insights.push({
        id: 'poor-air-quality',
        title: 'Poor Air Quality',
        description: 'Air quality is poor. Sensitive individuals should avoid outdoor activities.',
        severity: 'high',
        category: 'health',
        recommendation: 'Limit outdoor activities, keep windows closed, and consider using an air purifier.',
        icon: '🌫️'
      });
    } else if (pm25 > 25) {
      insights.push({
        id: 'high-pm25',
        title: 'Elevated Particle Levels',
        description: 'Fine particle levels are elevated, which can affect respiratory health.',
        severity: 'medium',
        category: 'health',
        recommendation: 'Sensitive individuals should reduce outdoor exertion.',
        icon: '🔍'
      });
    }

    // Wind chill/heat index insights
    if (windSpeed > 10 && temp < 5) {
      insights.push({
        id: 'wind-chill',
        title: 'Wind Chill Factor',
        description: 'Strong winds combined with cold temperatures increase the risk of hypothermia.',
        severity: 'medium',
        category: 'health',
        recommendation: 'Wear windproof clothing and protect exposed skin.',
        icon: '💨'
      });
    }

    return insights;
  }

  private generateActivityInsights(
    condition: string,
    temp: number,
    windSpeed: number,
    description: string
  ): WeatherInsight[] {
    const insights: WeatherInsight[] = [];

    // Outdoor activity recommendations
    if (condition.includes('rain') || condition.includes('snow')) {
      insights.push({
        id: 'indoor-activities',
        title: 'Indoor Activities Recommended',
        description: 'Precipitation makes outdoor activities challenging.',
        severity: 'medium',
        category: 'activity',
        recommendation: 'Consider indoor alternatives like visiting a museum, library, or indoor sports facility.',
        icon: '🏠'
      });
    } else if (temp >= 18 && temp <= 28 && windSpeed < 8 && !condition.includes('thunderstorm')) {
      insights.push({
        id: 'outdoor-activities',
        title: 'Ideal for Outdoor Activities',
        description: 'Weather conditions are perfect for outdoor exercise and recreation.',
        severity: 'low',
        category: 'activity',
        recommendation: 'Take advantage of the pleasant weather for a walk, bike ride, or outdoor sports.',
        icon: '🌳'
      });
    }

    // Sports/activity specific insights
    if (windSpeed > 15) {
      insights.push({
        id: 'high-wind-activities',
        title: 'High Wind Conditions',
        description: 'Strong winds may affect outdoor activities like cycling, golf, or tennis.',
        severity: 'medium',
        category: 'activity',
        recommendation: 'Consider wind-resistant activities or postpone outdoor sports.',
        icon: '⛳'
      });
    }

    return insights;
  }

  private generateClothingInsights(
    temp: number,
    condition: string,
    feelsLike: number
  ): WeatherInsight[] {
    const insights: WeatherInsight[] = [];

    // Temperature-based clothing recommendations
    if (temp < 0) {
      insights.push({
        id: 'winter-clothing',
        title: 'Heavy Winter Attire',
        description: 'Extremely cold temperatures require maximum protection.',
        severity: 'high',
        category: 'clothing',
        recommendation: 'Wear multiple layers, insulated boots, gloves, hat, and scarf.',
        icon: '🧤'
      });
    } else if (temp < 10) {
      insights.push({
        id: 'cold-weather',
        title: 'Cold Weather Gear',
        description: 'Cold temperatures require warm clothing.',
        severity: 'medium',
        category: 'clothing',
        recommendation: 'Wear a warm coat, sweater, and consider thermal undergarments.',
        icon: '🧥'
      });
    } else if (temp < 20) {
      insights.push({
        id: 'layered-clothing',
        title: 'Layered Clothing',
        description: 'Cool to mild temperatures allow for layering options.',
        severity: 'low',
        category: 'clothing',
        recommendation: 'Wear layers that can be removed as temperatures change throughout the day.',
        icon: '👕'
      });
    } else if (temp < 30) {
      insights.push({
        id: 'light-clothing',
        title: 'Light Clothing',
        description: 'Warm temperatures call for breathable fabrics.',
        severity: 'low',
        category: 'clothing',
        recommendation: 'Choose lightweight, moisture-wicking materials and light colors.',
        icon: '👕'
      });
    } else {
      insights.push({
        id: 'hot-weather',
        title: 'Hot Weather Attire',
        description: 'High temperatures require cooling strategies.',
        severity: 'medium',
        category: 'clothing',
        recommendation: 'Wear loose, light-colored clothing and a wide-brimmed hat.',
        icon: '👕'
      });
    }

    // Condition-specific clothing insights
    if (condition.includes('rain')) {
      insights.push({
        id: 'rain-gear',
        title: 'Rain Protection',
        description: 'Precipitation requires waterproof clothing.',
        severity: 'medium',
        category: 'clothing',
        recommendation: 'Bring an umbrella, raincoat, and waterproof footwear.',
        icon: '☔'
      });
    }

    // Feels-like temperature insights
    const diff = Math.abs(temp - feelsLike);
    if (diff > 5) {
      insights.push({
        id: 'feels-like-diff',
        title: 'Temperature Perception',
        description: `Feels like ${feelsLike}°C due to wind and humidity.`,
        severity: 'low',
        category: 'clothing',
        recommendation: `Dress for ${feelsLike}°C rather than the actual temperature.`,
        icon: '🌡️'
      });
    }

    return insights;
  }

  private generateTravelInsights(
    condition: string,
    temp: number,
    windSpeed: number,
    description: string
  ): WeatherInsight[] {
    const insights: WeatherInsight[] = [];

    // Driving condition insights
    if (condition.includes('rain') && temp < 2) {
      insights.push({
        id: 'icy-roads',
        title: 'Icy Road Conditions',
        description: 'Rain combined with low temperatures may create icy roads.',
        severity: 'high',
        category: 'travel',
        recommendation: 'Drive slowly, increase following distance, and avoid sudden movements.',
        icon: '🚗'
      });
    } else if (condition.includes('snow')) {
      insights.push({
        id: 'snowy-roads',
        title: 'Snowy Road Conditions',
        description: 'Snowfall makes driving conditions hazardous.',
        severity: 'high',
        category: 'travel',
        recommendation: 'Use snow tires or chains, reduce speed, and allow extra travel time.',
        icon: '🚗'
      });
    } else if (condition.includes('fog')) {
      insights.push({
        id: 'low-visibility',
        title: 'Low Visibility',
        description: 'Fog reduces visibility and increases accident risk.',
        severity: 'high',
        category: 'travel',
        recommendation: 'Use low-beam headlights, reduce speed, and increase following distance.',
        icon: '🌫️'
      });
    }

    // Flight delay insights
    if (condition.includes('thunderstorm') || windSpeed > 20) {
      insights.push({
        id: 'flight-disruptions',
        title: 'Potential Flight Disruptions',
        description: 'Severe weather may cause flight delays or cancellations.',
        severity: 'medium',
        category: 'travel',
        recommendation: 'Check with your airline for updates and allow extra time at the airport.',
        icon: '✈️'
      });
    }

    return insights;
  }

  private generateOtherInsights(
    currentWeather: CurrentWeather,
    dailyForecast: DailyForecastItem[]
  ): WeatherInsight[] {
    const insights: WeatherInsight[] = [];

    // Energy usage insights
    const temp = Math.round(currentWeather.main.temp);
    if (temp > 25) {
      insights.push({
        id: 'high-ac-usage',
        title: 'Increased Energy Usage',
        description: 'Cooling needs are high during hot weather.',
        severity: 'low',
        category: 'energy',
        recommendation: 'Set thermostat to 78°F (26°C) to reduce energy costs.',
        icon: '⚡'
      });
    } else if (temp < 10) {
      insights.push({
        id: 'high-heating-usage',
        title: 'Increased Energy Usage',
        description: 'Heating needs are high during cold weather.',
        severity: 'low',
        category: 'energy',
        recommendation: 'Set thermostat to 68°F (20°C) to reduce energy costs.',
        icon: '🔥'
      });
    }

    // Gardening/Agriculture insights
    const precipitationToday = dailyForecast[0]?.rain || 0;
    if (precipitationToday > 5) {
      insights.push({
        id: 'garden-watering',
        title: 'Natural Garden Watering',
        description: 'Sufficient rainfall reduces the need for manual watering.',
        severity: 'low',
        category: 'agriculture',
        recommendation: 'Skip watering your garden today to conserve water.',
        icon: '🌱'
      });
    }

    // UV index insights (simulated)
    const uvIndex = 5; // In a real implementation, this would come from an API
    if (uvIndex > 7) {
      insights.push({
        id: 'high-uv',
        title: 'High UV Index',
        description: 'UV radiation is high. Risk of sunburn and skin damage.',
        severity: 'medium',
        category: 'health',
        recommendation: 'Apply SPF 30+ sunscreen, wear a hat, and seek shade during peak hours.',
        icon: '☀️'
      });
    }

    return insights;
  }

  // Generate daily summary insights
  generateDailySummary(
    currentWeather: CurrentWeather,
    dailyForecast: DailyForecastItem[],
    airQuality: AirQualityResponse
  ): string {
    const temp = Math.round(currentWeather.main.temp);
    const condition = currentWeather.weather[0].description;
    const high = Math.round(dailyForecast[0]?.temp.max || temp);
    const low = Math.round(dailyForecast[0]?.temp.min || temp);
    const aqi = airQuality.list[0].main.aqi;

    let summary = `Today's weather: ${condition} with temperatures ranging from ${low}° to ${high}°. `;

    if (aqi >= 4) {
      summary += 'Air quality is poor, limiting outdoor activities. ';
    } else if (aqi === 3) {
      summary += 'Air quality is moderate, sensitive individuals should take precautions. ';
    }

    if (temp > 30) {
      summary += 'It\'s quite hot today, stay hydrated. ';
    } else if (temp < 5) {
      summary += 'It\'s quite cold today, dress warmly. ';
    }

    if (dailyForecast[0]?.rain && dailyForecast[0].rain > 5) {
      summary += 'Expect significant rainfall. ';
    }

    return summary.trim();
  }

  // Generate weekly trend insights
  generateWeeklyTrends(dailyForecast: DailyForecastItem[]): string[] {
    const trends: string[] = [];
    
    if (dailyForecast.length < 7) return trends;

    // Temperature trend
    const temps = dailyForecast.slice(0, 7).map(day => day.temp.max);
    const avgTemp = temps.reduce((sum, temp) => sum + temp, 0) / temps.length;
    const maxTemp = Math.max(...temps);
    const minTemp = Math.min(...temps);

    if (maxTemp - minTemp > 15) {
      trends.push('Expect significant temperature swings this week.');
    }

    if (avgTemp > 25) {
      trends.push('This week will be warmer than average.');
    } else if (avgTemp < 10) {
      trends.push('This week will be cooler than average.');
    }

    // Precipitation trend
    const rainyDays = dailyForecast.slice(0, 7).filter(day => (day.rain || 0) > 2).length;
    if (rainyDays >= 4) {
      trends.push('Above average rainfall expected this week.');
    } else if (rainyDays === 0) {
      trends.push('Drier than average conditions expected this week.');
    }

    return trends;
  }
}

// Singleton instance
export const weatherInsightsService = new WeatherInsightsService();
export default weatherInsightsService;