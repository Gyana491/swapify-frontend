"use client";

import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import ListingsContainer from './ListingsContainer';

const MyListingsClient = () => {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  // Filter listings based on active filter
  const filterListings = (listings, filter) => {
    if (filter === 'all') {
      return listings;
    }
    return listings.filter(listing => listing.status === filter);
  };

  // Update filtered listings when listings or filter changes
  useEffect(() => {
    const filtered = filterListings(listings, activeFilter);
    setFilteredListings(filtered);
  }, [listings, activeFilter]);

  // Listen for status updates from child components
  useEffect(() => {
    const handleStatusUpdate = (event) => {
      const { listingId, newStatus } = event.detail;
      setListings(prevListings =>
        prevListings.map(listing =>
          listing._id === listingId
            ? { ...listing, status: newStatus }
            : listing
        )
      );
    };

    window.addEventListener('listingStatusUpdated', handleStatusUpdate);

    return () => {
      window.removeEventListener('listingStatusUpdated', handleStatusUpdate);
    };
  }, []);

  useEffect(() => {
    const token = Cookies.get('token');

    if (!token) {
      setError('No authentication token found.');
      setLoading(false);
      return;
    }

    const fetchListings = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/my-listings`, {
          headers: {
            'Cookie': `token=${token}`
          },
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch listings');
        }

        const data = await response.json();
        setListings(data);
        setFilteredListings(data); // Initialize filtered listings with all data
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Failed to fetch listings');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  if (loading) {
    return (
      <section
        className="flex items-center justify-center h-screen bg-white dark:bg-gray-900"
        aria-live="polite"
      >
        <p className="text-base text-gray-900 dark:text-white">Loading...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section
        className="flex items-center justify-center h-screen bg-white dark:bg-gray-900"
        aria-live="assertive"
      >
        <p className="text-base text-red-600">{error}</p>
      </section>
    );
  }

  // Get count for each filter
  const getFilterCount = (status) => {
    return listings.filter(listing => listing.status === status).length;
  };

  const filters = [
    { key: 'all', label: 'All', count: listings.length },
    { key: 'active', label: 'Active', count: getFilterCount('active') },
    { key: 'pending_review', label: 'Pending Review', count: getFilterCount('pending_review') },
    { key: 'sold', label: 'Sold', count: getFilterCount('sold') }
  ];

  return (
    <section className="bg-white dark:bg-gray-900 pt-3 md:pt-4 pb-24 md:pb-6">
      <div className="mx-auto max-w-screen-xl px-4">
        <h1 className="text-2xl text-center font-bold tracking-tight text-gray-900 dark:text-white my-4">
          My Listings
        </h1>
        
        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeFilter === filter.key
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {filter.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeFilter === filter.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
              }`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>
      <ListingsContainer initialListings={filteredListings} />
    </section>
  );
};

export default MyListingsClient; 