"use client"
import React, { useState, useEffect } from 'react';

const LocationDetails = ({ formData, setFormData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [statesLoading, setStatesLoading] = useState(true);
  const [citiesLoading, setCitiesLoading] = useState(false);

  // Fetch states on mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/location/states`);
        const data = await response.json();
        setStates(data);
      } catch (error) {
        console.error('Error fetching states:', error);
      } finally {
        setStatesLoading(false);
      }
    };
    fetchStates();
  }, []);

  // Fetch cities when state changes
  useEffect(() => {
    const fetchCities = async () => {
      if (!formData.state) return;
      
      setCitiesLoading(true);
      try {
        const stateId = states.find(s => s.name === formData.state)?.id;
        if (!stateId) return;
        
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND}/location/cities?state=${stateId}`
        );
        const data = await response.json();
        setCities(data);
      } catch (error) {
        console.error('Error fetching cities:', error);
      } finally {
        setCitiesLoading(false);
      }
    };
    fetchCities();
  }, [formData.state, states]);

  const handleAutoFill = async () => {
    setIsLoading(true);

    try {
      // Get user's geolocation
      const position = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation is not supported by this browser."));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;

      // Fetch address details from Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch address');
      }

      const data = await response.json();
      const address = data.address;

      // Update location fields
      if (address) {
        setFormData(prev => ({
          ...prev,
          country: address.country || 'India',
          state: address.state || '',
          city: address.city || address.village || address.city_district || '',
          pincode: address.postcode || ''
        }));
      }

    } catch (error) {
      console.error('Error fetching location:', error);
      alert('Failed to fetch location. Please enter manually.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="grid gap-4 mb-4 grid-cols-2 sm:gap-6 sm:mb-5 p-4 w-full bg-gray-100 rounded-lg cursor-pointer dark:bg-gray-800">
      <div className="col-span-2">
        <button
          type="button"
          onClick={handleAutoFill}
          disabled={isLoading}
          className="w-full px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Fetching Location...
            </span>
          ) : (
            'Auto-fill My Location'
          )}
        </button>
      </div>
      <div className="w-full">
        <label htmlFor="country" className="block mb-2 text-sm font-bold text-gray-900 dark:text-white">
          Country
        </label>
        <input
          type="text"
          id="country"
          name="country"
          value={formData.country}
          onChange={handleChange}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
          placeholder="India"
          required
        />
      </div>
      <div className="w-full">
        <label htmlFor="state" className="block mb-2 text-sm font-bold text-gray-900 dark:text-white">
          State
        </label>
        <select
          id="state"
          name="state"
          value={formData.state}
          onChange={handleChange}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
          required
          disabled={statesLoading}
        >
          <option value="">Select State</option>
          {statesLoading && <option disabled>Loading states...</option>}
          {states.map((state) => (
            <option key={state.id} value={state.name}>
              {state.name}
            </option>
          ))}
        </select>
      </div>
      <div className="w-full">
        <label htmlFor="city" className="block mb-2 text-sm font-bold text-gray-900 dark:text-white">
          City
        </label>
        <select
          id="city"
          name="city"
          value={formData.city}
          onChange={handleChange}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
          required
          disabled={!formData.state || citiesLoading}
        >
          <option value="">Select City</option>
          {citiesLoading && <option disabled>Loading cities...</option>}
          {cities.map((city) => (
            <option key={city.name} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>
      </div>
      <div className="w-full">
        <label htmlFor="pincode" className="block mb-2 text-sm font-bold text-gray-900 dark:text-white">
          Pincode
        </label>
        <input
          type="number"
          id="pincode"
          name="pincode"
          value={formData.pincode}
          onChange={handleChange}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
          placeholder="753001"
          required
        />
      </div>
    </div>
  );
};

export default LocationDetails; 