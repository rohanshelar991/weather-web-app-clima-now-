import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Globe, Search, Loader, BarChart3, Filter, TrendingUp } from 'lucide-react';
import { GeocodingResult } from '../../types/weather';
import { LocationService } from '../../services/locationService';

interface WorldMapProps {
  onCitySelect: (city: GeocodingResult) => void;
}

const WorldMap: React.FC<WorldMapProps> = ({ onCitySelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [allCities, setAllCities] = useState<GeocodingResult[]>([]);
  const [loadingAllCities, setLoadingAllCities] = useState(false);
  const [selectedContinent, setSelectedContinent] = useState<string>('All');
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [countries, setCountries] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [coverageStats, setCoverageStats] = useState({
    totalCities: 0,
    totalCountries: 0,
    continents: 0
  });

  // Major world cities for quick access
  const majorCities = [
    { name: 'New York', country: 'US', lat: 40.7128, lon: -74.0060 },
    { name: 'London', country: 'GB', lat: 51.5074, lon: -0.1278 },
    { name: 'Tokyo', country: 'JP', lat: 35.6762, lon: 139.6503 },
    { name: 'Paris', country: 'FR', lat: 48.8566, lon: 2.3522 },
    { name: 'Sydney', country: 'AU', lat: -33.8688, lon: 151.2093 },
    { name: 'Mumbai', country: 'IN', lat: 19.0760, lon: 72.8777 },
    { name: 'Dubai', country: 'AE', lat: 25.2048, lon: 55.2708 },
    { name: 'Singapore', country: 'SG', lat: 1.3521, lon: 103.8198 },
    { name: 'São Paulo', country: 'BR', lat: -23.5558, lon: -46.6396 },
    { name: 'Berlin', country: 'DE', lat: 52.5200, lon: 13.4050 },
    { name: 'Beijing', country: 'CN', lat: 39.9042, lon: 116.4074 },
    { name: 'Cairo', country: 'EG', lat: 30.0444, lon: 31.2357 },
  ];

  // Continent options
  const continents = [
    'All',
    'North America',
    'South America',
    'Europe',
    'Asia',
    'Africa',
    'Oceania',
    'Middle East'
  ];

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

  // Load all cities on component mount
  useEffect(() => {
    const loadAllCities = async () => {
      setLoadingAllCities(true);
      try {
        const cities = await LocationService.getGlobalCitiesData();
        setAllCities(cities);
        
        // Extract unique countries
        const countrySet = new Set(cities.map(city => city.country));
        const uniqueCountries: string[] = [];
        countrySet.forEach(country => uniqueCountries.push(country));
        uniqueCountries.sort();
        setCountries(uniqueCountries);
        
        // Calculate coverage statistics
        setCoverageStats({
          totalCities: cities.length,
          totalCountries: countrySet.size,
          continents: continents.filter(c => c !== 'All').length
        });
      } catch (error) {
        console.error('Error loading all cities:', error);
      } finally {
        setLoadingAllCities(false);
      }
    };

    loadAllCities();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await LocationService.searchCitiesByName(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching cities:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCityClick = (city: GeocodingResult) => {
    onCitySelect(city);
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

  // Get unique countries from all cities
  const getUniqueCountries = () => {
    const countries = new Set(allCities.map(city => city.country));
    return Array.from(countries).sort();
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center">
          <Globe className="w-5 h-5 mr-2" />
          World Cities Explorer
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
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white/10 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-blue-400">{coverageStats.totalCities.toLocaleString()}</div>
          <div className="text-xs text-white/70">Cities</div>
        </div>
        <div className="bg-white/10 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-green-400">{coverageStats.totalCountries}</div>
          <div className="text-xs text-white/70">Countries</div>
        </div>
        <div className="bg-white/10 rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-purple-400">{coverageStats.continents}</div>
          <div className="text-xs text-white/70">Continents</div>
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
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleCityClick(city)}
                className={`w-full text-left p-3 rounded-lg hover:bg-white/10 transition-colors group mb-2 ${viewMode === 'list' ? 'flex items-center' : ''}`}
              >
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-white/60 mr-2 group-hover:text-white/80 transition-colors flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="text-white font-medium truncate block">{city.name}</span>
                    <span className="text-white/60 text-sm truncate block">
                      {city.state ? `${city.state}, ` : ''}{city.country}
                    </span>
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

      {/* All Cities by Continent */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center">
          <BarChart3 className="w-4 h-4 mr-1" />
          {selectedContinent === 'All' ? 'Global Cities' : selectedContinent}
          {selectedCountry !== 'All' && ` - ${selectedCountry}`}
          <span className="text-white/50 ml-2 text-xs">
            ({getFilteredCities().length} cities)
          </span>
        </h3>
        {loadingAllCities ? (
          <div className="flex justify-center items-center py-8">
            <Loader className="w-6 h-6 text-white/60 animate-spin" />
            <span className="ml-2 text-white/60">Loading global cities data...</span>
          </div>
        ) : (
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6' : 'grid-cols-1'} gap-3 max-h-96 overflow-y-auto`}>
            {getFilteredCities().map((city, index) => (
              <motion.button
                key={`${city.lat}-${city.lon}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => handleCityClick(city)}
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
        )}
      </div>

      {/* Major Cities Grid */}
      <div>
        <h3 className="text-sm font-semibold text-white/70 mb-3">Major World Cities</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {majorCities.map((city, index) => (
            <motion.button
              key={`${city.lat}-${city.lon}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleCityClick(city)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-200 text-center group"
            >
              <MapPin className="w-4 h-4 text-white/60 mx-auto mb-1 group-hover:text-white/80 transition-colors" />
              <p className="text-white text-xs font-medium truncate">{city.name}</p>
              <p className="text-white/60 text-xs truncate">{city.country}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorldMap;