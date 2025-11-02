import { CurrentWeather, ForecastResponse, GeocodingResult } from '../types/weather';

// Demo weather data for testing - Expanded list of cities worldwide
export const DEMO_CITIES: GeocodingResult[] = [
  // North America - United States
  { name: 'New York', lat: 40.7128, lon: -74.0060, country: 'US', state: 'NY' },
  { name: 'Los Angeles', lat: 34.0522, lon: -118.2437, country: 'US', state: 'CA' },
  { name: 'Chicago', lat: 41.8781, lon: -87.6298, country: 'US', state: 'IL' },
  { name: 'Houston', lat: 29.7604, lon: -95.3698, country: 'US', state: 'TX' },
  { name: 'Phoenix', lat: 33.4484, lon: -112.0740, country: 'US', state: 'AZ' },
  { name: 'Philadelphia', lat: 39.9526, lon: -75.1652, country: 'US', state: 'PA' },
  { name: 'San Antonio', lat: 29.4241, lon: -98.4936, country: 'US', state: 'TX' },
  { name: 'San Diego', lat: 32.7157, lon: -117.1611, country: 'US', state: 'CA' },
  { name: 'Dallas', lat: 32.7767, lon: -96.7970, country: 'US', state: 'TX' },
  { name: 'San Jose', lat: 37.3382, lon: -121.8863, country: 'US', state: 'CA' },
  
  // North America - Canada
  { name: 'Toronto', lat: 43.6532, lon: -79.3832, country: 'CA', state: 'ON' },
  { name: 'Montreal', lat: 45.5017, lon: -73.5673, country: 'CA', state: 'QC' },
  { name: 'Vancouver', lat: 49.2827, lon: -123.1207, country: 'CA', state: 'BC' },
  { name: 'Calgary', lat: 51.0447, lon: -114.0619, country: 'CA', state: 'AB' },
  { name: 'Edmonton', lat: 53.5444, lon: -113.4909, country: 'CA', state: 'AB' },
  
  // North America - Mexico
  { name: 'Mexico City', lat: 19.4326, lon: -99.1332, country: 'MX', state: 'CDMX' },
  { name: 'Guadalajara', lat: 20.6597, lon: -103.3496, country: 'MX', state: 'Jalisco' },
  { name: 'Monterrey', lat: 25.6866, lon: -100.3161, country: 'MX', state: 'Nuevo León' },
  { name: 'Puebla', lat: 19.0414, lon: -98.2063, country: 'MX', state: 'Puebla' },
  { name: 'Tijuana', lat: 32.5149, lon: -117.0382, country: 'MX', state: 'Baja California' },
  
  // Central America
  { name: 'San Salvador', lat: 13.6929, lon: -89.2182, country: 'SV', state: 'San Salvador' },
  { name: 'Guatemala City', lat: 14.6349, lon: -90.5069, country: 'GT', state: 'Guatemala' },
  { name: 'San Jose', lat: 9.9281, lon: -84.0907, country: 'CR', state: 'San José' },
  { name: 'Panama City', lat: 8.9833, lon: -79.5167, country: 'PA', state: 'Panamá' },
  { name: 'Tegucigalpa', lat: 14.0723, lon: -87.1921, country: 'HN', state: 'Francisco Morazán' },
  
  // South America
  { name: 'São Paulo', lat: -23.5558, lon: -46.6396, country: 'BR', state: 'SP' },
  { name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729, country: 'BR', state: 'RJ' },
  { name: 'Buenos Aires', lat: -34.6037, lon: -58.3816, country: 'AR', state: 'BA' },
  { name: 'Lima', lat: -12.0464, lon: -77.0428, country: 'PE', state: 'Lima' },
  { name: 'Bogotá', lat: 4.7110, lon: -74.0721, country: 'CO', state: 'Cundinamarca' },
  { name: 'Santiago', lat: -33.4489, lon: -70.6693, country: 'CL', state: 'RM' },
  { name: 'Caracas', lat: 10.4806, lon: -66.9036, country: 'VE', state: 'Distrito Capital' },
  { name: 'Quito', lat: -0.1807, lon: -78.4678, country: 'EC', state: 'Pichincha' },
  { name: 'La Paz', lat: -16.4897, lon: -68.1193, country: 'BO', state: 'La Paz' },
  { name: 'Montevideo', lat: -34.9011, lon: -56.1645, country: 'UY', state: 'Montevideo' },
  
  // Europe - Western Europe
  { name: 'London', lat: 51.5074, lon: -0.1278, country: 'GB', state: 'England' },
  { name: 'Paris', lat: 48.8566, lon: 2.3522, country: 'FR', state: 'Île-de-France' },
  { name: 'Berlin', lat: 52.5200, lon: 13.4050, country: 'DE', state: 'Berlin' },
  { name: 'Madrid', lat: 40.4168, lon: -3.7038, country: 'ES', state: 'Madrid' },
  { name: 'Rome', lat: 41.9028, lon: 12.4964, country: 'IT', state: 'Lazio' },
  { name: 'Amsterdam', lat: 52.3676, lon: 4.9041, country: 'NL', state: 'North Holland' },
  { name: 'Brussels', lat: 50.8503, lon: 4.3517, country: 'BE', state: 'Brussels' },
  { name: 'Vienna', lat: 48.2082, lon: 16.3738, country: 'AT', state: 'Vienna' },
  { name: 'Zurich', lat: 47.3769, lon: 8.5417, country: 'CH', state: 'Zurich' },
  
  // Europe - Northern Europe
  { name: 'Moscow', lat: 55.7558, lon: 37.6173, country: 'RU', state: 'Moscow' },
  { name: 'Stockholm', lat: 59.3293, lon: 18.0686, country: 'SE', state: 'Stockholm' },
  { name: 'Oslo', lat: 59.9139, lon: 10.7522, country: 'NO', state: 'Oslo' },
  { name: 'Copenhagen', lat: 55.6761, lon: 12.5683, country: 'DK', state: 'Capital Region' },
  { name: 'Helsinki', lat: 60.1699, lon: 24.9384, country: 'FI', state: 'Uusimaa' },
  
  // Europe - Southern Europe
  { name: 'Athens', lat: 37.9838, lon: 23.7275, country: 'GR', state: 'Attica' },
  { name: 'Lisbon', lat: 38.7223, lon: -9.1393, country: 'PT', state: 'Lisbon' },
  { name: 'Prague', lat: 50.0755, lon: 14.4378, country: 'CZ', state: 'Prague' },
  { name: 'Warsaw', lat: 52.2297, lon: 21.0122, country: 'PL', state: 'Masovian' },
  { name: 'Budapest', lat: 47.4979, lon: 19.0402, country: 'HU', state: 'Budapest' },
  
  // Asia - East Asia
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503, country: 'JP', state: 'Tokyo' },
  { name: 'Beijing', lat: 39.9042, lon: 116.4074, country: 'CN', state: 'Beijing' },
  { name: 'Shanghai', lat: 31.2304, lon: 121.4737, country: 'CN', state: 'Shanghai' },
  { name: 'Seoul', lat: 37.5665, lon: 126.9780, country: 'KR', state: 'Seoul' },
  { name: 'Hong Kong', lat: 22.3193, lon: 114.1694, country: 'HK', state: '' },
  { name: 'Taipei', lat: 25.0330, lon: 121.5654, country: 'TW', state: 'Taipei' },
  
  // Asia - South Asia
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777, country: 'IN', state: 'Maharashtra' },
  { name: 'Thane', lat: 19.2183, lon: 72.9788, country: 'IN', state: 'Maharashtra' },
  { name: 'Delhi', lat: 28.6139, lon: 77.2090, country: 'IN', state: 'Delhi' },
  { name: 'Bangalore', lat: 12.9716, lon: 77.5946, country: 'IN', state: 'Karnataka' },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639, country: 'IN', state: 'West Bengal' },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707, country: 'IN', state: 'Tamil Nadu' },
  { name: 'Dhaka', lat: 23.8103, lon: 90.4125, country: 'BD', state: 'Dhaka' },
  { name: 'Karachi', lat: 24.8607, lon: 67.0011, country: 'PK', state: 'Sindh' },
  
  // Asia - Southeast Asia
  { name: 'Singapore', lat: 1.3521, lon: 103.8198, country: 'SG', state: '' },
  { name: 'Bangkok', lat: 13.7563, lon: 100.5018, country: 'TH', state: 'Bangkok' },
  { name: 'Kuala Lumpur', lat: 3.1390, lon: 101.6869, country: 'MY', state: 'Kuala Lumpur' },
  { name: 'Jakarta', lat: -6.2088, lon: 106.8456, country: 'ID', state: 'Jakarta' },
  { name: 'Manila', lat: 14.5995, lon: 120.9842, country: 'PH', state: 'Metro Manila' },
  { name: 'Hanoi', lat: 21.0285, lon: 105.8542, country: 'VN', state: 'Hanoi' },
  
  // Asia - Middle East
  { name: 'Dubai', lat: 25.2048, lon: 55.2708, country: 'AE', state: 'Dubai' },
  { name: 'Tel Aviv', lat: 32.0853, lon: 34.7818, country: 'IL', state: 'Tel Aviv' },
  { name: 'Istanbul', lat: 41.0082, lon: 28.9784, country: 'TR', state: 'Istanbul' },
  { name: 'Riyadh', lat: 24.7136, lon: 46.6753, country: 'SA', state: 'Riyadh' },
  { name: 'Tehran', lat: 35.6892, lon: 51.3890, country: 'IR', state: 'Tehran' },
  
  // Africa
  { name: 'Cairo', lat: 30.0444, lon: 31.2357, country: 'EG', state: 'Cairo' },
  { name: 'Lagos', lat: 6.5244, lon: 3.3792, country: 'NG', state: 'Lagos' },
  { name: 'Johannesburg', lat: -26.2041, lon: 28.0473, country: 'ZA', state: 'Gauteng' },
  { name: 'Nairobi', lat: -1.2921, lon: 36.8219, country: 'KE', state: 'Nairobi' },
  { name: 'Casablanca', lat: 33.5731, lon: -7.5898, country: 'MA', state: 'Casablanca' },
  { name: 'Algiers', lat: 36.7538, lon: 3.0588, country: 'DZ', state: 'Algiers' },
  { name: 'Accra', lat: 5.6037, lon: -0.1870, country: 'GH', state: 'Greater Accra' },
  { name: 'Addis Ababa', lat: 9.0300, lon: 38.7400, country: 'ET', state: 'Addis Ababa' },
  { name: 'Cape Town', lat: -33.9249, lon: 18.4241, country: 'ZA', state: 'Western Cape' },
  
  // Oceania
  { name: 'Sydney', lat: -33.8688, lon: 151.2093, country: 'AU', state: 'NSW' },
  { name: 'Melbourne', lat: -37.8136, lon: 144.9631, country: 'AU', state: 'VIC' },
  { name: 'Auckland', lat: -36.8485, lon: 174.7633, country: 'NZ', state: 'Auckland' },
  { name: 'Brisbane', lat: -27.4698, lon: 153.0251, country: 'AU', state: 'QLD' },
  { name: 'Perth', lat: -31.9505, lon: 115.8605, country: 'AU', state: 'WA' },
  { name: 'Adelaide', lat: -34.9285, lon: 138.6007, country: 'AU', state: 'SA' },
];

