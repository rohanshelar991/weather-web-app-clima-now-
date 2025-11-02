import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Thermometer,
  Wind,
  Gauge,
  Clock,
  Palette,
  Bell,
  Mic,
  MapPin,
  Shield,
  Info,
  Save,
  RotateCcw,
  Moon,
  Sun,
  Monitor,
  Volume2,
  VolumeX,
  Eye,
  EyeOff
} from 'lucide-react';
import { UserPreferences } from '../../types/weather';
import { notificationService } from '../../services/notificationService';

interface SettingsPageProps {
  preferences: UserPreferences;
  onPreferencesChange: (preferences: UserPreferences) => void;
  onClose: () => void;
  className?: string;
}

interface SettingSectionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
  description?: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label: string;
  description?: string;
}

const SettingSection: React.FC<SettingSectionProps> = ({ title, description, icon, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
  >
    <div className="flex items-center space-x-3 mb-4">
      <div className="p-2 bg-white/20 rounded-lg">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-white/70">{description}</p>
      </div>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </motion.div>
);

const Toggle: React.FC<ToggleProps> = ({ enabled, onChange, label, description }) => (
  <div className="flex items-center justify-between">
    <div className="flex-1">
      <label className="text-white font-medium">{label}</label>
      {description && <p className="text-sm text-white/70 mt-1">{description}</p>}
    </div>
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-blue-500' : 'bg-white/20'
      }`}
    >
      <motion.span
        animate={{ x: enabled ? 20 : 2 }}
        className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg"
      />
    </motion.button>
  </div>
);

const Select: React.FC<SelectProps> = ({ value, onChange, options, label, description }) => (
  <div>
    <label className="block text-white font-medium mb-2">{label}</label>
    {description && <p className="text-sm text-white/70 mb-2">{description}</p>}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} className="bg-gray-800 text-white">
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const SettingsPage: React.FC<SettingsPageProps> = ({
  preferences,
  onPreferencesChange,
  onClose,
  className = ''
}) => {
  const [tempPreferences, setTempPreferences] = useState<UserPreferences>(preferences);
  const [hasChanges, setHasChanges] = useState(false);

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    const newPreferences = { ...tempPreferences, [key]: value };
    setTempPreferences(newPreferences);
    setHasChanges(JSON.stringify(newPreferences) !== JSON.stringify(preferences));
  };

  const updateNotificationPreference = <K extends keyof UserPreferences['notifications']>(
    key: K,
    value: UserPreferences['notifications'][K]
  ) => {
    const newNotifications = { ...tempPreferences.notifications, [key]: value };
    updatePreference('notifications', newNotifications);
  };

  const handleSave = () => {
    onPreferencesChange(tempPreferences);
    setHasChanges(false);
  };

  const handleReset = () => {
    setTempPreferences(preferences);
    setHasChanges(false);
  };

  const handleRequestNotificationPermission = async () => {
    const granted = await notificationService.requestPermission();
    if (granted) {
      updateNotificationPreference('enabled', true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${className}`}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Settings className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Settings</h2>
              <p className="text-white/70">Customize your weather experience</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {hasChanges && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReset}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600/80 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500/80 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </motion.button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Units & Format */}
            <SettingSection
              title="Units & Format"
              description="Configure measurement units and display formats"
              icon={<Thermometer className="w-5 h-5 text-blue-400" />}
            >
              <Select
                value={tempPreferences.temperatureUnit}
                onChange={(value) => updatePreference('temperatureUnit', value as 'celsius' | 'fahrenheit')}
                options={[
                  { value: 'celsius', label: 'Celsius (°C)' },
                  { value: 'fahrenheit', label: 'Fahrenheit (°F)' }
                ]}
                label="Temperature Unit"
                description="Choose your preferred temperature scale"
              />

              <Select
                value={tempPreferences.windSpeedUnit}
                onChange={(value) => updatePreference('windSpeedUnit', value as any)}
                options={[
                  { value: 'kmh', label: 'Kilometers per hour (km/h)' },
                  { value: 'mph', label: 'Miles per hour (mph)' },
                  { value: 'ms', label: 'Meters per second (m/s)' }
                ]}
                label="Wind Speed Unit"
              />

              <Select
                value={tempPreferences.pressureUnit}
                onChange={(value) => updatePreference('pressureUnit', value as any)}
                options={[
                  { value: 'hPa', label: 'Hectopascal (hPa)' },
                  { value: 'inHg', label: 'Inches of Mercury (inHg)' },
                  { value: 'mmHg', label: 'Millimeters of Mercury (mmHg)' }
                ]}
                label="Pressure Unit"
              />

              <Select
                value={tempPreferences.timeFormat}
                onChange={(value) => updatePreference('timeFormat', value as '12h' | '24h')}
                options={[
                  { value: '12h', label: '12-hour (AM/PM)' },
                  { value: '24h', label: '24-hour' }
                ]}
                label="Time Format"
              />
            </SettingSection>

            {/* Appearance */}
            <SettingSection
              title="Appearance"
              description="Customize the visual experience"
              icon={<Palette className="w-5 h-5 text-purple-400" />}
            >
              <Select
                value={tempPreferences.theme}
                onChange={(value) => updatePreference('theme', value as any)}
                options={[
                  { value: 'light', label: '🌞 Light Theme' },
                  { value: 'dark', label: '🌙 Dark Theme' },
                  { value: 'auto', label: '💻 System Default' }
                ]}
                label="Theme"
                description="Choose your preferred color scheme"
              />

              <Toggle
                enabled={tempPreferences.backgroundAnimations}
                onChange={(value) => updatePreference('backgroundAnimations', value)}
                label="Background Animations"
                description="Enable animated weather backgrounds and effects"
              />
            </SettingSection>

            {/* Notifications */}
            <SettingSection
              title="Notifications"
              description="Manage weather alerts and updates"
              icon={<Bell className="w-5 h-5 text-yellow-400" />}
            >
              <div className="space-y-4">
                <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-400/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">Enable Notifications</h4>
                      <p className="text-sm text-white/70">Allow weather alerts and updates</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleRequestNotificationPermission}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
                    >
                      Enable
                    </motion.button>
                  </div>
                </div>

                {tempPreferences.notifications.enabled && (
                  <div className="space-y-3 border-t border-white/10 pt-4">
                    <Toggle
                      enabled={tempPreferences.notifications.dailyWeather}
                      onChange={(value) => updateNotificationPreference('dailyWeather', value)}
                      label="Daily Weather Summary"
                      description="Morning weather updates"
                    />

                    <Toggle
                      enabled={tempPreferences.notifications.severeAlerts}
                      onChange={(value) => updateNotificationPreference('severeAlerts', value)}
                      label="Severe Weather Alerts"
                      description="Warnings for storms, extreme weather"
                    />

                    <Toggle
                      enabled={tempPreferences.notifications.rainAlerts}
                      onChange={(value) => updateNotificationPreference('rainAlerts', value)}
                      label="Rain Alerts"
                      description="Notifications when rain is expected"
                    />

                    <Toggle
                      enabled={tempPreferences.notifications.uvAlerts}
                      onChange={(value) => updateNotificationPreference('uvAlerts', value)}
                      label="UV Index Warnings"
                      description="High UV level notifications"
                    />

                    <Toggle
                      enabled={tempPreferences.notifications.airQualityAlerts}
                      onChange={(value) => updateNotificationPreference('airQualityAlerts', value)}
                      label="Air Quality Alerts"
                      description="Poor air quality warnings"
                    />
                  </div>
                )}
              </div>
            </SettingSection>

            {/* Location & Privacy */}
            <SettingSection
              title="Location & Privacy"
              description="Manage location access and data privacy"
              icon={<Shield className="w-5 h-5 text-green-400" />}
            >
              <Toggle
                enabled={tempPreferences.autoLocation}
                onChange={(value) => updatePreference('autoLocation', value)}
                label="Auto-detect Location"
                description="Automatically use your current location for weather"
              />

              <Toggle
                enabled={tempPreferences.voiceSearch}
                onChange={(value) => updatePreference('voiceSearch', value)}
                label="Voice Search"
                description="Enable voice commands for weather queries"
              />

              <div className="p-4 bg-green-500/20 rounded-lg border border-green-400/30">
                <h4 className="font-medium text-white mb-2">Privacy Information</h4>
                <p className="text-sm text-white/70">
                  Your location data is only used to provide accurate weather information and is never shared with third parties. 
                  All data is processed securely and can be cleared at any time.
                </p>
              </div>
            </SettingSection>

            {/* Data & Storage */}
            <SettingSection
              title="Data & Storage"
              description="Manage app data and cache settings"
              icon={<Info className="w-5 h-5 text-orange-400" />}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <span className="text-white font-medium">Cache Size</span>
                    <p className="text-sm text-white/70">Weather data cache</p>
                  </div>
                  <span className="text-white/80">~2.5 MB</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <span className="text-white font-medium">Offline Data</span>
                    <p className="text-sm text-white/70">Last known weather data</p>
                  </div>
                  <span className="text-white/80">Available</span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-3 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-lg text-red-300 hover:text-red-200 transition-colors"
                >
                  Clear All Data
                </motion.button>
              </div>
            </SettingSection>
          </div>

          {/* App Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 p-6 bg-white/5 rounded-xl border border-white/10"
          >
            <h3 className="text-lg font-semibold text-white mb-4">About ClimaNow</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-white/70">Version:</span>
                <span className="text-white ml-2">1.0.0</span>
              </div>
              <div>
                <span className="text-white/70">Last Updated:</span>
                <span className="text-white ml-2">{new Date().toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-white/70">Data Sources:</span>
                <span className="text-white ml-2">OpenWeatherMap, AirVisual</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SettingsPage;
