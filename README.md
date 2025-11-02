# 🌦️ ClimaNow - Next-Generation Weather App

![ClimaNow Banner](https://via.placeholder.com/1200x400/1e40af/ffffff?text=ClimaNow+-+Your+Beautiful+Weather+Companion)

> **Your beautiful, AI-powered weather companion with advanced forecasts, interactive maps, and personalized insights.**

[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1.13-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-4285F4?logo=googlechrome)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

### 🌟 Core Weather Features
- **Real-Time Weather**: Auto-detect GPS location with current conditions
- **Smart Search**: City search with auto-suggestions and search history
- **Advanced Forecasts**: 7-14 day daily and hourly forecasts with charts
- **Astronomical Data**: Sunrise, sunset, moon phases, and tides

### 🌍 Comprehensive Global Coverage
- **Worldwide Cities**: Access weather data for over 200+ cities across all continents
- **Regional Coverage**: Detailed weather information for states, provinces, and regions
- **Country-Level Data**: Comprehensive coverage for all countries worldwide
- **Inhabited Places**: Weather data for cities, towns, and villages of all sizes
- **Advanced Search Filters**: Search by continent, country, or region for precise results

### 🚀 Advanced Features
- **Interactive Weather Map**: Global map with temperature, precipitation, wind, AQI, and cloud layers
- **Personalized Dashboard**: Customizable widgets and multiple saved cities
- **AI Weather Assistant**: Intelligent chatbot with voice recognition
- **Air Quality Monitoring**: Real-time AQI with health recommendations
- **UV Index & Pollen**: Comprehensive environmental data

### 💫 Premium Features
- **Live Weather Animations**: Rain drops, snowflakes, lightning effects
- **Smart Notifications**: Severe weather alerts, rain notifications, UV warnings
- **Offline Mode**: Works without internet with cached data
- **Voice Search**: "What's the weather in Mumbai?"
- **PWA Support**: Installable, works offline, native app-like experience

## 🛠️ Technology Stack

### Frontend
- **React 19** with TypeScript for type safety
- **Tailwind CSS** for modern, responsive design
- **Framer Motion** for smooth animations and transitions
- **React Leaflet** for interactive maps
- **Recharts & Chart.js** for data visualization
- **Lottie React** for advanced animations

### APIs & Services
- **OpenWeatherMap API** for weather data
- **Geolocation API** for location services
- **Web Speech API** for voice recognition
- **Service Workers** for offline functionality
- **Push Notifications** for weather alerts

### Architecture
- **Component-based architecture** with custom hooks
- **TypeScript interfaces** for type safety
- **Caching system** for performance optimization
- **Error boundaries** for robust error handling
- **Accessibility-first** design

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- OpenWeatherMap API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/clima-now.git
   cd clima-now
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Add your API keys to `.env`:
   ```env
   REACT_APP_OPENWEATHER_API_KEY=your_openweathermap_api_key
   REACT_APP_AIRVISUAL_API_KEY=your_airvisual_api_key
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage

### Getting Started
1. **Allow location access** when prompted for accurate weather data
2. **Search for cities** using the search bar with auto-suggestions
3. **Save favorite locations** by clicking the star icon
4. **Customize your dashboard** with different weather widgets

### Global Weather Coverage
1. **World Cities Explorer**: Access the "World Cities" view to browse cities by continent
2. **Global Coverage**: Use the "Global Coverage" view to see comprehensive statistics
3. **Advanced Filters**: Filter cities by continent or country for targeted searches
4. **Comprehensive Data**: View detailed information for all inhabited places worldwide

### AI Assistant
- Click the **chat icon** to open the weather assistant
- Ask questions like:
  - "Should I carry an umbrella today?"
  - "What should I wear?"
  - "Is it good weather for outdoor activities?"
- Use **voice commands** by clicking the microphone icon

### Interactive Map
- Switch between different **weather layers**
- Adjust **opacity** for better visibility
- **Click on map** locations to get weather data
- **Zoom and pan** like Google Maps

### Personalization
- Access **Settings** to customize:
  - Temperature units (°C/°F)
  - Wind speed units (km/h, mph, m/s)
  - Time format (12h/24h)
  - Theme preferences
  - Notification settings

## 🎨 Screenshots

<table>
  <tr>
    <td><img src="https://via.placeholder.com/300x200/1e40af/ffffff?text=Dashboard" alt="Dashboard" width="300"/></td>
    <td><img src="https://via.placeholder.com/300x200/059669/ffffff?text=Weather+Map" alt="Weather Map" width="300"/></td>
    <td><img src="https://via.placeholder.com/300x200/7c3aed/ffffff?text=AI+Assistant" alt="AI Assistant" width="300"/></td>
  </tr>
  <tr>
    <td align="center"><strong>Personalized Dashboard</strong></td>
    <td align="center"><strong>Interactive Weather Map</strong></td>
    <td align="center"><strong>AI Weather Assistant</strong></td>
  </tr>
  <tr>
    <td><img src="https://via.placeholder.com/300x200/d97706/ffffff?text=Global+Coverage" alt="Global Coverage" width="300"/></td>
    <td><img src="https://via.placeholder.com/300x200/0d9488/ffffff?text=World+Cities" alt="World Cities" width="300"/></td>
    <td><img src="https://via.placeholder.com/300x200/be185d/ffffff?text=Advanced+Search" alt="Advanced Search" width="300"/></td>
  </tr>
  <tr>
    <td align="center"><strong>Global Weather Coverage</strong></td>
    <td align="center"><strong>World Cities Explorer</strong></td>
    <td align="center"><strong>Advanced Search Filters</strong></td>
  </tr>
</table>

## 📦 Available Scripts

### Development
```bash
npm start          # Start development server
npm test           # Run test suite
npm run build      # Build for production
npm run eject      # Eject from Create React App (one-way)
```

### Production
```bash
npm run build      # Create production build
npm run serve      # Serve production build locally
```

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── animations/      # Weather animations
│   ├── assistant/       # AI weather assistant
│   ├── dashboard/       # Dashboard and widgets
│   ├── map/            # Interactive weather map
│   ├── settings/       # Settings and preferences
│   ├── ui/             # Base UI components
│   └── weather/        # Weather-specific components
├── hooks/              # Custom React hooks
├── services/           # API and external services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── context/            # React context providers
```

## 🔧 API Configuration

### OpenWeatherMap API
1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Get your free API key
3. Add to `.env` file

### AirVisual API (Optional)
1. Sign up at [AirVisual](https://www.iqair.com/air-pollution-data-api)
2. Get API key for air quality data
3. Add to `.env` file

## 🌐 PWA Features

- ✅ **Installable**: Add to home screen
- ✅ **Offline capable**: Works without internet
- ✅ **Background sync**: Updates data when online
- ✅ **Push notifications**: Weather alerts
- ✅ **App shortcuts**: Quick access to features

## 📱 Mobile Support

- **Responsive design** for all screen sizes
- **Touch-optimized** interactions
- **Native-like experience** on mobile devices
- **iOS/Android** app shortcuts
- **Voice search** on mobile browsers

## 🔒 Privacy & Security

- **Location data** used only for weather information
- **No personal data** stored on external servers
- **Secure API calls** with proper error handling
- **Local storage** for preferences and cache
- **GDPR compliant** design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenWeatherMap](https://openweathermap.org/) for weather data
- [React](https://reactjs.org/) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Lucide React](https://lucide.dev/) for beautiful icons

## 📞 Support

If you have any questions or need help, please:
- Open an [issue](https://github.com/yourusername/clima-now/issues)
- Join our [Discord community](https://discord.gg/clima-now)
- Email us at support@clima-now.app

---

<div align="center">
  <p><strong>Made with ❤️ for beautiful weather experiences</strong></p>
  <p>
    <a href="https://github.com/yourusername/clima-now">⭐ Star this repo</a> |
    <a href="https://github.com/yourusername/clima-now/issues">🐛 Report Bug</a> |
    <a href="https://github.com/yourusername/clima-now/issues">✨ Request Feature</a>
  </p>
</div>