import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { 
  Map as MapIcon, 
  Layers, 
  Thermometer, 
  CloudRain, 
  Wind, 
  Eye, 
  Gauge,
  Droplets,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { WeatherMapLayer, LocationCoords } from '../../types/weather';
import 'leaflet/dist/leaflet.css';

interface WeatherMapProps {
  center: LocationCoords;
  onLocationChange?: (coords: LocationCoords) => void;
  className?: string;
}

interface MapLayerControlProps {
  activeLayer: WeatherMapLayer;
  onLayerChange: (layer: WeatherMapLayer) => void;
  opacity: number;
  onOpacityChange: (opacity: number) => void;
  showLayer: boolean;
  onToggleLayer: (show: boolean) => void;
}

interface LayerButtonProps {
  layer: WeatherMapLayer;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  color: string;
}

const LayerButton: React.FC<LayerButtonProps> = ({ 
  layer, 
  active, 
  onClick, 
  icon, 
  label, 
  color 
}) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all ${
      active 
        ? `bg-${color}-500/30 text-${color}-200 shadow-lg border-${color}-400/50 border` 
        : 'bg-white/10 text-white/70 hover:bg-white/20'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </motion.button>
);

// Custom hook for map click events
const MapClickHandler: React.FC<{ onLocationChange?: (coords: LocationCoords) => void }> = ({ 
  onLocationChange 
}) => {
  useMapEvents({
    click: (e) => {
      if (onLocationChange) {
        onLocationChange({
          latitude: e.latlng.lat,
          longitude: e.latlng.lng
        });
      }
    },
  });

  return null;
};

// Weather layer overlay component
const WeatherLayer: React.FC<{
  layer: WeatherMapLayer;
  opacity: number;
  show: boolean;
}> = ({ layer, opacity, show }) => {
  const map = useMap();
  const [layerInstance, setLayerInstance] = useState<any>(null);

  useEffect(() => {
    if (!show) {
      if (layerInstance) {
        map.removeLayer(layerInstance);
        setLayerInstance(null);
      }
      return;
    }

    // Remove existing layer
    if (layerInstance) {
      map.removeLayer(layerInstance);
    }

    // Weather layer tile URLs (OpenWeatherMap)
    const layerUrls: Record<WeatherMapLayer, string> = {
      temperature: `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}`,
      precipitation: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}`,
      pressure: `https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}`,
      wind: `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}`,
      clouds: `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}`,
      humidity: `https://tile.openweathermap.org/map/humidity_new/{z}/{x}/{y}.png?appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}`
    };

    // Create new layer
    const L = (window as any).L;
    if (L && layerUrls[layer]) {
      const newLayer = L.tileLayer(layerUrls[layer], {
        opacity: opacity / 100,
        attribution: '© OpenWeatherMap',
        maxZoom: 18
      });
      
      newLayer.addTo(map);
      setLayerInstance(newLayer);
    }

    return () => {
      if (layerInstance) {
        map.removeLayer(layerInstance);
      }
    };
  }, [layer, opacity, show, map]);

  useEffect(() => {
    if (layerInstance) {
      layerInstance.setOpacity(opacity / 100);
    }
  }, [opacity, layerInstance]);

  return null;
};

