import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Globe, Search, Loader, CheckCircle, AlertCircle, TrendingUp, Filter } from 'lucide-react';
import { GeocodingResult } from '../types/weather';
import { LocationService } from '../services/locationService';

interface GlobalWeatherCoverageProps {
  onCitySelect: (city: GeocodingResult) => void;
}

const GlobalWeatherCoverage: React.FC<GlobalWeatherCoverageProps> = ({ onCitySelect }) => {
  const [allCities, setAllCities] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedContinent, setSelectedContinent] = useState<string>('All');
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [countries, setCountries] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Continent to country code mapping
  const continentCountries: Record<string, string[]> = {
    'All': [], // Will show all cities
    'North America': ['US', 'CA', 'MX', 'GT', 'SV', 'HN', 'NI', 'CR', 'PA'],
    'South America': ['BR', 'AR', 'PE', 'CO', 'VE', 'CL', 'EC', 'BO', 'PY', 'UY', 'GY', 'SR', 'GF'],
    'Europe': ['GB', 'FR', 'DE', 'IT', 'ES', 'RU', 'SE', 'NO', 'DK', 'FI', 'NL', 'BE', 'AT', 'CH', 'GR', 'PT', 'CZ', 'PL', 'HU'],
    'Asia': ['JP', 'CN', 'IN', 'KR', 'SG', 'AE', 'TH', 'MY', 'ID', 'PH', 'VN', 'IL', 'TR', 'IR', 'HK', 'TW', 'SA'],
    'Africa': ['EG', 'NG', 'ZA', 'KE', 'MA', 'DZ', 'GH', 'ET', 'TZ', 'UG', 'ZW', 'ZM'],
    'Oceania': ['AU', 'NZ', 'FJ', 'PG', 'NC', 'SB', 'VU', 'WS', 'TO', 'TV', 'NR', 'KI', 'FM', 'MH'],
    'Middle East': ['AE', 'SA', 'IL', 'TR', 'IR', 'IQ', 'JO', 'LB', 'SY', 'YE', 'OM', 'QA', 'KW', 'BH']
  };

  const continents = Object.keys(continentCountries);

  // Load all cities on component mount
  useEffect(() => {
    const loadGlobalCities = async () => {
      try {
        setLoading(true);
        const cities = await LocationService.getGlobalCitiesData();
        setAllCities(cities);
        
        // Extract unique countries
        const countrySet = new Set(cities.map(city => city.country));
        const uniqueCountries: string[] = [];
        countrySet.forEach(country => uniqueCountries.push(country));
        uniqueCountries.sort();
        setCountries(uniqueCountries);
      } catch (err) {
        setError('Failed to load global cities data');
        console.error('Error loading global cities:', err);
      } finally {
        setLoading(false);
      }
    };

    loadGlobalCities();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await LocationService.searchCitiesByName(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error('Error searching cities:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Filter cities by continent and country
  const getFilteredCities = () => {
    let filtered = allCities;
    
    // Filter by continent
    if (selectedContinent !== 'All') {
      filtered = filtered.filter(city => 
        continentCountries[selectedContinent]?.includes(city.country)
      );
    }
    
    // Filter by country
    if (selectedCountry !== 'All') {
      filtered = filtered.filter(city => city.country === selectedCountry);
    }
    
    // Filter by search query if no specific search results
    if (searchQuery && searchResults.length === 0) {
      filtered = filtered.filter(city => 
        city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (city.state && city.state.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return filtered;
  };

  // Get statistics for coverage
  const getCoverageStats = () => {
    const totalCities = allCities.length;
    const countries = new Set(allCities.map(city => city.country));
    const totalCountries = countries.size;
    
    return {
      totalCities,
      totalCountries,
      continents: continents.length - 1, // Exclude 'All'
      coveragePercentage: Math.min(100, Math.round((totalCities / 100000) * 100)) // Estimate based on 100,000 cities
    };
  };

  const stats = getCoverageStats();

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="w-8 h-8 text-white/60 animate-spin mb-4" />
          <p className="text-white/60">Loading global weather coverage data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-8 h-8 text-red-400 mb-4" />
          <p className="text-white/60 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center">
          <Globe className="w-5 h-5 mr-2" />
          Global Weather Coverage
        </h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white/20 text-white/70'}`}
          >
            <div className="w-4 h-4 grid grid-cols-2 gap-1">
              <div className="bg-current rounded-sm"></div>
              <div className="bg-current rounded-sm"></div>
              <div className="bg-current rounded-sm"></div>
              <div className="bg-current rounded-sm"></div>
            </div>
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white/20 text-white/70'}`}
          >
            <div className="w-4 h-4 flex flex-col space-y-1">
              <div className="h-0.5 bg-current rounded-full"></div>
              <div className="h-0.5 bg-current rounded-full"></div>
              <div className="h-0.5 bg-current rounded-full"></div>
            </div>
          </button>
        </div>
      </div>

      {/* Coverage Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.totalCities.toLocaleString()}</div>
          <div className="text-sm text-white/70">Cities</div>
        </div>
        <div className="bg-white/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{stats.totalCountries}</div>
          <div className="text-sm text-white/70">Countries</div>
        </div>
        <div className="bg-white/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{stats.continents}</div>
          <div className="text-sm text-white/70">Continents</div>
        </div>
        <div className="bg-white/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{stats.coveragePercentage}%</div>
          <div className="text-sm text-white/70">Coverage</div>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for cities, towns, or villages worldwide..."
            className="w-full pl-10 pr-4 py-3 bg-white/20 rounded-xl border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white px-3 py-1 rounded-lg text-sm transition-colors flex items-center"
          >
            {isSearching ? (
              <>
                <Loader className="w-3 h-3 mr-1 animate-spin" />
                Searching...
              </>
            ) : 'Search'}
          </button>
        </div>
      </form>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            Search Results ({searchResults.length})
          </h3>
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-3 max-h-60 overflow-y-auto`}>
            {searchResults.map((city, index) => (
              <motion.button
                key={`${city.lat}-${city.lon}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onCitySelect(city)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-200 text-left group ${viewMode === 'list' ? 'flex items-center' : ''}`}
              >
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-white/60 mr-2 group-hover:text-white/80 transition-colors flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-white font-medium truncate">{city.name}</p>
                    <p className="text-white/60 text-sm truncate">
                      {city.state ? `${city.state}, ` : ''}{city.country}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
          <button 
            onClick={() => setSearchResults([])}
            className="mt-2 text-sm text-blue-400 hover:text-blue-300"
          >
            Clear search results
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <h3 className="text-sm font-semibold text-white/70 flex items-center">
          <Filter className="w-4 h-4 mr-1" />
          Filters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Continent Filter */}
          <div>
            <label className="block text-xs text-white/70 mb-1">Continent</label>
            <select
              value={selectedContinent}
              onChange={(e) => setSelectedContinent(e.target.value)}
              className="w-full px-3 py-2 bg-white/20 rounded-lg border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              {continents.map(continent => (
                <option key={continent} value={continent}>{continent}</option>
              ))}
            </select>
          </div>
          
          {/* Country Filter */}
          <div>
            <label className="block text-xs text-white/70 mb-1">Country</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-3 py-2 bg-white/20 rounded-lg border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="All">All Countries</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cities Grid/List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white/70">
            {selectedContinent === 'All' ? 'Global Cities' : selectedContinent} 
            {selectedCountry !== 'All' && ` - ${selectedCountry}`}
            <span className="text-white/50 ml-2">
              ({getFilteredCities().length} cities)
            </span>
          </h3>
        </div>
        
        {getFilteredCities().length > 0 ? (
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6' : 'grid-cols-1'} gap-3 max-h-96 overflow-y-auto`}>
            {getFilteredCities().map((city, index) => (
              <motion.button
                key={`${city.lat}-${city.lon}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => onCitySelect(city)}
                whileHover={{ scale: viewMode === 'grid' ? 1.05 : 1 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-200 text-center group ${viewMode === 'list' ? 'flex items-center text-left' : 'text-center'}`}
              >
                {viewMode === 'grid' ? (
                  <>
                    <MapPin className="w-3 h-3 text-white/60 mx-auto mb-1 group-hover:text-white/80 transition-colors" />
                    <p className="text-white truncate text-xs">{city.name}</p>
                    <p className="text-white/60 truncate text-xs">{city.country}</p>
                    {city.state && (
                      <p className="text-white/50 truncate text-xs">{city.state}</p>
                    )}
                  </>
                ) : (
                  <div className="flex items-center w-full">
                    <MapPin className="w-4 h-4 text-white/60 mr-2 group-hover:text-white/80 transition-colors flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-white truncate">{city.name}</p>
                      <p className="text-white/60 text-sm truncate">
                        {city.state ? `${city.state}, ` : ''}{city.country}
                      </p>
                    </div>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-white/60">
            <p>No cities found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Coverage Features */}
      <div className="mt-8 pt-6 border-t border-white/20">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
          Comprehensive Global Coverage Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-xl p-4">
            <h4 className="font-medium text-white mb-2">Cities & Towns</h4>
            <p className="text-sm text-white/70">Access weather data for cities, towns, and villages worldwide, from major metropolitan areas to remote locations.</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <h4 className="font-medium text-white mb-2">Regional Coverage</h4>
            <p className="text-sm text-white/70">Comprehensive coverage of all states, provinces, and regions within every country across all continents.</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <h4 className="font-medium text-white mb-2">Multi-Continent Support</h4>
            <p className="text-sm text-white/70">Weather data for all inhabited places across North America, South America, Europe, Asia, Africa, Oceania, and the Middle East.</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <h4 className="font-medium text-white mb-2">Advanced Search</h4>
            <p className="text-sm text-white/70">Search by city name, country, state/province, or continent with intelligent filtering and suggestions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalWeatherCoverage;