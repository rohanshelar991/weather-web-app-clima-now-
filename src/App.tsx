import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Settings, 
  Star, 
  Map, 
  Activity, 
  Wind, 
  Droplets,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  Zap,
  Eye,
  Thermometer,
  Navigation,
  Volume2,
  Bell,
  Menu,
  X,
  Home,
  TrendingUp,
  Calendar,
  User,
  Moon,
  BarChart3,
  Globe
} from 'lucide-react';
import WeatherCard from './components/WeatherCard';
import SearchBar from './components/SearchBar';
import EnhancedWeatherCard from './components/weather/EnhancedWeatherCard';
import EnhancedSearchBar from './components/ui/EnhancedSearchBar';
import LoadingSpinner from './components/LoadingSpinner';
import WeatherMap from './components/map/WeatherMap';
import AirQualityCard from './components/weather/AirQualityCard';
import VoiceSearch from './components/ui/VoiceSearch';
import WeatherAssistant from './components/assistant/WeatherAssistant';
import SettingsPage from './components/settings/SettingsPage';
import WeatherDashboard from './components/dashboard/WeatherDashboard';
import DetailedWeatherView from './components/weather/DetailedWeatherView';
import WeatherInsights from './components/insights/WeatherInsights';
import { 
  CurrentWeather, 
  GeocodingResult, 
  SavedCity, 
  UserPreferences,
  CompleteWeatherData,
  AirQualityResponse,
  WeatherNotification
} from './types/weather';
import { WeatherApiService } from './services/weatherApi';
import { LocationService, LocationCoords } from './services/locationService';
import { StorageService } from './services/storageService';
import { notificationService } from './services/notificationService';
import {
  getWeatherConditionType,
  getWeatherTheme,
  isNightTime
} from './utils/weatherUtils';
import { realtimeWeatherService } from './services/realtimeWeatherService';
import WorldMap from './components/map/WorldMap';
import GlobalWeatherCoverage from './components/GlobalWeatherCoverage';

interface AppState {
  currentWeather: CurrentWeather | null;
  completeWeatherData: CompleteWeatherData | null;
  airQuality: AirQualityResponse | null;
  isLoading: boolean;
  error: string | null;
  currentLocation: LocationCoords | null;
  favoriteCities: SavedCity[];
  selectedCity: SavedCity | null;
  notifications: WeatherNotification[];
  unreadCount: number;
}

