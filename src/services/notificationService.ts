import { WeatherNotification, WeatherAlert, CurrentWeather, UserPreferences } from '../types/weather';

class NotificationService {
  private notifications: WeatherNotification[] = [];
  private notificationPermission: NotificationPermission = 'default';

  constructor() {
    this.loadNotifications();
    this.checkPermission();
  }

  // Permission management
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (this.notificationPermission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    this.notificationPermission = permission;
    return permission === 'granted';
  }

  private checkPermission(): void {
    if ('Notification' in window) {
      this.notificationPermission = Notification.permission;
    }
  }

  // Notification display
  private showBrowserNotification(title: string, options: NotificationOptions): void {
    if (this.notificationPermission === 'granted') {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });

      // Auto close after 5 seconds for non-critical notifications
      if (!options.requireInteraction) {
        setTimeout(() => notification.close(), 5000);
      }
    }
  }

  // Weather-specific notifications
  createWeatherAlert(alert: WeatherAlert, location: string): WeatherNotification {
    const notification: WeatherNotification = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'alert',
      title: `Weather Alert: ${alert.event}`,
      message: alert.description.substring(0, 200) + '...',
      severity: this.getSeverityFromAlert(alert),
      timestamp: Date.now(),
      location,
      data: alert,
      isRead: false
    };

    this.addNotification(notification);
    this.showBrowserNotification(notification.title, {
      body: notification.message,
      icon: this.getIconForSeverity(notification.severity),
      requireInteraction: notification.severity === 'extreme',
      tag: 'weather-alert'
    });

    return notification;
  }

  createDailyWeatherNotification(weather: CurrentWeather, preferences: UserPreferences): WeatherNotification {
    const temp = Math.round(weather.main.temp);
    const condition = weather.weather[0].description;
    const tempUnit = preferences.temperatureUnit === 'fahrenheit' ? '°F' : '°C';
    const displayTemp = preferences.temperatureUnit === 'fahrenheit' 
      ? Math.round((temp * 9/5) + 32)
      : temp;

    const notification: WeatherNotification = {
      id: `daily_${Date.now()}`,
      type: 'daily',
      title: `Good morning! Today's weather in ${weather.name}`,
      message: `${displayTemp}${tempUnit}, ${condition}. Have a great day!`,
      severity: 'low',
      timestamp: Date.now(),
      location: weather.name,
      data: weather,
      isRead: false
    };

    this.addNotification(notification);
    this.showBrowserNotification(notification.title, {
      body: notification.message,
      icon: this.getWeatherIcon(weather.weather[0].icon),
      tag: 'daily-weather'
    });

    return notification;
  }

  createRainAlert(weather: CurrentWeather, minutesToRain: number): WeatherNotification {
    const notification: WeatherNotification = {
      id: `rain_${Date.now()}`,
      type: 'rain',
      title: '🌧️ Rain Alert',
      message: `Rain expected in ${minutesToRain} minutes in ${weather.name}. Don't forget your umbrella!`,
      severity: 'medium',
      timestamp: Date.now(),
      location: weather.name,
      data: { minutesToRain, weather },
      isRead: false
    };

    this.addNotification(notification);
    this.showBrowserNotification(notification.title, {
      body: notification.message,
      icon: '/weather-icons/rain.png',
      tag: 'rain-alert'
    });

    return notification;
  }

  createUVAlert(uvIndex: number, location: string): WeatherNotification {
    const uvLevel = this.getUVLevel(uvIndex);
    const message = this.getUVMessage(uvIndex);

    const notification: WeatherNotification = {
      id: `uv_${Date.now()}`,
      type: 'uv',
      title: `☀️ UV Alert - ${uvLevel} Level`,
      message,
      severity: uvIndex > 7 ? 'high' : 'medium',
      timestamp: Date.now(),
      location,
      data: { uvIndex },
      isRead: false
    };

    this.addNotification(notification);
    this.showBrowserNotification(notification.title, {
      body: notification.message,
      icon: '/weather-icons/uv.png',
      tag: 'uv-alert'
    });

    return notification;
  }

  createAirQualityAlert(aqi: number, location: string): WeatherNotification {
    const aqiLevel = this.getAQILevel(aqi);
    const message = this.getAQIMessage(aqi);

    const notification: WeatherNotification = {
      id: `aqi_${Date.now()}`,
      type: 'air-quality',
      title: `🫁 Air Quality Alert - ${aqiLevel}`,
      message,
      severity: aqi >= 4 ? 'high' : aqi >= 3 ? 'medium' : 'low',
      timestamp: Date.now(),
      location,
      data: { aqi },
      isRead: false
    };

    this.addNotification(notification);
    this.showBrowserNotification(notification.title, {
      body: notification.message,
      icon: '/weather-icons/air-quality.png',
      tag: 'air-quality-alert'
    });

    return notification;
  }

  // Notification management
  addNotification(notification: WeatherNotification): void {
    this.notifications.unshift(notification);
    // Keep only the last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }
    this.saveNotifications();
  }

  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      this.saveNotifications();
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.isRead = true);
    this.saveNotifications();
  }

  deleteNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
  }

  clearAllNotifications(): void {
    this.notifications = [];
    this.saveNotifications();
  }

  getNotifications(): WeatherNotification[] {
    return [...this.notifications];
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  // Scheduling
  scheduleNotification(notification: WeatherNotification, delay: number): void {
    setTimeout(() => {
      this.showBrowserNotification(notification.title, {
        body: notification.message,
        icon: this.getIconForSeverity(notification.severity),
        tag: notification.type
      });
    }, delay);
  }

  // Helper methods
  private getSeverityFromAlert(alert: WeatherAlert): 'low' | 'medium' | 'high' | 'extreme' {
    const event = alert.event.toLowerCase();
    
    if (event.includes('warning') || event.includes('watch')) {
      return 'medium';
    }
    
    if (event.includes('advisory')) {
      return 'low';
    }
    
    if (event.includes('emergency') || event.includes('extreme') || 
        event.includes('tornado') || event.includes('hurricane')) {
      return 'extreme';
    }
    
    return 'high';
  }

  private getIconForSeverity(severity: string): string {
    switch (severity) {
      case 'extreme': return '/weather-icons/extreme.png';
      case 'high': return '/weather-icons/high.png';
      case 'medium': return '/weather-icons/medium.png';
      default: return '/weather-icons/low.png';
    }
  }

  private getWeatherIcon(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }

  private getUVLevel(uvIndex: number): string {
    if (uvIndex <= 2) return 'Low';
    if (uvIndex <= 5) return 'Moderate';
    if (uvIndex <= 7) return 'High';
    if (uvIndex <= 10) return 'Very High';
    return 'Extreme';
  }

  private getUVMessage(uvIndex: number): string {
    if (uvIndex <= 2) {
      return 'UV levels are low. You can safely stay outside.';
    }
    if (uvIndex <= 5) {
      return 'Moderate UV levels. Wear sunscreen if spending extended time outdoors.';
    }
    if (uvIndex <= 7) {
      return 'High UV levels. Protection against sun damage is needed.';
    }
    if (uvIndex <= 10) {
      return 'Very high UV levels. Extra protection needed. Avoid sun during midday hours.';
    }
    return 'Extreme UV levels! Take all precautions. Avoid sun exposure.';
  }

  private getAQILevel(aqi: number): string {
    switch (aqi) {
      case 1: return 'Good';
      case 2: return 'Fair';
      case 3: return 'Moderate';
      case 4: return 'Poor';
      case 5: return 'Very Poor';
      default: return 'Unknown';
    }
  }

  private getAQIMessage(aqi: number): string {
    switch (aqi) {
      case 1: return 'Air quality is excellent. Great day to be outside!';
      case 2: return 'Air quality is good. Enjoy outdoor activities.';
      case 3: return 'Air quality is moderate. Sensitive individuals should consider limiting outdoor activities.';
      case 4: return 'Poor air quality. Consider reducing outdoor activities, especially for sensitive groups.';
      case 5: return 'Very poor air quality! Avoid outdoor activities. Keep windows closed.';
      default: return 'Air quality information unavailable.';
    }
  }

  // Storage
  private saveNotifications(): void {
    try {
      localStorage.setItem('weather_notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }

  private loadNotifications(): void {
    try {
      const stored = localStorage.getItem('weather_notifications');
      if (stored) {
        this.notifications = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      this.notifications = [];
    }
  }

  // Service Worker integration for background notifications
  async registerServiceWorker(): Promise<boolean> {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        return true;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        return false;
      }
    }
    return false;
  }
}

// Singleton instance
export const notificationService = new NotificationService();
export default notificationService;
