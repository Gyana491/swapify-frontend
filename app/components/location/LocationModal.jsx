"use client";
import { useState, useEffect } from 'react';
import { BiSearch, BiX, BiCurrentLocation } from 'react-icons/bi';
import { IoLocationSharp } from 'react-icons/io5';
import Cookies from 'js-cookie';
import { createPortal } from 'react-dom';

const popularCities = [
    {
      display_name: "Mumbai, Maharashtra, India",
      lat: "19.075983",
      lon: "72.877655"
    },
    {
      display_name: "Bangalore, Karnataka, India",
      lat: "12.971599",
      lon: "77.594566"
    },
    {
      display_name: "Delhi, India",
      lat: "28.6139",
      lon: "77.2090"
    },
    {
      display_name: "Chennai, Tamil Nadu, India",
      lat: "13.08268",
      lon: "80.270721"
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
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-[99999] overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-900 dark:border dark:border-gray-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                Select Location
              </h3>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-500"
              >
                <BiX className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4">
              {/* Search and Auto-detect section */}
              <div className="space-y-4">
                {/* Search input */}
                <div className="relative">
                  <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for a location..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-[4px] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF3B30] focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Auto-detect button */}
                <button
                  onClick={detectLocation}
                  disabled={isDetecting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-[4px] text-sm font-medium text-gray-700 transition-colors duration-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <BiCurrentLocation className={`h-5 w-5 ${isDetecting ? 'animate-spin' : ''}`} />
                  {isDetecting ? 'Detecting location...' : 'Auto-detect my location'}
                </button>
              </div>

              {/* Error message */}
              {error && (
                <div className="mt-2 p-2 text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-[4px]">
                  {error}
                </div>
              )}

              {/* Selected Location */}
              {selectedLocation.display_name && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Selected Location</h4>
                  <div className="flex items-center gap-3 p-3 bg-red-50 text-red-600 rounded-[4px] dark:bg-red-900/30 dark:text-red-300">
                    <IoLocationSharp className="flex-shrink-0 text-red-600 dark:text-red-400" />
                    <span className="text-sm dark:text-red-100 truncate">
                      {selectedLocation.display_name}
                    </span>
                  </div>
                </div>
              )}

              {/* Popular Cities */}
              {!searchQuery && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Popular Cities</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {popularCities.map((city) => (
                      <button
                        key={city.display_name}
                        onClick={() => handleLocationSelect(city)}
                        className="flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-[4px] transition-colors dark:hover:bg-gray-800"
                      >
                        <IoLocationSharp className="flex-shrink-0 text-gray-400 dark:text-gray-500" />
                        <span className="text-sm dark:text-gray-200">
                          {city.display_name.split(',').slice(0, 2).join(', ')}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Results */}
              <div className="max-h-[300px] overflow-y-auto">
                {isLoading && <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading...</div>}
                {suggestions.map((location) => (
                  <button
                    key={location.place_id}
                    onClick={() => handleLocationSelect(location)}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-[4px] dark:hover:bg-gray-800"
                  >
                    <IoLocationSharp className="flex-shrink-0 text-gray-400 dark:text-gray-500" />
                    <div>
                      <div className="text-sm font-medium dark:text-gray-200">{location.display_name}</div>
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