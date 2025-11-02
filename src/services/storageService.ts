import { SavedCity } from '../types/weather';

const FAVORITES_KEY = 'clima-now-favorites';
const SETTINGS_KEY = 'clima-now-settings';

export interface AppSettings {
  temperatureUnit: 'celsius' | 'fahrenheit';
  windSpeedUnit: 'kmh' | 'mph';
  timeFormat: '12h' | '24h';
  notifications: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export class StorageService {
  
  /**
   * Get all saved cities from localStorage
   */
  static getFavoriteCities(): SavedCity[] {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    } catch (error) {
      console.error('Error loading favorite cities:', error);
      return [];
    }
  }

  /**
   * Save a city to favorites
   */
  static saveFavoriteCity(city: Omit<SavedCity, 'id' | 'addedAt'>): SavedCity {
    try {
      const favorites = this.getFavoriteCities();
      
      // Check if city already exists
      const existingCity = favorites.find(
        (fav) => fav.lat === city.lat && fav.lon === city.lon
      );
      
      if (existingCity) {
        return existingCity;
      }

      // Create new saved city
      const newCity: SavedCity = {
        id: this.generateId(),
        ...city,
        addedAt: new Date().toISOString(),
      };

      favorites.push(newCity);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      
      return newCity;
    } catch (error) {
      console.error('Error saving favorite city:', error);
      throw new Error('Failed to save city to favorites');
    }
  }

  /**
   * Remove a city from favorites
   */
  static removeFavoriteCity(cityId: string): boolean {
    try {
      const favorites = this.getFavoriteCities();
      const filtered = favorites.filter((city) => city.id !== cityId);
      
      if (filtered.length === favorites.length) {
        return false; // City not found
      }
      
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error removing favorite city:', error);
      return false;
    }
  }

  /**
   * Check if a city is in favorites
   */
  static isFavoriteCity(lat: number, lon: number): boolean {
    try {
      const favorites = this.getFavoriteCities();
      return favorites.some(
        (city) => Math.abs(city.lat - lat) < 0.01 && Math.abs(city.lon - lon) < 0.01
      );
    } catch (error) {
      console.error('Error checking favorite city:', error);
      return false;
    }
  }

  /**
   * Update favorite city order
   */
  static reorderFavoriteCities(orderedIds: string[]): boolean {
    try {
      const favorites = this.getFavoriteCities();
      const reordered: SavedCity[] = [];
      
      // Add cities in the new order
      orderedIds.forEach((id) => {
        const city = favorites.find((fav) => fav.id === id);
        if (city) {
          reordered.push(city);
        }
      });
      
      // Add any missing cities at the end
      favorites.forEach((city) => {
        if (!orderedIds.includes(city.id)) {
          reordered.push(city);
        }
      });
      
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(reordered));
      return true;
    } catch (error) {
      console.error('Error reordering favorite cities:', error);
      return false;
    }
  }

  /**
   * Get app settings
   */
  static getSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        return { ...this.getDefaultSettings(), ...JSON.parse(stored) };
      }
      return this.getDefaultSettings();
    } catch (error) {
      console.error('Error loading settings:', error);
      return this.getDefaultSettings();
    }
  }

  /**
   * Save app settings
   */
  static saveSettings(settings: Partial<AppSettings>): boolean {
    try {
      const currentSettings = this.getSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  }

  /**
   * Get default settings
   */
  private static getDefaultSettings(): AppSettings {
    return {
      temperatureUnit: 'celsius',
      windSpeedUnit: 'kmh',
      timeFormat: '24h',
      notifications: false,
      theme: 'auto',
    };
  }

  /**
   * Clear all saved data
   */
  static clearAllData(): boolean {
    try {
      localStorage.removeItem(FAVORITES_KEY);
      localStorage.removeItem(SETTINGS_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }

  /**
   * Get storage usage information
   */
  static getStorageInfo(): {
    used: number;
    available: number;
    total: number;
    percentage: number;
  } {
    try {
      let used = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key) && key.startsWith('clima-now-')) {
          used += localStorage[key].length;
        }
      }

      // Estimate available storage (most browsers allow ~5-10MB)
      const estimated = 5 * 1024 * 1024; // 5MB in bytes
      const available = Math.max(0, estimated - used);
      const percentage = (used / estimated) * 100;

      return {
        used,
        available,
        total: estimated,
        percentage: Math.min(100, percentage),
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return {
        used: 0,
        available: 0,
        total: 0,
        percentage: 0,
      };
    }
  }

  /**
   * Export favorite cities as JSON
   */
  static exportFavorites(): string {
    try {
      const favorites = this.getFavoriteCities();
      const settings = this.getSettings();
      
      const exportData = {
        favorites,
        settings,
        exportedAt: new Date().toISOString(),
        version: '1.0',
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting favorites:', error);
      throw new Error('Failed to export favorites');
    }
  }

  /**
   * Import favorite cities from JSON
   */
  static importFavorites(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.favorites && Array.isArray(data.favorites)) {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(data.favorites));
      }
      
      if (data.settings && typeof data.settings === 'object') {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings));
      }
      
      return true;
    } catch (error) {
      console.error('Error importing favorites:', error);
      return false;
    }
  }

  /**
   * Generate unique ID
   */
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
