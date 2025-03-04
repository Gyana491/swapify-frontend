"use client";
import { useState, useEffect } from 'react';
import { BiSearch, BiX, BiCurrentLocation } from 'react-icons/bi';
import { IoLocationSharp } from 'react-icons/io5';
import Cookies from 'js-cookie';
import { createPortal } from 'react-dom';

const popularCities = [
  {
    "display_name": "Mumbai, Maharashtra, India",
    "lat": "19.0760",
    "lon": "72.8777"
  },
  {
    "display_name": "Bangalore, Karnataka, India",
    "lat": "12.9716",
    "lon": "77.5946"
  },
  {
    "display_name": "Delhi, India",
    "lat": "28.7041",
    "lon": "77.1025"
  },
  {
    "display_name": "Chennai, Tamil Nadu, India",
    "lat": "13.0827",
    "lon": "80.2707"
  },
  {
    "display_name": "Hyderabad, Telangana, India",
    "lat": "17.3850",
    "lon": "78.4867"
  },
  {
    "display_name": "Pune, Maharashtra, India",
    "lat": "18.5204",
    "lon": "73.8567"
  },
  {
    "display_name": "Kolkata, West Bengal, India",
    "lat": "22.5726",
    "lon": "88.3639"
  },
  {
    "display_name": "Ahmedabad, Gujarat, India",
    "lat": "23.0225",
    "lon": "72.5714"
  },
  {
    "display_name": "Jaipur, Rajasthan, India",
    "lat": "26.9124",
    "lon": "75.7873"
  },
  {
    "display_name": "Chandigarh, India",
    "lat": "30.7333",
    "lon": "76.7794"
  }
];

