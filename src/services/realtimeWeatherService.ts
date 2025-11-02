import { CurrentWeather } from '../types/weather';

class RealtimeWeatherService {
  private eventSource: EventSource | null = null;
  private listeners: Array<(weather: CurrentWeather) => void> = [];
  private location: { lat: number; lon: number } | null = null;
  private updateInterval: number = 60000; // 1 minute default
  private intervalId: NodeJS.Timeout | null = null;

  // Connect to real-time weather updates
  connect(lat: number, lon: number, updateInterval: number = 60000): void {
    this.location = { lat, lon };
    this.updateInterval = updateInterval;
    
    // Close existing connection if any
    this.disconnect();
    
    // Set up periodic updates using setInterval as fallback
    this.startPeriodicUpdates();
    
    // Try to use Server-Sent Events if available
    if (typeof EventSource !== 'undefined') {
      this.setupEventSource();
    }
  }

  // Set up Server-Sent Events connection
  private setupEventSource(): void {
    if (!this.location) return;
    
    try {
      // In a real implementation, this would connect to a real-time weather API
      // For now, we'll simulate it with periodic updates
      console.log('Setting up real-time weather updates for:', this.location);
    } catch (error) {
      console.error('Failed to set up EventSource:', error);
      // Fall back to periodic updates
      this.startPeriodicUpdates();
    }
  }

  // Start periodic updates as fallback
  private startPeriodicUpdates(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    this.intervalId = setInterval(() => {
      this.fetchWeatherData();
    }, this.updateInterval);
  }

  // Fetch weather data from API
  private async fetchWeatherData(): Promise<void> {
    if (!this.location) return;
    
    try {
      // In a real implementation, this would fetch from a real-time weather API
      // For simulation purposes, we'll generate mock data
      const mockWeather = this.generateMockWeather();
      this.notifyListeners(mockWeather);
    } catch (error) {
      console.error('Error fetching real-time weather data:', error);
    }
  }

  // Generate mock weather data for simulation
  private generateMockWeather(): CurrentWeather {
    if (!this.location) {
      // Return a default weather object if no location is set
      return {
        coord: { lon: 0, lat: 0 },
        weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
        base: 'stations',
        main: {
          temp: 20,
          feels_like: 20,
          temp_min: 18,
          temp_max: 22,
          pressure: 1013,
          humidity: 60
        },
        visibility: 10000,
        wind: { speed: 3, deg: 180 },
        clouds: { all: 0 },
        dt: Math.floor(Date.now() / 1000),
        sys: {
          type: 1,
          id: 1234,
          country: 'US',
          sunrise: Math.floor(Date.now() / 1000) - 3600,
          sunset: Math.floor(Date.now() / 1000) + 3600
        },
        timezone: -14400,
        id: 5128581,
        name: 'New York',
        cod: 200
      };
    }

    // Generate realistic mock weather data based on location and time
    const now = Math.floor(Date.now() / 1000);
    const temp = 15 + Math.random() * 15; // 15-30°C
    const humidity = 40 + Math.random() * 40; // 40-80%
    const pressure = 1000 + Math.random() * 20; // 1000-1020 hPa
    
    return {
      coord: { lon: this.location.lon, lat: this.location.lat },
      weather: [
        {
          id: 800,
          main: 'Clear',
          description: 'clear sky',
          icon: '01d'
        }
      ],
      base: 'stations',
      main: {
        temp: temp,
        feels_like: temp + (Math.random() * 4 - 2), // ±2°C
        temp_min: temp - (Math.random() * 3),
        temp_max: temp + (Math.random() * 3),
        pressure: pressure,
        humidity: humidity
      },
      visibility: 10000,
      wind: {
        speed: Math.random() * 10, // 0-10 m/s
        deg: Math.random() * 360 // 0-360 degrees
      },
      clouds: {
        all: Math.random() * 40 // 0-40% cloud cover
      },
      dt: now,
      sys: {
        type: 1,
        id: Math.floor(Math.random() * 10000),
        country: 'US',
        sunrise: now - 3600 * 6, // 6 hours ago
        sunset: now + 3600 * 6   // 6 hours from now
      },
      timezone: -14400,
      id: Math.floor(Math.random() * 1000000),
      name: 'Mock Location',
      cod: 200
    };
  }

  // Add listener for weather updates
  addListener(callback: (weather: CurrentWeather) => void): void {
    this.listeners.push(callback);
  }

  // Remove listener
  removeListener(callback: (weather: CurrentWeather) => void): void {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  // Notify all listeners of weather update
  private notifyListeners(weather: CurrentWeather): void {
    this.listeners.forEach(callback => {
      try {
        callback(weather);
      } catch (error) {
        console.error('Error notifying weather listener:', error);
      }
    });
  }

  // Disconnect from real-time updates
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.listeners = [];
  }

  // Check if connected to real-time updates
  isConnected(): boolean {
    return this.eventSource !== null || this.intervalId !== null;
  }

  // Update location for real-time updates
  updateLocation(lat: number, lon: number): void {
    this.location = { lat, lon };
    if (this.isConnected()) {
      this.disconnect();
      this.connect(lat, lon, this.updateInterval);
    }
  }

  // Update interval for periodic updates
  updateIntervalTime(interval: number): void {
    this.updateInterval = interval;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.startPeriodicUpdates();
    }
  }
}

// Singleton instance
export const realtimeWeatherService = new RealtimeWeatherService();
export default realtimeWeatherService;