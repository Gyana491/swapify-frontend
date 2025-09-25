'use client'

import Image from 'next/image'
import { useMemo, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { CompactAvatar } from './UserAvatar'

// Helper function to format distance
const formatDistance = (distance) => {
  if (distance === undefined || distance === null) return null;
  if (Number(distance) === 0) return 'On Spot';
  if (distance < 1) return `${Math.round(distance * 1000)}m away`;
  return `${Math.round(distance * 10) / 10}km away`;
};

// Helper function to format price
const formatPrice = (price) => {
  if (price === 0) return 'Free';
  if (!price && price !== 0) return '—';
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  } catch {
    return `₹${Number(price).toLocaleString('en-IN')}`;
  }
};

// Human-readable relative time like "2 minutes ago", "3 months ago"
const formatRelativeTime = (dateLike) => {
  try {
    const d = new Date(dateLike);
    if (isNaN(d.getTime())) return '';
    const diffMs = Date.now() - d.getTime();
    const sec = Math.floor(diffMs / 1000);
    if (sec < 5) return 'just now';
    if (sec < 60) return `${sec} ${sec === 1 ? 'second' : 'seconds'} ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min} ${min === 1 ? 'minute' : 'minutes'} ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} ${hr === 1 ? 'hour' : 'hours'} ago`;
    const day = Math.floor(hr / 24);
    if (day < 30) return `${day} ${day === 1 ? 'day' : 'days'} ago`;
    const month = Math.floor(day / 30);
    if (month < 12) return `${month} ${month === 1 ? 'month' : 'months'} ago`;
    const year = Math.floor(month / 12);
    return `${year} ${year === 1 ? 'year' : 'years'} ago`;
  } catch {
    return '';
  }
};

export default function ListingCard({ listing }) {
  const [imageError, setImageError] = useState(false)
  const router = useRouter()
  
  const imageUrl = listing.cover_image 
    ? `${process.env.NEXT_PUBLIC_MEDIACDN}/uploads/${listing.cover_image}`
    : '/assets/place-holder.jpg'

  const rawSeller = useMemo(() => (
    listing?.seller_id || listing?.seller || listing?.owner || null
  ), [listing])

  const sellerProfileId = rawSeller?._id || rawSeller?.id || rawSeller?.user_id || rawSeller?.userId || null
  const sellerName = useMemo(() => {
    if (!rawSeller) return ''
    return (
      rawSeller.full_name ||
      [rawSeller.first_name, rawSeller.last_name].filter(Boolean).join(' ') ||
      rawSeller.username ||
      rawSeller.name ||
      (typeof rawSeller.email === 'string' ? rawSeller.email.split('@')[0] : '')
    )
  }, [rawSeller])

  const sellerUser = useMemo(() => {
    if (!rawSeller) return null
    return {
      ...rawSeller,
      user_avatar: rawSeller.user_avatar || rawSeller.avatar || rawSeller.profile_image || rawSeller.profileImage || rawSeller.photo,
      google_user_avatar: rawSeller.google_user_avatar || rawSeller.googleAvatar || rawSeller.picture || rawSeller.photoUrl
    }
  }, [rawSeller])

  const handleNavigate = useCallback(() => {
    if (!listing?._id) return
    router.push(`/listing/${listing._id}`)
  }, [router, listing?._id])

  const handleCardKeyDown = useCallback((event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleNavigate()
    }
  }, [handleNavigate])

  const handleSellerActivate = useCallback((event) => {
    event.stopPropagation()
    if (!sellerProfileId) return
    router.push(`/u/${sellerProfileId}`)
  }, [router, sellerProfileId])

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleNavigate}
      onKeyDown={handleCardKeyDown}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 overflow-hidden hover:shadow-md transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500"
    >
        {/* Image Container */}
        <div className="relative aspect-video">
          <Image
            src={imageError ? '/assets/listing-placeholder.jpg' : imageUrl}
            alt={`Image of ${listing.title}`}
            onError={() => setImageError(true)}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority={false}
          />
          <div className="absolute top-2 right-2">
            <span className="bg-violet-600 text-white px-2.5 py-1 rounded-full text-xs sm:text-sm font-semibold shadow-sm">
              {formatPrice(listing.price)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2 line-clamp-1 dark:text-white">
            {listing.title}
          </h3>
          {/* Description removed for compact, price-forward design */}

          {/* Meta: location • distance • time */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {listing.location_display_name && (
              <span className="inline-flex items-center min-w-0">
                <svg 
                  className="w-3.5 h-3.5 mr-1 flex-shrink-0" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate max-w-[12rem] sm:max-w-[16rem]">{listing.location_display_name}</span>
              </span>
            )}
            {formatDistance(listing.distance) && (
              <>
                <span className="hidden sm:inline">•</span>
                <span className="inline-flex items-center text-violet-600 dark:text-violet-400">
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  {formatDistance(listing.distance)}
                </span>
              </>
            )}
            {listing.created_at && (
              <>
                <span className="hidden sm:inline">•</span>
                <time dateTime={new Date(listing.created_at).toISOString()}>{formatRelativeTime(listing.created_at)}</time>
              </>
            )}
          </div>

          {sellerUser && sellerName && (
            <div className="mt-2.5 sm:mt-3 flex items-center gap-2.5 sm:gap-3">
              <CompactAvatar 
                user={sellerUser} 
                className="flex-shrink-0 ring-1 ring-gray-200/80 dark:ring-gray-600/50 shadow-sm" 
                showBorder={true}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-[11px] uppercase tracking-wider font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                  Listed by
                </p>
                {sellerProfileId ? (
                  <span
                    role="link"
                    tabIndex={0}
                    onClick={handleSellerActivate}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        handleSellerActivate(event)
                      }
                    }}
                    className="block text-sm sm:text-base font-semibold text-gray-900 hover:text-violet-600 dark:text-gray-100 dark:hover:text-violet-400 truncate cursor-pointer transition-colors duration-150"
                    title={sellerName}
                  >
                    {sellerName}
                  </span>
                ) : (
                  <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 truncate" title={sellerName}>
                    {sellerName}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </article>
  )
} 