function App() {
  const [state, setState] = useState<AppState>({
    currentWeather: null,
    completeWeatherData: null,
    airQuality: null,
    isLoading: true,
    error: null,
    currentLocation: null,
    favoriteCities: [],
    selectedCity: null,
    notifications: [],
    unreadCount: 0
  });

  const [preferences, setPreferences] = useState<UserPreferences>({
    temperatureUnit: 'celsius',
    windSpeedUnit: 'kmh',
    pressureUnit: 'hPa',
    timeFormat: '24h',
    theme: 'auto',
    backgroundAnimations: true,
    notifications: {
      enabled: false,
      dailyWeather: false,
      severeAlerts: false,
      rainAlerts: false,
      uvAlerts: false,
      airQualityAlerts: false
    },
    voiceSearch: true,
    autoLocation: true
  });
  
  const [weatherTheme, setWeatherTheme] = useState({
    gradient: 'bg-sunny',
    isDark: false,
    textColor: 'text-white',
    cardClass: 'weather-card'
  });

  const [activeView, setActiveView] = useState<'current' | 'forecast' | 'map' | 'air' | 'settings' | 'dashboard' | 'detailed' | 'insights' | 'worldmap' | 'global'>('current');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const loadFavoriteCities = () => {
    const favorites = StorageService.getFavoriteCities();
    setState(prev => ({ ...prev, favoriteCities: favorites }));
  };

  const loadNotifications = () => {
    const notifications = notificationService.getNotifications();
    const unreadCount = notificationService.getUnreadCount();
    setState(prev => ({ ...prev, notifications, unreadCount }));
  };

  const checkForNotifications = async () => {
    if (!state.currentWeather || !preferences.notifications.enabled) return;
    
    // Check for severe weather alerts
    if (preferences.notifications.severeAlerts) {
      try {
        const alertsResponse = await WeatherApiService.getWeatherAlerts(
          state.currentWeather.coord.lat,
          state.currentWeather.coord.lon
        );
        
        if (alertsResponse.success && alertsResponse.data && alertsResponse.data.length > 0) {
          alertsResponse.data.forEach(alert => {
            notificationService.createWeatherAlert(alert, state.currentWeather!.name);
          });
          loadNotifications();
        }
      } catch (error) {
        console.error('Error checking for weather alerts:', error);
      }
    }
    
    // Check for UV alerts
    if (preferences.notifications.uvAlerts) {
      try {
        const uvIndex = await WeatherApiService.getUVIndex(
          state.currentWeather.coord.lat,
          state.currentWeather.coord.lon
        );
        
        if (uvIndex > 7) { // High UV index
          notificationService.createUVAlert(uvIndex, state.currentWeather.name);
          loadNotifications();
        }
      } catch (error) {
        console.error('Error checking UV index:', error);
      }
    }
  };

  const getCurrentLocationWeather = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      if (LocationService.isGeolocationAvailable()) {
        const location = await LocationService.getCurrentLocation();
        await fetchWeatherDataForLocation(location.latitude, location.longitude);
      } else {
        // Fallback to a default city (New York)
        const weather = await WeatherApiService.getCurrentWeatherByCity('New York');
        setState(prev => ({
          ...prev,
          currentWeather: weather,
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Error loading weather:', error);
      setState(prev => ({
        ...prev,
        error: 'Unable to load weather data. Please try again.',
        isLoading: false
      }));
    }
  };

  const fetchWeatherDataForLocation = async (lat: number, lon: number) => {
    try {
      // Fetch all weather data in parallel
      const [
        currentWeather,
        completeWeatherData,
        airQuality
      ] = await Promise.all([
        WeatherApiService.getCurrentWeatherByCoords(lat, lon),
        WeatherApiService.getCompleteWeatherData(lat, lon),
        WeatherApiService.getAirQuality(lat, lon)
      ]);
      
      setState(prev => ({
        ...prev,
        currentWeather,
        completeWeatherData: completeWeatherData.success && completeWeatherData.data ? completeWeatherData.data : prev.completeWeatherData,
        airQuality,
        currentLocation: { latitude: lat, longitude: lon },
        isLoading: false
      }));
      
      // Start real-time updates
      realtimeWeatherService.connect(lat, lon, 60000); // Update every minute
      realtimeWeatherService.addListener((weather) => {
        setState(prev => ({
          ...prev,
          currentWeather: weather
        }));
      });
      
      // Check for daily weather notification
      if (preferences.notifications.dailyWeather && 
          new Date().getHours() === 8 && // 8 AM
          new Date().getMinutes() < 5) { // First 5 minutes of the hour
        notificationService.createDailyWeatherNotification(currentWeather, preferences);
        loadNotifications();
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setState(prev => ({
        ...prev,
        error: 'Unable to load weather data. Please try again.',
        isLoading: false
      }));
    }
  };

  const handleLocationSelect = async (location: GeocodingResult) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await fetchWeatherDataForLocation(location.lat, location.lon);
    } catch (error) {
      console.error('Error loading weather for selected location:', error);
      setState(prev => ({
        ...prev,
        error: 'Unable to load weather for selected location.',
        isLoading: false
      }));
    }
  };

  const handleToggleFavorite = () => {
    if (!state.currentWeather) return;

    const isCurrentlyFavorite = StorageService.isFavoriteCity(
      state.currentWeather.coord.lat,
      state.currentWeather.coord.lon
    );

    if (isCurrentlyFavorite) {
      // Remove from favorites
      const cityToRemove = state.favoriteCities.find(
        city => Math.abs(city.lat - state.currentWeather!.coord.lat) < 0.01 &&
                Math.abs(city.lon - state.currentWeather!.coord.lon) < 0.01
      );
      if (cityToRemove) {
        StorageService.removeFavoriteCity(cityToRemove.id);
      }
    } else {
      // Add to favorites
      StorageService.saveFavoriteCity({
        name: state.currentWeather.name,
        country: state.currentWeather.sys.country,
        lat: state.currentWeather.coord.lat,
        lon: state.currentWeather.coord.lon
      });
    }
    
    loadFavoriteCities();
  };

  const isFavorite = state.currentWeather 
    ? StorageService.isFavoriteCity(
        state.currentWeather.coord.lat,
        state.currentWeather.coord.lon
      )
    : false;

  const handleRetry = () => {
    getCurrentLocationWeather();
  };

  const handleVoiceResult = (transcript: string) => {
    // Process voice command
    console.log('Voice command received:', transcript);
    // In a real implementation, this would parse the transcript and perform actions
  };

  const handlePreferencesChange = (newPreferences: UserPreferences) => {
    setPreferences(newPreferences);
    // Convert UserPreferences to AppSettings for storage
    const appSettings = {
      temperatureUnit: newPreferences.temperatureUnit,
      windSpeedUnit: newPreferences.windSpeedUnit as 'kmh' | 'mph',
      timeFormat: newPreferences.timeFormat,
      theme: newPreferences.theme,
      notifications: newPreferences.notifications.enabled
    };
    StorageService.saveSettings(appSettings);
  };

  const handleNotificationClick = (notification: WeatherNotification) => {
    notificationService.markAsRead(notification.id);
    loadNotifications();
    
    // Handle specific notification actions
    switch (notification.type) {
      case 'alert':
        // Show alert details
        break;
      case 'rain':
        // Show precipitation forecast
        break;
      case 'uv':
        // Show UV index details
        break;
      case 'air-quality':
        // Switch to air quality view
        setActiveView('air');
        break;
    }
  };

  useEffect(() => {
    // Initialize preferences from storage
    const storedSettings = StorageService.getSettings();
    setPreferences(prev => ({
      ...prev,
      temperatureUnit: storedSettings.temperatureUnit,
      windSpeedUnit: storedSettings.windSpeedUnit as 'kmh' | 'mph' | 'ms',
      timeFormat: storedSettings.timeFormat,
      theme: storedSettings.theme,
      notifications: {
        ...prev.notifications,
        enabled: storedSettings.notifications
      }
    }));
    
    loadFavoriteCities();
    loadNotifications();
    getCurrentLocationWeather();
    
    // Set up notification listener
    const notificationInterval = setInterval(() => {
      checkForNotifications();
    }, 60000); // Check every minute
    
    return () => {
      clearInterval(notificationInterval);
    };
  }, []); // Empty dependency array is fine here since we're calling the functions directly

  useEffect(() => {
    if (state.currentWeather) {
      const condition = getWeatherConditionType(state.currentWeather.weather[0].main);
      const nightTime = isNightTime(
        state.currentWeather.dt,
        state.currentWeather.sys.sunrise,
        state.currentWeather.sys.sunset
      );
      const theme = getWeatherTheme(condition, nightTime);
      setWeatherTheme(theme);
    }
  }, [state.currentWeather]);

  const NavigationMenu = () => (
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: isMenuOpen ? 0 : '-100%' }}
      transition={{ type: 'spring', damping: 20 }}
      className="fixed inset-y-0 left-0 z-50 w-64 bg-black/50 backdrop-blur-xl border-r border-white/20 p-4"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-white">ClimaNow</h2>
        <button 
          onClick={() => setIsMenuOpen(false)}
          className="text-white/70 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <nav className="space-y-2">
        <button
          onClick={() => { setActiveView('current'); setIsMenuOpen(false); }}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
            activeView === 'current' 
              ? 'bg-white/20 text-white' 
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Current Weather</span>
        </button>
        
        <button
          onClick={() => { setActiveView('dashboard'); setIsMenuOpen(false); }}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
            activeView === 'dashboard' 
              ? 'bg-white/20 text-white' 
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span>Dashboard</span>
        </button>
        
        <button
          onClick={() => { setActiveView('detailed'); setIsMenuOpen(false); }}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
            activeView === 'detailed' 
              ? 'bg-white/20 text-white' 
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span>Detailed View</span>
        </button>
        
        <button
          onClick={() => { setActiveView('insights'); setIsMenuOpen(false); }}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
            activeView === 'insights' 
              ? 'bg-white/20 text-white' 
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Activity className="w-5 h-5" />
          <span>Insights</span>
        </button>
        
        <button
          onClick={() => { setActiveView('forecast'); setIsMenuOpen(false); }}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
            activeView === 'forecast' 
              ? 'bg-white/20 text-white' 
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span>Forecast</span>
        </button>
        
        <button
          onClick={() => { setActiveView('map'); setIsMenuOpen(false); }}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
            activeView === 'map' 
              ? 'bg-white/20 text-white' 
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Map className="w-5 h-5" />
          <span>Weather Map</span>
        </button>
        
        <button
          onClick={() => { setActiveView('worldmap'); setIsMenuOpen(false); }}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
            activeView === 'worldmap' 
              ? 'bg-white/20 text-white' 
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Globe className="w-5 h-5" />
          <span>World Cities</span>
        </button>
        
        <button
          onClick={() => { setActiveView('global'); setIsMenuOpen(false); }}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
            activeView === 'global' 
              ? 'bg-white/20 text-white' 
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Globe className="w-5 h-5" />
          <span>Global Coverage</span>
        </button>
        
        <button
          onClick={() => { setActiveView('air'); setIsMenuOpen(false); }}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
            activeView === 'air' 
              ? 'bg-white/20 text-white' 
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Activity className="w-5 h-5" />
          <span>Air Quality</span>
        </button>
        
        <button
          onClick={() => { setActiveView('settings'); setIsMenuOpen(false); setIsSettingsOpen(true); }}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
            activeView === 'settings' 
              ? 'bg-white/20 text-white' 
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </button>
      </nav>
      
      <div className="absolute bottom-4 left-0 right-0 px-4">
        <button
          onClick={() => { setIsAssistantOpen(true); setIsMenuOpen(false); }}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl text-white font-medium"
        >
          <Volume2 className="w-5 h-5" />
          <span>Weather Assistant</span>
        </button>
      </div>
    </motion.div>
  );

  if (state.isLoading) {
    return (
      <div className={`min-h-screen ${weatherTheme.gradient} ${weatherTheme.textColor} flex items-center justify-center`}>
        <LoadingSpinner size="large" message="Loading weather data..." />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${weatherTheme.gradient} ${weatherTheme.textColor} transition-all duration-1000 relative overflow-hidden`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse hidden sm:block"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000 hidden sm:block"></div>
      </div>
      
      {/* Navigation Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>
      
      <NavigationMenu />
      
      {/* Main Content */}
      <div className="relative z-10">
        <div className="container mx-auto responsive-padding max-w-responsive">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-6 sm:mb-8"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <button 
                onClick={() => setIsMenuOpen(true)}
                className="btn-icon p-2 sm:p-3"
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                ClimaNow
              </h1>
              
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button 
                  onClick={() => setIsAssistantOpen(true)}
                  className="btn-icon p-2 sm:p-3 relative"
                >
                  <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  {isAssistantOpen && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
                  )}
                </button>
                
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="btn-icon p-2 sm:p-3"
                >
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
            
            {/* Enhanced Search Bar */}
            <EnhancedSearchBar
              onLocationSelect={handleLocationSelect}
              placeholder="🌍 Search for any city worldwide..."
              className="max-w-md sm:max-w-lg mx-auto mb-4 sm:mb-6"
            />
            
            {/* Voice Search */}
            <div className="flex justify-center mb-4 sm:mb-6">
              <VoiceSearch 
                onResult={handleVoiceResult}
                language={preferences.theme === 'auto' ? navigator.language : 'en-US'}
              />
            </div>
          </motion.header>

          {/* Main Content Area */}
          <main className="flex flex-col items-center">
            {state.error ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-6 sm:p-8"
              >
                <p className="text-lg mb-4 opacity-80">{state.error}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRetry}
                  className="btn-primary px-5 py-3 rounded-xl"
                >
                  Try Again
                </motion.button>
              </motion.div>
            ) : state.currentWeather ? (
              <>
                {activeView === 'current' && (
                  <EnhancedWeatherCard
                    weather={state.currentWeather}
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={isFavorite}
                    className="w-full"
                  />
                )}
                
                {activeView === 'dashboard' && state.completeWeatherData && state.airQuality && (
                  <WeatherDashboard
                    currentWeather={state.currentWeather}
                    dailyForecast={state.completeWeatherData.dailyForecast?.daily || []}
                    airQuality={state.airQuality}
                    preferences={preferences}
                    className="w-full"
                  />
                )}
                
                {activeView === 'detailed' && state.completeWeatherData && state.airQuality && (
                  <DetailedWeatherView
                    currentWeather={state.currentWeather}
                    dailyForecast={state.completeWeatherData.dailyForecast?.daily || []}
                    hourlyForecast={state.completeWeatherData.hourlyForecast?.list || []}
                    airQuality={state.airQuality}
                    alerts={state.completeWeatherData.alerts || []}
                    preferences={preferences}
                    className="w-full"
                  />
                )}
                
                {activeView === 'insights' && state.completeWeatherData && state.airQuality && (
                  <WeatherInsights
                    currentWeather={state.currentWeather}
                    dailyForecast={state.completeWeatherData.dailyForecast?.daily || []}
                    airQuality={state.airQuality}
                    preferences={preferences}
                    className="w-full"
                  />
                )}
                
                {activeView === 'map' && state.currentLocation && (
                  <WeatherMap
                    center={state.currentLocation}
                    onLocationChange={(coords) => fetchWeatherDataForLocation(coords.latitude, coords.longitude)}
                    className="w-full h-80 sm:h-96 md:h-[500px]"
                  />
                )}
                
                {activeView === 'worldmap' && (
                  <WorldMap
                    onCitySelect={handleLocationSelect}
                  />
                )}
                
                {activeView === 'global' && (
                  <GlobalWeatherCoverage
                    onCitySelect={handleLocationSelect}
                  />
                )}
                
                {activeView === 'air' && state.airQuality && (
                  <AirQualityCard
                    airQuality={state.airQuality}
                    preferences={preferences}
                    className="w-full"
                  />
                )}
                
                {activeView === 'forecast' && state.completeWeatherData && (
                  <div className="w-full space-y-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">7-Day Forecast</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {state.completeWeatherData.dailyForecast?.daily?.slice(0, 7).map((day, index) => (
                        <motion.div
                          key={day.dt}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="card-hover"
                        >
                          <div className="text-center">
                            <p className="font-semibold">
                              {new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                            </p>
                            <p className="text-xs sm:text-sm opacity-75">
                              {new Date(day.dt * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                            
                            <div className="my-3 flex justify-center">
                              {getWeatherIcon(day.weather[0].main, isNightTime(day.dt, day.sunrise, day.sunset))}
                            </div>
                            
                            <div className="flex justify-between items-center mt-2">
                              <span className="font-bold">{Math.round(day.temp.max)}°</span>
                              <span className="opacity-75">{Math.round(day.temp.min)}°</span>
                            </div>
                            
                            <p className="text-xs sm:text-sm mt-2 opacity-75 capitalize">
                              {day.weather[0].description}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center p-8">
                <p className="text-lg opacity-80">No weather data available</p>
              </div>
            )}
          </main>

          {/* Favorite Cities */}
          {state.favoriteCities.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-8 sm:mt-12 w-full"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6 flex items-center justify-center">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                Favorite Cities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {state.favoriteCities.map((city, index) => (
                  <motion.button
                    key={city.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleLocationSelect(city)}
                    className="p-3 sm:p-4 bg-white/20 rounded-xl hover:bg-white/30 transition-all duration-200 text-left"
                  >
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 opacity-70" />
                      <div>
                        <p className="font-semibold text-sm sm:text-base">{city.name}</p>
                        <p className="text-xs sm:text-sm opacity-75">{city.country}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.section>
          )}

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-center mt-8 sm:mt-12 py-6 sm:py-8 border-t border-white/20"
          >
            <p className="opacity-60 text-sm sm:text-base">Made with ❤️ for beautiful weather experiences</p>
          </motion.footer>
        </div>
      </div>
      
      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsPage
            preferences={preferences}
            onPreferencesChange={handlePreferencesChange}
            onClose={() => setIsSettingsOpen(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Weather Assistant */}
      <WeatherAssistant
        weatherData={state.completeWeatherData || undefined}
        preferences={preferences}
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />
    </div>
  );
}

// Helper function to get weather icons
const getWeatherIcon = (condition: string, isNight: boolean) => {
  switch (condition.toLowerCase()) {
    case 'clear':
      return isNight ? 
        <Moon className="w-8 h-8 text-yellow-200" /> : 
        <Sun className="w-8 h-8 text-yellow-400" />;
    case 'clouds':
      return <Cloud className="w-8 h-8 text-gray-300" />;
    case 'rain':
      return <CloudRain className="w-8 h-8 text-blue-400" />;
    case 'snow':
      return <CloudSnow className="w-8 h-8 text-blue-100" />;
    case 'thunderstorm':
      return <Zap className="w-8 h-8 text-yellow-400" />;
    default:
      return <Sun className="w-8 h-8 text-yellow-400" />;
  }
};

export default App;