const MapLayerControl: React.FC<MapLayerControlProps> = ({
  activeLayer,
  onLayerChange,
  opacity,
  onOpacityChange,
  showLayer,
  onToggleLayer
}) => {
  const layers: Array<{
    layer: WeatherMapLayer;
    label: string;
    icon: React.ReactNode;
    color: string;
  }> = [
    { 
      layer: 'temperature', 
      label: 'Temperature', 
      icon: <Thermometer className="w-4 h-4" />, 
      color: 'red' 
    },
    { 
      layer: 'precipitation', 
      label: 'Precipitation', 
      icon: <CloudRain className="w-4 h-4" />, 
      color: 'blue' 
    },
    { 
      layer: 'wind', 
      label: 'Wind', 
      icon: <Wind className="w-4 h-4" />, 
      color: 'green' 
    },
    { 
      layer: 'clouds', 
      label: 'Clouds', 
      icon: <Eye className="w-4 h-4" />, 
      color: 'gray' 
    },
    { 
      layer: 'pressure', 
      label: 'Pressure', 
      icon: <Gauge className="w-4 h-4" />, 
      color: 'purple' 
    },
    { 
      layer: 'humidity', 
      label: 'Humidity', 
      icon: <Droplets className="w-4 h-4" />, 
      color: 'cyan' 
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute top-4 left-4 z-[1000] bg-black/30 backdrop-blur-md rounded-xl p-4 max-w-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center">
          <Layers className="w-4 h-4 mr-2" />
          Weather Layers
        </h3>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onToggleLayer(!showLayer)}
          className="text-white/80 hover:text-white"
        >
          {showLayer ? 
            <ToggleRight className="w-5 h-5 text-green-400" /> : 
            <ToggleLeft className="w-5 h-5" />
          }
        </motion.button>
      </div>

      {/* Layer Buttons */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {layers.map(({ layer, label, icon, color }) => (
          <LayerButton
            key={layer}
            layer={layer}
            active={activeLayer === layer}
            onClick={() => onLayerChange(layer)}
            icon={icon}
            label={label}
            color={color}
          />
        ))}
      </div>

      {/* Opacity Control */}
      {showLayer && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="border-t border-white/20 pt-3">
            <label className="text-white text-sm font-medium mb-2 block">
              Layer Opacity: {opacity}%
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={opacity}
              onChange={(e) => onOpacityChange(Number(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.3) ${opacity}%, rgba(255,255,255,0.1) ${opacity}%, rgba(255,255,255,0.1) 100%)`
              }}
            />
          </div>
        </motion.div>
      )}

      {/* Legend */}
      {showLayer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 pt-3 border-t border-white/20"
        >
          <p className="text-xs text-white/70 mb-2">
            Active Layer: <span className="font-semibold text-white capitalize">{activeLayer}</span>
          </p>
          <p className="text-xs text-white/60">
            Click on the map to get weather data for that location
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

const WeatherMap: React.FC<WeatherMapProps> = ({
  center,
  onLocationChange,
  className = ''
}) => {
  const [activeLayer, setActiveLayer] = useState<WeatherMapLayer>('temperature');
  const [layerOpacity, setLayerOpacity] = useState(70);
  const [showLayer, setShowLayer] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  // Initialize Leaflet marker icon fix
  useEffect(() => {
    const L = (window as any).L;
    if (L) {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
        iconUrl: require('leaflet/dist/images/marker-icon.png'),
        shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
      });
      setMapReady(true);
    }
  }, []);

  if (!mapReady) {
    return (
      <div className={`flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-xl ${className}`}>
        <div className="text-white/70 text-center p-8">
          <MapIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Loading weather map...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative overflow-hidden rounded-xl shadow-2xl ${className}`}
    >
      {/* Map Container */}
      <div className="h-full w-full relative">
        <MapContainer
          center={[center.latitude, center.longitude]}
          zoom={10}
          className="h-full w-full z-10"
          zoomControl={false}
          attributionControl={false}
        >
          {/* Base Map Layer */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© OpenStreetMap contributors'
          />
          
          {/* Weather Layer */}
          <WeatherLayer 
            layer={activeLayer} 
            opacity={layerOpacity} 
            show={showLayer} 
          />
          
          {/* Map Click Handler */}
          <MapClickHandler onLocationChange={onLocationChange} />
        </MapContainer>

        {/* Layer Controls */}
        <MapLayerControl
          activeLayer={activeLayer}
          onLayerChange={setActiveLayer}
          opacity={layerOpacity}
          onOpacityChange={setLayerOpacity}
          showLayer={showLayer}
          onToggleLayer={setShowLayer}
        />

        {/* Map Info */}
        <div className="absolute bottom-4 right-4 z-[1000] bg-black/30 backdrop-blur-md rounded-lg px-3 py-2">
          <div className="text-white text-xs">
            <div className="font-semibold">Interactive Weather Map</div>
            <div className="opacity-70">Powered by OpenWeatherMap</div>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 z-[1000] flex flex-col space-y-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="bg-black/30 backdrop-blur-md text-white p-2 rounded-lg hover:bg-black/40"
            onClick={() => {
              const map = (window as any).map;
              if (map) map.zoomIn();
            }}
          >
            +
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="bg-black/30 backdrop-blur-md text-white p-2 rounded-lg hover:bg-black/40"
            onClick={() => {
              const map = (window as any).map;
              if (map) map.zoomOut();
            }}
          >
            -
          </motion.button>
        </div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </motion.div>
  );
};

export default WeatherMap;
