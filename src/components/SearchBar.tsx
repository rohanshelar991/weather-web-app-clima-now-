import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, MapPin, Loader2, Filter, Globe } from 'lucide-react';
import { GeocodingResult } from '../types/weather';
import { LocationService } from '../services/locationService';

interface SearchBarProps {
  onLocationSelect: (location: GeocodingResult) => void;
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onLocationSelect,
  placeholder = "Search for a city worldwide...",
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedContinent, setSelectedContinent] = useState<string>('');
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

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

  // Get all unique countries from continent mapping
  const getAllCountries = (): string[] => {
    const countries = new Set<string>();
    Object.values(continentCountries).forEach(countryList => {
      countryList.forEach(country => countries.add(country));
    });
    return Array.from(countries).sort();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    // Debounce search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        // Use advanced search with filters if applicable
        let results: GeocodingResult[] = [];
        
        if (selectedCountry) {
          // Search within specific country
          results = await LocationService.advancedCitySearch(query, selectedCountry);
        } else if (selectedContinent) {
          // Search within specific continent
          const countriesInContinent = continentCountries[selectedContinent] || [];
          let allResults: GeocodingResult[] = [];
          
          // Search in each country of the continent
          for (const country of countriesInContinent.slice(0, 5)) { // Limit to 5 countries for performance
            const countryResults = await LocationService.advancedCitySearch(query, country);
            allResults = [...allResults, ...countryResults];
            
            // Limit results to prevent overwhelming
            if (allResults.length > 20) break;
          }
          
          results = allResults.slice(0, 20);
        } else {
          // Regular search
          results = await LocationService.getCitySuggestions(query);
        }
        
        setSuggestions(results);
        setIsOpen(results.length > 0);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, selectedCountry, selectedContinent]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          selectLocation(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const selectLocation = (location: GeocodingResult) => {
    onLocationSelect(location);
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    setSelectedCountry('');
    setSelectedContinent('');
    setShowFilters(false);
    inputRef.current?.blur();
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    setSelectedCountry('');
    setSelectedContinent('');
    setShowFilters(false);
    inputRef.current?.focus();
  };

  const formatLocationName = (location: GeocodingResult): string => {
    return location.state 
      ? `${location.name}, ${location.state}, ${location.country}`
      : `${location.name}, ${location.country}`;
  };

  const handleFilterChange = (filterType: 'country' | 'continent', value: string) => {
    if (filterType === 'country') {
      setSelectedCountry(value);
      setSelectedContinent('');
    } else {
      setSelectedContinent(value);
      setSelectedCountry('');
    }
    setShowFilters(false);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-20 py-3 bg-white/20 backdrop-blur-md border border-white/30 
                   rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 
                   focus:ring-white/50 focus:border-white/50 transition-all duration-200"
        />
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowFilters(!showFilters)}
            className="w-5 h-5 text-white/70 hover:text-white transition-colors"
          >
            <Filter className="w-full h-full" />
          </motion.button>
          
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-white/70 animate-spin" />
          ) : query.length > 0 ? (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={clearSearch}
              className="w-5 h-5 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-full h-full" />
            </motion.button>
          ) : null}
        </div>
      </div>

      {/* Filter Options */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-md 
                     border border-white/30 rounded-xl shadow-xl z-50 p-4"
          >
            <div className="flex items-center mb-3">
              <Globe className="w-4 h-4 mr-2 text-gray-600" />
              <h3 className="text-gray-800 font-medium">Search Filters</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Continent</label>
                <select
                  value={selectedContinent}
                  onChange={(e) => handleFilterChange('continent', e.target.value)}
                  className="w-full p-2 bg-white border border-gray-300 rounded-lg text-gray-800 text-sm"
                >
                  <option value="">All Continents</option>
                  {Object.keys(continentCountries).map(continent => (
                    <option key={continent} value={continent}>{continent}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-700 mb-1">Country</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
                  className="w-full p-2 bg-white border border-gray-300 rounded-lg text-gray-800 text-sm"
                >
                  <option value="">All Countries</option>
                  {getAllCountries().map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {(selectedCountry || selectedContinent) && (
              <button
                onClick={() => {
                  setSelectedCountry('');
                  setSelectedContinent('');
                }}
                className="mt-3 text-sm text-blue-600 hover:text-blue-800"
              >
                Clear Filters
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-md 
                     border border-white/30 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto"
          >
            {suggestions.map((location, index) => (
              <motion.button
                key={`${location.lat}-${location.lon}-${location.name}-${index}`}
                whileHover={{ scale: 1.02 }}
                onClick={() => selectLocation(location)}
                className={`w-full px-4 py-3 text-left flex items-center hover:bg-white/20 
                         transition-colors border-b border-white/10 last:border-b-0
                         ${index === selectedIndex ? 'bg-white/20' : ''}`}
              >
                <MapPin className="w-4 h-4 mr-3 text-gray-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 font-medium truncate">
                    {location.name}
                  </p>
                  <p className="text-gray-600 text-sm truncate">
                    {location.state ? `${location.state}, ` : ''}{location.country}
                  </p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;