const WEATHER_CONDITIONS = [
  { id: 800, main: 'Clear', description: 'clear sky', icon: '01d' },
  { id: 803, main: 'Clouds', description: 'scattered clouds', icon: '03d' },
  { id: 500, main: 'Rain', description: 'light rain', icon: '10d' },
  { id: 600, main: 'Snow', description: 'light snow', icon: '13d' },
  { id: 200, main: 'Thunderstorm', description: 'thunderstorm with light rain', icon: '11d' },
];

const generateDemoWeather = (cityName: string, country: string, lat: number, lon: number): CurrentWeather => {
  const now = Math.floor(Date.now() / 1000);
  const condition = WEATHER_CONDITIONS[Math.floor(Math.random() * WEATHER_CONDITIONS.length)];
  const temp = Math.round(Math.random() * 30 + 5); // 5-35°C
  
  return {
    coord: { lat, lon },
    weather: [condition],
    base: 'stations',
    main: {
      temp,
      feels_like: temp + Math.round(Math.random() * 4 - 2),
      temp_min: temp - Math.round(Math.random() * 5),
      temp_max: temp + Math.round(Math.random() * 5),
      pressure: Math.round(Math.random() * 50 + 1000), // 1000-1050 hPa
      humidity: Math.round(Math.random() * 40 + 40), // 40-80%
      sea_level: Math.round(Math.random() * 50 + 1000),
      grnd_level: Math.round(Math.random() * 50 + 1000)
    },
    visibility: Math.round(Math.random() * 5000 + 5000), // 5-10km
    wind: {
      speed: Math.round(Math.random() * 10 + 2), // 2-12 m/s
      deg: Math.round(Math.random() * 360),
      gust: Math.round(Math.random() * 15 + 5)
    },
    clouds: {
      all: Math.round(Math.random() * 100)
    },
    dt: now,
    sys: {
      type: 2,
      id: Math.round(Math.random() * 10000),
      country,
      sunrise: now - 3600 * 6, // 6 hours ago
      sunset: now + 3600 * 6   // 6 hours from now
    },
    timezone: 0,
    id: Math.round(Math.random() * 1000000),
    name: cityName,
    cod: 200
  };
};