const LocationModal = ({ isOpen, onClose, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  
  // State for selected location
  const [selectedLocation, setSelectedLocation] = useState({
    display_name: Cookies.get('display_name') || '',
    lat: Cookies.get('latitude') || '',
    lon: Cookies.get('longitude') || ''
  });

  // Function to fetch locations from Nominatim API
  const fetchLocations = async (query) => {
    if (query.length < 3) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}, India&limit=5`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (err) {
      setError('Failed to fetch locations');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery) {
        fetchLocations(searchQuery);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleLocationSelect = (location) => {
    const selectedData = {
      display_name: location.display_name,
      lat: location.lat,
      lon: location.lon
    };
    
    setSelectedLocation(selectedData);
    
    // Set cookies
    Cookies.set('display_name', location.display_name, { expires: 30 });
    Cookies.set('latitude', location.lat, { expires: 30 });
    Cookies.set('longitude', location.lon, { expires: 30 });
    
    onSelect(location.display_name);
    setSearchQuery('');
    setSuggestions([]);
    
    // Reload the page after selecting a location
    window.location.reload();
  };

  // Add auto-detect location function
  const detectLocation = async () => {
    setIsDetecting(true);
    setError(null);

    try {
      // Request location permission
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;

      // Fetch location details from Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
      );

      if (!response.ok) throw new Error('Failed to fetch location details');

      const data = await response.json();
      
      // Create location object
      const detectedLocation = {
        display_name: data.display_name,
        lat: latitude.toString(),
        lon: longitude.toString()
      };

      handleLocationSelect(detectedLocation);
    } catch (err) {
      console.error('Location detection error:', err);
      if (err.code === 1) {
        setError('Location permission denied. Please enable location access.');
      } else if (err.code === 2) {
        setError('Location unavailable. Please try again.');
      } else {
        setError('Failed to detect location. Please try again.');
      }
    } finally {
      setIsDetecting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] overflow-hidden">
      {/* Enhanced backdrop with better dark mode blur */}
      <div 
        className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-[99999] overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="relative w-full max-w-4xl transform overflow-hidden rounded-3xl 
            bg-white dark:bg-gray-900 shadow-2xl dark:shadow-2xl-dark
            transition-all duration-300 
            border border-gray-100 dark:border-gray-800">
            
            {/* Enhanced Modal Header with better dark mode gradient */}
            <div className="flex items-center justify-between p-6 border-b 
              border-gray-100 dark:border-gray-800/80
              bg-gradient-to-r from-gray-50/80 to-white/95 
              dark:from-gray-900 dark:to-gray-900/95
              backdrop-blur-sm">
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 
                  dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                  Select Location
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Choose your preferred location or search for a specific area
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-gray-400 
                  hover:bg-gray-100 hover:text-gray-600 
                  dark:hover:bg-gray-800/80 dark:hover:text-gray-300
                  transition-all duration-200 active:scale-95"
                aria-label="Close modal"
              >
                <BiX className="w-6 h-6" />
              </button>
            </div>

            {/* Enhanced Modal Body with better dark mode transitions */}
            <div className="p-6 space-y-6">
              <div className="space-y-4 max-w-2xl mx-auto">
                {/* Enhanced Search input with better dark mode states */}
                <div className="relative group">
                  <BiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 
                    text-gray-400 dark:text-gray-500 text-lg 
                    transition-colors group-hover:text-red-500 dark:group-hover:text-red-400" />
                  <input
                    type="text"
                    placeholder="Search for a location..."
                    className="w-full pl-12 pr-4 py-4 
                      bg-gray-50 dark:bg-gray-800/80 
                      border border-gray-200 dark:border-gray-700/80 
                      rounded-2xl text-base 
                      transition-all duration-200 
                      focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent 
                      hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600
                      text-gray-900 dark:text-gray-100
                      placeholder-gray-500 dark:placeholder-gray-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Enhanced Auto-detect button with better dark mode gradient */}
                <button
                  onClick={detectLocation}
                  disabled={isDetecting}
                  className="w-full flex items-center justify-center gap-3 px-4 py-4 
                    bg-gradient-to-r from-red-500 to-red-600 
                    dark:from-red-600 dark:to-red-700
                    hover:from-red-600 hover:to-red-700
                    dark:hover:from-red-700 dark:hover:to-red-800
                    text-white rounded-2xl text-base font-semibold 
                    transition-all duration-300 
                    hover:shadow-lg hover:-translate-y-0.5 
                    active:translate-y-0
                    disabled:opacity-50 disabled:cursor-not-allowed 
                    disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  <BiCurrentLocation className={`h-5 w-5 ${isDetecting ? 'animate-spin' : ''}`} />
                  {isDetecting ? 'Detecting location...' : 'Auto-detect my location'}
                </button>
              </div>

              {/* Enhanced Error message */}
              {error && (
                <div className="mt-4 p-4 text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-2xl max-w-2xl mx-auto border border-red-100 dark:border-red-800/30">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                </div>
              )}

              {/* Enhanced Selected Location with better dark mode gradient */}
              {selectedLocation.display_name && (
                <div className="my-6 max-w-2xl mx-auto">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                    Selected Location
                  </h4>
                  <div className="flex items-center gap-3 p-4 
                    bg-gradient-to-r from-red-50 to-red-100/80 
                    dark:from-red-900/20 dark:to-red-800/20 
                    text-red-600 dark:text-red-300 
                    rounded-2xl border border-red-100/80 
                    dark:border-red-800/20">
                    <IoLocationSharp className="flex-shrink-0 text-red-500 dark:text-red-400 text-xl" />
                    <span className="text-base font-medium dark:text-red-100 truncate">
                      {selectedLocation.display_name}
                    </span>
                  </div>
                </div>
              )}

              {/* Enhanced Popular Cities with better dark mode support */}
              {!searchQuery && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-bold 
                      text-gray-800 dark:text-gray-200">
                      Popular Cities
                    </h4>
                    <span className="px-3 py-1.5 text-xs font-semibold 
                      text-red-600 dark:text-red-400 
                      bg-red-50 dark:bg-red-900/30 
                      rounded-full">
                      {popularCities.length} cities
                    </span>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {popularCities.map((city) => (
                      <button
                        key={city.display_name}
                        onClick={() => handleLocationSelect(city)}
                        className="group p-5 
                          bg-white dark:bg-gray-800/50
                          hover:bg-gray-50 dark:hover:bg-gray-800 
                          rounded-2xl transition-all duration-300 
                          hover:shadow-lg dark:hover:shadow-lg-dark
                          hover:-translate-y-1 
                          border border-gray-100 dark:border-gray-700/50 
                          hover:border-gray-200 dark:hover:border-gray-600 
                          active:translate-y-0"
                      >
                        <div className="flex items-center gap-2">
                          <IoLocationSharp className="text-red-500 dark:text-red-400 
                            group-hover:text-red-600 dark:group-hover:text-red-300 
                            transition-colors flex-shrink-0" 
                            size={20} 
                          />
                          <div className="text-gray-900 dark:text-white font-semibold text-base truncate">
                            {city.display_name.split(',')[0]}
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 truncate">
                          {city.display_name.split(',').slice(1).join(',')}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced Search Results */}
              <div className="mt-4 max-h-[300px] overflow-y-auto">
                {isLoading && (
                  <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    <div className="animate-spin w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                    <p className="text-sm font-medium">Searching locations...</p>
                  </div>
                )}
                {suggestions.map((location) => (
                  <button
                    key={location.place_id}
                    onClick={() => handleLocationSelect(location)}
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 rounded-xl transition-all duration-200 
                    dark:hover:bg-gray-800 hover:shadow-sm group"
                  >
                    <IoLocationSharp className="flex-shrink-0 text-gray-400 group-hover:text-red-500 transition-colors text-lg" />
                    <div className="text-base font-medium text-gray-700 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white transition-colors">
                      {location.display_name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LocationModal;