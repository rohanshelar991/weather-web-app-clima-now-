import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  Mic, 
  MicOff, 
  Bot, 
  User, 
  Sparkles,
  CloudRain,
  Sun,
  Wind,
  Umbrella,
  Shirt,
  Car,
  Coffee,
  X
} from 'lucide-react';
import { 
  CurrentWeather, 
  CompleteWeatherData, 
  UserPreferences 
} from '../../types/weather';

interface WeatherAssistantProps {
  weatherData?: CompleteWeatherData;
  preferences: UserPreferences;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: number;
  suggestions?: string[];
  weatherContext?: any;
}

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ icon, label, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="flex items-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-colors"
  >
    {icon}
    <span>{label}</span>
  </motion.button>
);

const MessageBubble: React.FC<{ message: Message; onSuggestionClick: (text: string) => void }> = ({ 
  message, 
  onSuggestionClick 
}) => {
  const isUser = message.sender === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex items-start space-x-2 max-w-[80%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-blue-500' : 'bg-purple-500'
        }`}>
          {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
        </div>
        
        {/* Message */}
        <div className={`rounded-xl p-3 ${
          isUser 
            ? 'bg-blue-500/80 text-white' 
            : 'bg-white/10 backdrop-blur-md text-white border border-white/20'
        }`}>
          <p className="text-sm leading-relaxed">{message.text}</p>
          
          {/* Quick suggestions */}
          {message.suggestions && message.suggestions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.suggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSuggestionClick(suggestion)}
                  className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded-md text-xs text-white/90 transition-colors"
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const WeatherAssistant: React.FC<WeatherAssistantProps> = ({
  weatherData,
  preferences,
  isOpen,
  onClose,
  className = ''
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        text: `Hello! I'm your weather assistant. I can help you with weather insights, recommendations, and answer questions about current and future conditions. How can I help you today?`,
        sender: 'assistant',
        timestamp: Date.now(),
        suggestions: [
          'Should I carry an umbrella?',
          'What should I wear today?',
          'Is it good weather for outdoor activities?',
          'Will it rain today?'
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const generateAIResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Weather insights based on current data
    let responseText = '';
    let suggestions: string[] = [];

    if (!weatherData?.current) {
      responseText = "I don't have current weather data available. Please make sure your location is set and try again.";
    } else {
      const weather = weatherData.current;
      const temp = Math.round(weather.main.temp);
      const condition = weather.weather[0].main.toLowerCase();
      const description = weather.weather[0].description;
      const humidity = weather.main.humidity;
      const windSpeed = weather.wind.speed;
      const feelsLike = Math.round(weather.main.feels_like);

      if (lowerMessage.includes('umbrella') || lowerMessage.includes('rain')) {
        if (condition.includes('rain') || description.includes('rain')) {
          responseText = `Yes, definitely bring an umbrella! It's currently ${description} with a chance of rain. Better to be prepared!`;
          suggestions = ['What about my clothes?', 'How long will it rain?', 'Is it good for driving?'];
        } else {
          const hourlyRain = weatherData.hourlyForecast?.list?.slice(0, 6).some(item => 
            item.weather[0].main.toLowerCase().includes('rain') || item.pop > 0.3
          );
          if (hourlyRain) {
            responseText = `You might want to carry an umbrella! While it's not raining now, there's a chance of rain in the next few hours.`;
          } else {
            responseText = `No need for an umbrella today! The weather looks clear with ${description}. Perfect day to leave the umbrella at home.`;
          }
          suggestions = ['What should I wear?', 'Good for outdoor activities?', 'What about later today?'];
        }
      } else if (lowerMessage.includes('wear') || lowerMessage.includes('clothes') || lowerMessage.includes('dress')) {
        let clothingAdvice = '';
        if (temp < 10) {
          clothingAdvice = 'Bundle up! Wear a heavy coat, scarf, and gloves. It\'s quite cold outside.';
        } else if (temp < 20) {
          clothingAdvice = 'Layer up! A light jacket or sweater would be perfect. It\'s a bit chilly.';
        } else if (temp < 25) {
          clothingAdvice = 'Perfect weather for light clothing! A t-shirt and jeans or light pants would be ideal.';
        } else {
          clothingAdvice = 'It\'s warm! Light, breathable clothing like shorts and a t-shirt would be comfortable.';
        }
        
        if (windSpeed > 5) {
          clothingAdvice += ` It's a bit windy (${Math.round(windSpeed * 3.6)} km/h), so consider a light windbreaker.`;
        }
        
        responseText = `${clothingAdvice} Current temperature is ${temp}°C but it feels like ${feelsLike}°C.`;
        suggestions = ['Will it change later?', 'Good for exercise?', 'Need sunscreen?'];
      } else if (lowerMessage.includes('outdoor') || lowerMessage.includes('outside') || lowerMessage.includes('activities')) {
        if (condition.includes('thunderstorm') || condition.includes('storm')) {
          responseText = `Not ideal for outdoor activities right now. There's a ${description} - it's better to stay indoors until it passes.`;
        } else if (condition.includes('rain')) {
          responseText = `Outdoor activities might be limited due to ${description}. Consider indoor alternatives or wait for the weather to improve.`;
        } else if (windSpeed > 10) {
          responseText = `It's quite windy outside (${Math.round(windSpeed * 3.6)} km/h). Great for kite flying but might be challenging for other activities!`;
        } else {
          responseText = `Perfect weather for outdoor activities! With ${description} and ${temp}°C, it's a great day to be outside. Don't forget sunscreen if it's sunny!`;
        }
        suggestions = ['What about UV levels?', 'Air quality okay?', 'Best time of day?'];
      } else if (lowerMessage.includes('drive') || lowerMessage.includes('driving') || lowerMessage.includes('car')) {
        if (condition.includes('fog') || weather.visibility < 1000) {
          responseText = `Drive carefully! Visibility is reduced due to ${description}. Use fog lights and maintain extra distance.`;
        } else if (condition.includes('rain') || condition.includes('storm')) {
          responseText = `Take extra care while driving. ${description} can make roads slippery. Reduce speed and increase following distance.`;
        } else if (condition.includes('snow')) {
          responseText = `Winter driving conditions! ${description} - drive slowly, keep extra distance, and make sure you have winter tires.`;
        } else {
          responseText = `Good driving conditions! ${description} with clear visibility. Safe travels!`;
        }
        suggestions = ['Traffic conditions?', 'Best route?', 'Parking tips?'];
      } else if (lowerMessage.includes('uv') || lowerMessage.includes('sun') || lowerMessage.includes('sunscreen')) {
        const uvIndex = weatherData.uvIndex?.value || 0;
        if (uvIndex > 7) {
          responseText = `High UV levels today (${uvIndex})! Definitely wear sunscreen, a hat, and seek shade during peak hours (10am-4pm).`;
        } else if (uvIndex > 3) {
          responseText = `Moderate UV levels (${uvIndex}). Sunscreen is recommended, especially if you'll be outside for extended periods.`;
        } else {
          responseText = `Low UV levels today (${uvIndex}). Still good to wear sunscreen if you'll be out for a long time, but risk is minimal.`;
        }
        suggestions = ['Best time for sun?', 'What SPF to use?', 'Safe tanning time?'];
      } else if (lowerMessage.includes('air quality') || lowerMessage.includes('pollution')) {
        const aqi = weatherData.airQuality?.list?.[0]?.main?.aqi;
        if (aqi) {
          const aqiDescription = aqi === 1 ? 'Excellent' : aqi === 2 ? 'Good' : aqi === 3 ? 'Moderate' : aqi === 4 ? 'Poor' : 'Very Poor';
          responseText = `Air quality is ${aqiDescription} (AQI ${aqi}). `;
          if (aqi > 3) {
            responseText += `Consider limiting outdoor activities, especially if you have respiratory sensitivities.`;
          } else {
            responseText += `Great conditions for outdoor activities and exercise!`;
          }
        } else {
          responseText = `I don't have current air quality data available. Generally, if visibility is good and there's no haze, air quality should be acceptable.`;
        }
        suggestions = ['Exercise outdoors?', 'Open windows?', 'Mask needed?'];
      } else {
        // General weather summary
        responseText = `Currently it's ${temp}°C with ${description}. `;
        if (condition.includes('clear') || condition.includes('sun')) {
          responseText += `Beautiful weather! Great day to be outside and enjoy the sunshine. ☀️`;
        } else if (condition.includes('cloud')) {
          responseText += `Cloudy conditions, but still pleasant for most activities. 🌤️`;
        } else if (condition.includes('rain')) {
          responseText += `Rainy weather - perfect for cozy indoor activities or a refreshing walk with an umbrella! 🌧️`;
        }
        
        suggestions = [
          'Should I carry an umbrella?',
          'What should I wear?',
          'Good for outdoor activities?',
          'Air quality check'
        ];
      }
    }

    return {
      id: Date.now().toString(),
      text: responseText,
      sender: 'assistant',
      timestamp: Date.now(),
      suggestions,
      weatherContext: weatherData
    };
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputText);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleQuickAction = (text: string) => {
    setInputText(text);
    setTimeout(() => handleSendMessage(), 100);
  };

  const toggleListening = () => {
    if (!isListening) {
      // Start voice recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      }
    } else {
      setIsListening(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className={`fixed bottom-4 right-4 w-96 h-[600px] bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 flex flex-col z-50 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Weather Assistant</h3>
            <p className="text-xs text-white/70">AI-powered weather insights</p>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="text-white/70 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-white/10">
        <div className="flex flex-wrap gap-2">
          <QuickAction
            icon={<Umbrella className="w-4 h-4" />}
            label="Need umbrella?"
            onClick={() => handleQuickAction("Should I carry an umbrella today?")}
          />
          <QuickAction
            icon={<Shirt className="w-4 h-4" />}
            label="What to wear?"
            onClick={() => handleQuickAction("What should I wear today?")}
          />
          <QuickAction
            icon={<Sun className="w-4 h-4" />}
            label="Outdoor activities?"
            onClick={() => handleQuickAction("Is it good weather for outdoor activities?")}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onSuggestionClick={handleSuggestionClick}
            />
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
              <Bot className="w-4 h-4 text-purple-300" />
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/20">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me about the weather..."
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent"
            />
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleListening}
            className={`p-2 rounded-xl transition-colors ${
              isListening 
                ? 'bg-red-500/80 hover:bg-red-600 text-white' 
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="p-2 bg-purple-500/80 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white transition-colors"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default WeatherAssistant;