export class DemoWeatherService {
  static async searchCities(query: string): Promise<GeocodingResult[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return DEMO_CITIES.filter(city => 
      city.name.toLowerCase().includes(query.toLowerCase()) ||
      city.country.toLowerCase().includes(query.toLowerCase()) ||
      (city.state && city.state.toLowerCase().includes(query.toLowerCase()))
    );
  }

  static async getAllCities(): Promise<GeocodingResult[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return DEMO_CITIES;
  }

  static async getCurrentWeatherByCoords(lat: number, lon: number): Promise<CurrentWeather> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find matching city or use a default
    const city = DEMO_CITIES.find(c => 
      Math.abs(c.lat - lat) < 0.1 && Math.abs(c.lon - lon) < 0.1
    ) || DEMO_CITIES[0];
    
    return generateDemoWeather(city.name, city.country, lat, lon);
  }

  static async getCurrentWeatherByCity(cityName: string): Promise<CurrentWeather> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const city = DEMO_CITIES.find(c => 
      c.name.toLowerCase() === cityName.toLowerCase()
    ) || DEMO_CITIES[0];
    
    return generateDemoWeather(city.name, city.country, city.lat, city.lon);
  }

  static getIconUrl(icon: string, size: string = '2x'): string {
    // Return a placeholder icon URL or you could use actual OpenWeatherMap icons
    return `https://openweathermap.org/img/wn/${icon}@${size}.png`;
  }

  static getWindDirection(degrees: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }
}

// Mock geolocation for demo
export const mockGeolocation = () => {
  // Default to New York coordinates for demo
  return {
    latitude: 40.7128,
    longitude: -74.0060
  };
};