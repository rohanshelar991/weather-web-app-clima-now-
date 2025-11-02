import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Loader, Sparkles, Languages } from 'lucide-react';

interface VoiceSearchProps {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
  placeholder?: string;
  language?: string;
  className?: string;
  disabled?: boolean;
  onLanguageChange?: (language: string) => void;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI: string;
  grammars: any;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: any) => void) | null;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

// Supported languages for voice recognition
const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'pt-BR', name: 'Portuguese' },
  { code: 'ru-RU', name: 'Russian' },
  { code: 'ja-JP', name: 'Japanese' },
  { code: 'zh-CN', name: 'Chinese' },
];

const VoiceSearch: React.FC<VoiceSearchProps> = ({
  onResult,
  onError,
  placeholder = "Say something...",
  language = 'en-US',
  className = '',
  disabled = false,
  onLanguageChange
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [isLanguageSelectorOpen, setIsLanguageSelectorOpen] = useState(false);
  const [commandSuggestions, setCommandSuggestions] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const speechSynth = window.speechSynthesis;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognitionInstance = new SpeechRecognition() as SpeechRecognition;
      
      // Configure recognition
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = language;
      recognitionInstance.maxAlternatives = 1;
      
      setRecognition(recognitionInstance);
    } else {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser');
    }

    if (speechSynth) {
      setSpeechSynthesis(speechSynth);
    }
  }, [language]);

  // Set up event listeners
  useEffect(() => {
    if (!recognition) return;

    const handleStart = () => {
      setIsListening(true);
      setError(null);
      setTranscript('');
      setConfidence(0);
      setCommandSuggestions([]);
    };

    const handleEnd = () => {
      setIsListening(false);
      setIsProcessing(false);
    };

    const handleResult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
          setConfidence(result[0].confidence);
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      const fullTranscript = finalTranscript || interimTranscript;
      setTranscript(fullTranscript);

      if (finalTranscript) {
        setIsProcessing(true);
        processVoiceCommand(finalTranscript.trim());
      }
    };

    const handleError = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      setIsProcessing(false);
      
      let errorMessage = 'Speech recognition failed';
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone not accessible. Please check permissions.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please enable microphone permissions.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        case 'aborted':
          errorMessage = 'Speech recognition was aborted.';
          break;
      }
      
      setError(errorMessage);
      onError?.(errorMessage);
      speakResult(errorMessage);
    };

    recognition.onstart = handleStart;
    recognition.onend = handleEnd;
    recognition.onresult = handleResult;
    recognition.onerror = handleError;

    return () => {
      if (recognition) {
        recognition.onstart = null;
        recognition.onend = null;
        recognition.onresult = null;
        recognition.onerror = null;
      }
    };
  }, [recognition, onResult, onError]);

  // Process voice commands with natural language understanding
  const processVoiceCommand = useCallback((command: string) => {
    const lowerCommand = command.toLowerCase();
    
    // Generate context-aware suggestions
    const suggestions: string[] = [];
    
    if (lowerCommand.includes('weather') || lowerCommand.includes('temperature') || lowerCommand.includes('forecast')) {
      suggestions.push('What is the current temperature?', 'Will it rain today?', 'What is the 7-day forecast?');
    }
    
    if (lowerCommand.includes('location') || lowerCommand.includes('city') || lowerCommand.includes('place')) {
      suggestions.push('Show weather for New York', 'Find weather in London', 'Weather in Tokyo');
    }
    
    if (lowerCommand.includes('air') || lowerCommand.includes('quality') || lowerCommand.includes('pollution')) {
      suggestions.push('What is the air quality?', 'Check pollution levels', 'Is it safe to go outside?');
    }
    
    if (lowerCommand.includes('map') || lowerCommand.includes('view')) {
      suggestions.push('Show weather map', 'Display precipitation map', 'View temperature map');
    }
    
    setCommandSuggestions(suggestions);
    
    // Process the command after a short delay to allow for suggestions
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      onResult(command);
      setIsProcessing(false);
      speakResult('Command received');
    }, 2000);
  }, [onResult]);

  // Speech synthesis for accessibility
  const speakResult = useCallback((text: string) => {
    if (!speechSynthesis) return;
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = 0.5;
    utterance.rate = 1;
    utterance.pitch = 1;
    
    speechSynthesis.speak(utterance);
  }, [speechSynthesis]);

  // Start/stop voice recognition
  const toggleListening = useCallback(() => {
    if (!recognition || disabled) return;

    if (isListening) {
      recognition.stop();
      speakResult('Voice recognition stopped');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    } else {
      try {
        recognition.start();
        speakResult('Listening for voice command');
      } catch (err) {
        console.error('Failed to start recognition:', err);
        setError('Failed to start voice recognition');
      }
    }
  }, [recognition, isListening, disabled, speakResult]);

  // Keyboard accessibility
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleListening();
    }
  };

  // Handle language change
  const handleLanguageSelect = (langCode: string) => {
    if (onLanguageChange) {
      onLanguageChange(langCode);
      setIsLanguageSelectorOpen(false);
    }
  };

  // Get visual feedback based on state
  const getButtonState = () => {
    if (disabled) return 'disabled';
    if (error) return 'error';
    if (isProcessing) return 'processing';
    if (isListening) return 'listening';
    return 'idle';
  };

  const buttonStates = {
    idle: {
      bg: 'bg-blue-500/20 hover:bg-blue-500/30',
      text: 'text-blue-400',
      border: 'border-blue-400/30',
      icon: Mic
    },
    listening: {
      bg: 'bg-red-500/20 hover:bg-red-500/30',
      text: 'text-red-400',
      border: 'border-red-400/30',
      icon: MicOff
    },
    processing: {
      bg: 'bg-purple-500/20 hover:bg-purple-500/30',
      text: 'text-purple-400',
      border: 'border-purple-400/30',
      icon: Loader
    },
    error: {
      bg: 'bg-red-500/20',
      text: 'text-red-400',
      border: 'border-red-400/50',
      icon: MicOff
    },
    disabled: {
      bg: 'bg-gray-500/20',
      text: 'text-gray-400',
      border: 'border-gray-400/30',
      icon: MicOff
    }
  };

  const currentState = buttonStates[getButtonState()];
  const IconComponent = currentState.icon;

  if (!isSupported) {
    return (
      <div 
        className={`flex items-center space-x-2 text-gray-400 text-sm ${className}`}
        aria-label="Voice search not supported"
      >
        <MicOff className="w-4 h-4" />
        <span>Voice search not available</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      {/* Language selector */}
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsLanguageSelectorOpen(!isLanguageSelectorOpen)}
          className="flex items-center space-x-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white transition-colors"
        >
          <Languages className="w-3 h-3" />
          <span>
            {SUPPORTED_LANGUAGES.find(lang => lang.code === language)?.name || 'English'}
          </span>
        </motion.button>
        
        <AnimatePresence>
          {isLanguageSelectorOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-1 w-48 bg-black/50 backdrop-blur-md rounded-lg border border-white/20 z-50"
            >
              <div className="p-2 max-h-60 overflow-y-auto">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang.code)}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                      language === lang.code
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Main voice button */}
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        onClick={toggleListening}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          relative flex items-center justify-center w-12 h-12 rounded-full 
          border ${currentState.border} ${currentState.bg} ${currentState.text}
          transition-all duration-200 focus:outline-none focus:ring-2 
          focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-transparent
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        `}
        aria-label={
          isListening 
            ? 'Stop voice recognition' 
            : 'Start voice recognition'
        }
        aria-pressed={isListening}
        role="button"
        tabIndex={0}
      >
        <AnimatePresence mode="wait">
          {isListening ? (
            <motion.div
              key="listening"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="flex items-center justify-center"
            >
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1 h-4 bg-current rounded-full"
                    animate={{
                      scaleY: [1, 2, 1],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
            </motion.div>
          ) : isProcessing ? (
            <motion.div
              key="processing"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="flex items-center justify-center"
            >
              <Loader className="w-6 h-6 animate-spin" />
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <IconComponent className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse animation for listening state */}
        {isListening && (
          <motion.div
            className="absolute inset-0 rounded-full border border-red-400/50"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.button>

      {/* Status display */}
      <AnimatePresence>
        {(isListening || transcript || error || commandSuggestions.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center max-w-xs"
          >
            {isListening && !transcript && (
              <p 
                className="text-sm text-blue-400 animate-pulse"
                aria-live="polite"
              >
                {placeholder}
              </p>
            )}
            
            {transcript && (
              <div className="space-y-1">
                <p 
                  className="text-sm text-white font-medium"
                  aria-live="polite"
                  aria-label={`Voice input: ${transcript}`}
                >
                  "{transcript}"
                </p>
                {confidence > 0 && (
                  <p className="text-xs text-gray-400">
                    Confidence: {Math.round(confidence * 100)}%
                  </p>
                )}
              </div>
            )}
            
            {commandSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 p-2 bg-white/10 rounded-lg"
              >
                <div className="flex items-center text-xs text-white/70 mb-1">
                  <Sparkles className="w-3 h-3 mr-1" />
                  <span>Suggested follow-ups:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {commandSuggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => {
                        setTranscript(suggestion);
                        onResult(suggestion);
                      }}
                      className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-xs text-white transition-colors"
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
            
            {error && (
              <p 
                className="text-sm text-red-400"
                aria-live="assertive"
                role="alert"
              >
                {error}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions for first-time users */}
      {!isListening && !transcript && !error && (
        <p className="text-xs text-gray-500 text-center max-w-xs">
          Click the microphone or press Enter/Space to start voice search
        </p>
      )}

      {/* Screen reader only instructions */}
      <div className="sr-only">
        <p>
          Voice search is {isSupported ? 'available' : 'not supported'}. 
          {isSupported && !disabled && (
            <>
              {isListening 
                ? 'Currently listening for your voice command.' 
                : 'Activate to start voice recognition.'
              }
            </>
          )}
        </p>
        {error && <p role="alert">Error: {error}</p>}
        {transcript && <p>Voice input received: {transcript}</p>}
      </div>
    </div>
  );
};

export default VoiceSearch;