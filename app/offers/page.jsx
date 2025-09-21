'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function OffersPage() {
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchActiveListings();
  }, []);

  const fetchActiveListings = async () => {
    try {
      const response = await fetch('/api/my-listings');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to fetch listings');
      }

      const arr = Array.isArray(data) ? data : (Array.isArray(data?.listings) ? data.listings : []);
      const active = arr.filter((l) => l.status === 'active');
      setListings(active);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setError(error.message);
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // no date formatting needed here

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Offers
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Your active listings — open each to check offers
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {listings.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <svg
                className="mx-auto h-16 w-16 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 7h-3V6a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No active listings
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                You don’t have any active listings right now. Create one to start receiving offers.
              </p>
              <Link
                href="/create-listing"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create New Listing
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => (
              <div
                key={listing._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="flex">
                  {/* Listing Image - Left Side */}
                  <div className="relative w-32 h-24 bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                    {listing.cover_image && (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_MEDIACDN}/uploads/${listing.cover_image}`}
                        alt={listing.title}
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 left-2">
                      <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${
                        listing.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {listing.status}
                      </span>
                    </div>
                  </div>

                  {/* Listing Details - Right Side */}
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    {/* Row 1: Title and Price */}
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate flex-1 mr-4">
                        {listing.title}
                      </h3>
                      <div className="text-lg font-bold text-purple-600 dark:text-purple-400 flex-shrink-0">
                        {formatPrice(listing.price)}
                      </div>
                    </div>

                    {/* Row 2: Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/offers/${listing._id}`}
                        className="bg-purple-600 text-white text-center py-1.5 px-3 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                      >
                        Check Offers
                      </Link>
                      
                      <Link
                        href={`/listing/${listing._id}`}
                        className="px-2 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}