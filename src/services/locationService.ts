import { GeocodingResult } from '../types/weather';
import { WeatherApiService } from './weatherApi';

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export class LocationService {
  
  /**
   * Get user's current location using browser geolocation API
   */
  static async getCurrentLocation(): Promise<LocationCoords> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000, // Cache for 10 minutes
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          let errorMessage = 'Unknown error occurred';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          
          reject(new Error(errorMessage));
        },
        options
      );
    });
  }

  /**
   * Check if geolocation is available
   */
  static isGeolocationAvailable(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Get city suggestions based on search query
   */
  static async getCitySuggestions(query: string): Promise<GeocodingResult[]> {
    if (query.length < 2) {
      return [];
    }

    try {
      const apiResponse = await WeatherApiService.searchCities(query, 10); // Increase limit to 10
      return apiResponse.success ? (apiResponse.data || []) : [];
    } catch (error) {
      console.error('Error getting city suggestions:', error);
      return [];
    }
  }

  /**
   * Get location name by coordinates
   */
  static async getLocationName(lat: number, lon: number): Promise<string> {
    try {
      const results = await WeatherApiService.getLocationByCoords(lat, lon);
      if (results.length > 0) {
        const location = results[0];
        return location.state 
          ? `${location.name}, ${location.state}, ${location.country}`
          : `${location.name}, ${location.country}`;
      }
      return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
    } catch (error) {
      console.error('Error getting location name:', error);
      return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
    }
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.degToRad(lat2 - lat1);
    const dLon = this.degToRad(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degToRad(lat1)) *
        Math.cos(this.degToRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance);
  }

  /**
   * Convert degrees to radians
   */
  private static degToRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Get popular cities for quick access
   */
  static getPopularCities(): Array<{
    name: string;
    country: string;
    lat: number;
    lon: number;
  }> {
    return [
      { name: 'New York', country: 'US', lat: 40.7128, lon: -74.0060 },
      { name: 'London', country: 'GB', lat: 51.5074, lon: -0.1278 },
      { name: 'Tokyo', country: 'JP', lat: 35.6762, lon: 139.6503 },
      { name: 'Paris', country: 'FR', lat: 48.8566, lon: 2.3522 },
      { name: 'Sydney', country: 'AU', lat: -33.8688, lon: 151.2093 },
      { name: 'Mumbai', country: 'IN', lat: 19.0760, lon: 72.8777 },
      { name: 'Dubai', country: 'AE', lat: 25.2048, lon: 55.2708 },
      { name: 'Singapore', country: 'SG', lat: 1.3521, lon: 103.8198 },
      { name: 'São Paulo', country: 'BR', lat: -23.5558, lon: -46.6396 },
      { name: 'Berlin', country: 'DE', lat: 52.5200, lon: 13.4050 },
      { name: 'Beijing', country: 'CN', lat: 39.9042, lon: 116.4074 },
      { name: 'Cairo', country: 'EG', lat: 30.0444, lon: 31.2357 },
    ];
  }

  /**
   * Format coordinates for display
   */
  static formatCoordinates(lat: number, lon: number): string {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';
    
    return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lon).toFixed(4)}°${lonDir}`;
  }
  
  /**
   * Search for cities by name with enhanced matching
   */
  static async searchCitiesByName(name: string): Promise<GeocodingResult[]> {
    if (name.length < 2) {
      return [];
    }
    
    try {
      const apiResponse = await WeatherApiService.searchCities(name, 15);
      return apiResponse.success ? (apiResponse.data || []) : [];
    } catch (error) {
      console.error('Error searching cities by name:', error);
      return [];
    }
  }
  
  /**
   * Search for cities by country
   */
  static async searchCitiesByCountry(countryCode: string): Promise<GeocodingResult[]> {
    try {
      // This would typically be implemented with a more specific API call
      // For now, we'll use the general search with country code
      const apiResponse = await WeatherApiService.searchCities(countryCode, 15);
      return apiResponse.success ? (apiResponse.data || []) : [];
    } catch (error) {
      console.error('Error searching cities by country:', error);
      return [];
    }
  }
  
  /**
   * Get all major cities worldwide
   */
  static async getAllCities(): Promise<GeocodingResult[]> {
    try {
      return await WeatherApiService.getAllMajorCities();
    } catch (error) {
      console.error('Error getting all cities:', error);
      return [];
    }
  }
  
  /**
   * Advanced city search with multiple criteria
   */
  static async advancedCitySearch(
    name: string,
    country?: string,
    state?: string,
    limit: number = 20
  ): Promise<GeocodingResult[]> {
    try {
      let query = name;
      if (country) {
        query += `,${country}`;
      }
      if (state) {
        query += `,${state}`;
      }
      
      const apiResponse = await WeatherApiService.searchCities(query, limit);
      return apiResponse.success ? (apiResponse.data || []) : [];
    } catch (error) {
      console.error('Error in advanced city search:', error);
      return [];
    }
  }
  
  /**
   * Search for all cities in a specific country
   */
  static async searchAllCitiesInCountry(countryCode: string, limit: number = 100): Promise<GeocodingResult[]> {
    try {
      const apiResponse = await WeatherApiService.searchAllCitiesInCountry(countryCode, limit);
      return apiResponse.success ? (apiResponse.data || []) : [];
    } catch (error) {
      console.error('Error searching all cities in country:', error);
      return [];
    }
  }
  
  /**
   * Search for cities in a specific state/province/region
   */
  static async searchCitiesInState(countryCode: string, stateName: string, limit: number = 50): Promise<GeocodingResult[]> {
    try {
      const apiResponse = await WeatherApiService.searchCitiesInState(countryCode, stateName, limit);
      return apiResponse.success ? (apiResponse.data || []) : [];
    } catch (error) {
      console.error('Error searching cities in state:', error);
      return [];
    }
  }
  
  /**
   * Get comprehensive global city data
   */
  static async getGlobalCitiesData(): Promise<GeocodingResult[]> {
    try {
      const apiResponse = await WeatherApiService.getGlobalCitiesData();
      return apiResponse.success ? (apiResponse.data || []) : [];
    } catch (error) {
      console.error('Error getting global cities data:', error);
      return [];
    }
  }
  
  /**
   * Get cities by continent
   */
  static async getCitiesByContinent(continent: string, limit: number = 50): Promise<GeocodingResult[]> {
    // Continent to country code mapping
    const continentCountries: Record<string, string[]> = {
      'North America': ['US', 'CA', 'MX', 'GT', 'SV', 'HN', 'NI', 'CR', 'PA'],
      'South America': ['BR', 'AR', 'PE', 'CO', 'VE', 'CL', 'EC', 'BO', 'PY', 'UY', 'GY', 'SR', 'GF'],
      'Europe': ['GB', 'FR', 'DE', 'IT', 'ES', 'RU', 'SE', 'NO', 'DK', 'FI', 'NL', 'BE', 'AT', 'CH', 'GR', 'PT', 'CZ', 'PL', 'HU'],
      'Asia': ['JP', 'CN', 'IN', 'KR', 'SG', 'AE', 'TH', 'MY', 'ID', 'PH', 'VN', 'IL', 'TR', 'IR', 'HK', 'TW', 'SA'],
      'Africa': ['EG', 'NG', 'ZA', 'KE', 'MA', 'DZ', 'GH', 'ET', 'TZ', 'UG', 'ZW', 'ZM'],
      'Oceania': ['AU', 'NZ', 'FJ', 'PG', 'NC', 'SB', 'VU', 'WS', 'TO', 'TV', 'NR', 'KI', 'FM', 'MH'],
      'Middle East': ['AE', 'SA', 'IL', 'TR', 'IR', 'IQ', 'JO', 'LB', 'SY', 'YE', 'OM', 'QA', 'KW', 'BH']
    };
    
    try {
      const countryCodes = continentCountries[continent] || [];
      let allCities: GeocodingResult[] = [];
      
      // Get cities for each country in the continent
      for (const countryCode of countryCodes) {
        const cities = await this.searchAllCitiesInCountry(countryCode, Math.ceil(limit / countryCodes.length));
        allCities = [...allCities, ...cities];
        
        // If we have enough cities, break
        if (allCities.length >= limit) {
          break;
        }
      }
      
      // Return limited results
      return allCities.slice(0, limit);
    } catch (error) {
      console.error('Error getting cities by continent:', error);
      return [];
    }
  }
  
  /**
   * Search for cities with comprehensive global coverage
   */
  static async searchCitiesWithGlobalCoverage(
    query: string,
    options: {
      continent?: string;
      country?: string;
      limit?: number;
    } = {}
  ): Promise<GeocodingResult[]> {
    const { continent, country, limit = 30 } = options;
    
    try {
      // If we have specific filters, use them
      if (country) {
        return await this.searchAllCitiesInCountry(country, limit);
      }
      
      if (continent) {
        return await this.getCitiesByContinent(continent, limit);
      }
      
      // Otherwise, search globally
      return await this.searchCitiesByName(query);
    } catch (error) {
      console.error('Error in global city search:', error);
      return [];
    }
  }
  
  /**
   * Get all cities in a region (country, state, or continent)
   */
  static async getAllCitiesInRegion(
    regionType: 'country' | 'state' | 'continent',
    regionCode: string,
    limit: number = 100
  ): Promise<GeocodingResult[]> {
    try {
      switch (regionType) {
        case 'country':
          return await this.searchAllCitiesInCountry(regionCode, limit);
        case 'state':
          // For state, we need country code and state name
          const [countryCode, stateName] = regionCode.split(':');
          if (countryCode && stateName) {
            return await this.searchCitiesInState(countryCode, stateName, limit);
          }
          return [];
        case 'continent':
          return await this.getCitiesByContinent(regionCode, limit);
        default:
          return [];
      }
    } catch (error) {
      console.error(`Error getting all cities in ${regionType}:`, error);
      return [];
    }
  }
  
  /**
   * Get nearby cities within a radius
   */
  static async getNearbyCities(
    lat: number,
    lon: number,
    radiusKm: number = 50,
    limit: number = 20
  ): Promise<GeocodingResult[]> {
    try {
      // First get all cities (this would be optimized in a real implementation)
      const allCities = await this.getGlobalCitiesData();
      
      // Filter cities within radius
      const nearbyCities = allCities
        .filter(city => this.calculateDistance(lat, lon, city.lat, city.lon) <= radiusKm)
        .sort((a, b) => {
          const distA = this.calculateDistance(lat, lon, a.lat, a.lon);
          const distB = this.calculateDistance(lat, lon, b.lat, b.lon);
          return distA - distB;
        })
        .slice(0, limit);
      
      return nearbyCities;
    } catch (error) {
      console.error('Error getting nearby cities:', error);
      return [];
    }
  }
}