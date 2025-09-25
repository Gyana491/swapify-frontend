'use client';

import Image from 'next/image';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CompactAvatar } from '@/app/components/UserAvatar';

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

function toRad(value) {
  return value * Math.PI / 180;
}

// Helper function to format distance
const formatDistance = (distance) => {
  if (distance === null || distance === undefined) return null;
  if (distance === 0 || distance < 0.1) {
    return "On Spot";
  }
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m away`;
  }
  return `${Math.round(distance * 10) / 10}km away`;
};

// Helper function to format price
const formatPrice = (price) => {
  if (!price) return '₹0';
  return `₹${price.toLocaleString('en-IN')}`;
};

// Helper function to format date as "X days ago"
const formatDaysAgo = (dateString) => {
  const now = new Date();
  const listingDate = new Date(dateString);
  const diffTime = Math.abs(now - listingDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "1 day ago";
  } else {
    return `${diffDays} days ago`;
  }
};

const resolveSellerMeta = (record = {}) => {
  const rawSeller = record?.seller_id || record?.seller || record?.owner || null;

  if (!rawSeller) return null;

  const name = rawSeller.full_name
    || [rawSeller.first_name, rawSeller.last_name].filter(Boolean).join(' ')
    || rawSeller.username
    || rawSeller.name
    || (typeof rawSeller.email === 'string' ? rawSeller.email.split('@')[0] : '');

  if (!name) return null;

  const profileId = rawSeller._id || rawSeller.id || rawSeller.user_id || rawSeller.userId || null;

  const user = {
    ...rawSeller,
    user_avatar: rawSeller.user_avatar || rawSeller.avatar || rawSeller.profile_image || rawSeller.profileImage || rawSeller.photo,
    google_user_avatar: rawSeller.google_user_avatar || rawSeller.googleAvatar || rawSeller.picture || rawSeller.photoUrl,
  };

  return { name, profileId, user };
};

// Individual card component
function RelatedListingCard({ item }) {
  const [imageError, setImageError] = useState(false);
  const imageUrl = item.cover_image 
    ? `${process.env.NEXT_PUBLIC_MEDIACDN}/uploads/${item.cover_image}`
    : '/assets/listing-placeholder.jpg';
  const sellerMeta = resolveSellerMeta(item);
  const router = useRouter();

  const handleNavigate = useCallback(() => {
    if (!item?._id) return;
    router.push(`/listing/${item._id}`);
  }, [router, item?._id]);

  const handleCardKeyDown = useCallback((event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleNavigate();
    }
  }, [handleNavigate]);

  const handleSellerActivate = useCallback((event) => {
    event.stopPropagation();
    if (!sellerMeta?.profileId) return;
    router.push(`/u/${sellerMeta.profileId}`);
  }, [router, sellerMeta?.profileId]);

  return (
      <article
        role="button"
        tabIndex={0}
        onClick={handleNavigate}
        onKeyDown={handleCardKeyDown}
        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 dark:bg-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        {/* Image Container */}
        <div className="relative aspect-video">
          <Image
            src={imageError ? '/assets/listing-placeholder.jpg' : imageUrl}
            alt={`Image of ${item.title}`}
            onError={() => setImageError(true)}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority={false}
          />
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1 dark:text-white">
            {item.title}
          </h3>
          
          <div className="mb-3">
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {formatPrice(item.price)}
            </span>
          </div>

          {/* Location */}
          {item.location_display_name && (
            <div className="flex items-center text-gray-500 text-sm dark:text-gray-400 mb-1" aria-label="Location">
              <svg 
                className="w-4 h-4 mr-1 flex-shrink-0" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                />
              </svg>
              <span className="truncate">
                {item.location_display_name}
              </span>
            </div>
          )}

          {/* Distance */}
          {item.distance !== null && (
            <div className="flex items-center text-blue-600 text-sm dark:text-blue-400 mb-2" aria-label="Distance">
              <svg 
                className="w-4 h-4 mr-1 flex-shrink-0" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
              <span>{formatDistance(item.distance)}</span>
            </div>
          )}

          {sellerMeta && (
            <div className="mt-2.5 flex items-center gap-2.5">
              <CompactAvatar 
                user={sellerMeta.user} 
                className="flex-shrink-0 ring-1 ring-gray-200/80 dark:ring-gray-600/50 shadow-sm" 
                showBorder={true}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                  Listed by
                </p>
                {sellerMeta.profileId ? (
                  <span
                    role="link"
                    tabIndex={0}
                    onClick={handleSellerActivate}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleSellerActivate(event);
                      }
                    }}
                    className="block text-sm font-semibold text-gray-900 hover:text-purple-600 dark:text-gray-100 dark:hover:text-purple-400 truncate cursor-pointer transition-colors duration-150"
                    title={sellerMeta.name}
                  >
                    {sellerMeta.name}
                  </span>
                ) : (
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate" title={sellerMeta.name}>
                    {sellerMeta.name}
                  </p>
                )}
              </div>
            </div>
          )}

           {/* Date */}
           <time 
             className="block mt-2 text-xs text-gray-500 dark:text-gray-400"
             dateTime={new Date(item.created_at).toISOString()}
           >
             {formatDaysAgo(item.created_at)}
           </time>
        </div>
      </article>
  );
}

export default function RelatedListings({ listings, currentListing }) {
  // Calculate distances for each listing
  const listingsWithDistance = listings.map(listing => {
    if (currentListing?.location?.coordinates && listing?.location?.coordinates) {
      const [currentLon, currentLat] = currentListing.location.coordinates;
      const [listingLon, listingLat] = listing.location.coordinates;
      const distance = calculateDistance(currentLat, currentLon, listingLat, listingLon);
      return { ...listing, distance: parseFloat(distance.toFixed(1)) };
    }
    return { ...listing, distance: null };
  });

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Similar Listings
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {listingsWithDistance.map((item) => (
          <RelatedListingCard key={item._id} item={item} />
        ))}
      </div>
    </div>
  );
} 