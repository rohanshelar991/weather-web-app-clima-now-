import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Clock, X, Loader, Globe, Filter } from 'lucide-react';
import { GeocodingResult } from '../../types/weather';
import { LocationService } from '../../services/locationService';

interface EnhancedSearchBarProps {
  onLocationSelect: (location: GeocodingResult) => void;
  placeholder?: string;
  className?: string;
}

const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({
  onLocationSelect,
  placeholder = "🌍 Search for any city worldwide...",
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
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
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentWeatherSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved).slice(0, 5));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length > 1) {
      setIsLoading(true);
      debounceRef.current = setTimeout(async () => {
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
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setIsLoading(false);
    }
  }, [query, selectedCountry, selectedContinent]);

  const handleLocationSelect = (location: GeocodingResult) => {
    const cityName = location.state 
      ? `${location.name}, ${location.state}, ${location.country}`
      : `${location.name}, ${location.country}`;
    setQuery(cityName);
    setSuggestions([]);
    setIsFocused(false);
    setShowFilters(false);
    
    // Save to recent searches
    const updatedRecent = [cityName, ...recentSearches.filter(s => s !== cityName)].slice(0, 5);
    setRecentSearches(updatedRecent);
    localStorage.setItem('recentWeatherSearches', JSON.stringify(updatedRecent));
    
    onLocationSelect(location);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setSelectedCountry('');
    setSelectedContinent('');
    setShowFilters(false);
    inputRef.current?.focus();
  };

  const handleRecentSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    // You might want to trigger a search here
  };

  // Function to handle search submission
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      // If the query is a city name, search for it
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
        results = await LocationService.searchCitiesByName(query);
      }
      
      if (results.length > 0) {
        handleLocationSelect(results[0]);
      } else {
        // Show no results message
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error searching for city:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle advanced search
  const handleAdvancedSearch = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      // Try different search approaches
      let results: GeocodingResult[] = [];
      
      // 1. Exact name search
      results = await LocationService.searchCitiesByName(query);
      
      // 2. If no results, try fuzzy search
      if (results.length === 0) {
        const apiResponse = await LocationService.advancedCitySearch(query);
        results = apiResponse;
      }
      
      // 3. If still no results, try country search
      if (results.length === 0) {
        const apiResponse = await LocationService.searchCitiesByCountry(query);
        results = apiResponse;
      }
      
      setSuggestions(results);
    } catch (error) {
      console.error('Error in advanced search:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
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
    <div ref={searchRef} className={`relative w-full max-w-lg mx-auto ${className}`}>
      {/* Search Input Container */}
      <motion.div
        animate={{
          scale: isFocused ? 1.02 : 1,
          boxShadow: isFocused
            ? '0 20px 40px rgba(0, 0, 0, 0.3)'
            : '0 10px 20px rgba(0, 0, 0, 0.2)'
        }}
        transition={{ duration: 0.2 }}
        className="relative"
      >
        <form onSubmit={handleSearchSubmit}>
          <div className="relative bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 overflow-hidden">
            {/* Search Icon */}
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
              {isLoading ? (
                <Loader className="w-5 h-5 text-white/70 animate-spin" />
              ) : (
                <Search className="w-5 h-5 text-white/70" />
              )}
            </div>

            {/* Input Field */}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder={placeholder}
              className="w-full pl-12 pr-12 py-4 bg-transparent text-white placeholder-white/60 text-lg focus:outline-none"
            />

            {/* Filter and Clear Buttons */}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowFilters(!showFilters)}
                type="button"
                className="p-1 rounded-full hover:bg-white/20 transition-colors"
              >
                <Filter className="w-4 h-4 text-white/70" />
              </motion.button>
              
              {query && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={clearSearch}
                  type="button"
                  className="p-1 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4 text-white/70" />
                </motion.button>
              )}
            </div>
          </div>
        </form>

        {/* Animated Border */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          animate={{
            background: isFocused
              ? 'linear-gradient(45deg, rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.5))'
              : 'transparent'
          }}
          style={{
            padding: '2px',
            zIndex: -1
          }}
        />
      </motion.div>

      {/* Filter Options */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl z-50 p-4"
          >
            <div className="flex items-center mb-3">
              <Globe className="w-4 h-4 mr-2 text-white/70" />
              <h3 className="text-white font-medium">Search Filters</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-white/70 mb-1">Continent</label>
                <select
                  value={selectedContinent}
                  onChange={(e) => handleFilterChange('continent', e.target.value)}
                  className="w-full p-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm"
                >
                  <option value="">All Continents</option>
                  {Object.keys(continentCountries).map(continent => (
                    <option key={continent} value={continent} className="text-gray-800">{continent}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-white/70 mb-1">Country</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
                  className="w-full p-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm"
                >
                  <option value="">All Countries</option>
                  {getAllCountries().map(country => (
                    <option key={country} value={country} className="text-gray-800">{country}</option>
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
                className="mt-3 text-sm text-blue-300 hover:text-blue-200"
              >
                Clear Filters
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {isFocused && (suggestions.length > 0 || recentSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl z-50 overflow-hidden"
          >
            {/* Recent Searches */}
            {query.length === 0 && recentSearches.length > 0 && (
              <div className="p-4 border-b border-white/20">
                <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Recent Searches
                </h3>
                {recentSearches.map((search, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleRecentSearch(search)}
                    className="w-full text-left p-2 rounded-lg hover:bg-white/10 transition-colors text-white/80 text-sm"
                  >
                    {search}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Search Suggestions */}
            {suggestions.length > 0 && (
              <div className="max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={`${suggestion.lat}-${suggestion.lon}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleLocationSelect(suggestion)}
                    className="w-full text-left p-4 hover:bg-white/10 transition-colors group"
                  >
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 text-white/60 mr-3 mt-1 group-hover:text-white/80 transition-colors" />
                      <div>
                        <p className="text-white font-medium text-sm">
                          {suggestion.name}
                        </p>
                        <p className="text-white/60 text-xs">
                          {suggestion.state && `${suggestion.state}, `}
                          {suggestion.country}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {/* No Results */}
            {query.length > 1 && !isLoading && suggestions.length === 0 && (
              <div className="p-4 text-center">
                <p className="text-white/60 text-sm">No cities found for "{query}"</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAdvancedSearch}
                  className="mt-2 text-blue-300 hover:text-blue-200 text-sm underline"
                >
                  Try advanced search
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Tips */}
      {isFocused && query.length === 0 && recentSearches.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-2 p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/30"
        >
          <p className="text-white/70 text-sm text-center">
            💡 Try searching for cities like "New York", "London", or "Tokyo"
          </p>
          <p className="text-white/50 text-xs text-center mt-1">
            You can also search by country or region
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default EnhancedSearchBar;