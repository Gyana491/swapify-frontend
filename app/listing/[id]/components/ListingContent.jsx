'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import SocialShare from '@/app/components/SocialShare';
import UserAvatar from '@/app/components/UserAvatar';

const ImageGallery = dynamic(() => import('./ImageGallery'), { ssr: false });
const ListingDescription = dynamic(() => import('./ListingDescription'));
const SafetyTips = dynamic(() => import('./SafetyTips'));
const RelatedListings = dynamic(() => import('./RelatedListings'));
const MakeOffer = dynamic(() => import('./MakeOffer'));

// Helper function to format date
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  if (!dateString) return null;
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', options);
}

export default function ListingContent({ listing, relatedListings }) {
  // Combine cover image with additional images
  const images = [];
  if (listing?.cover_image) images.push(listing.cover_image);
  if (Array.isArray(listing?.additional_images)) {
    images.push(...listing.additional_images.filter(Boolean));
  }
  const allImages = images.length > 0 ? images : ['/assets/place-holder.jpg'];

  const title = listing?.title;
  const price = typeof listing?.price === 'number' && isFinite(listing.price) ? listing.price : null;
  const location = listing?.location_display_name;
  const category = listing?.category;
  const subcategory = listing?.subcategory;
  const postedOn = formatDate(listing?.created_at);
  const seller = listing?.seller_id || listing?.owner || listing?.user || null;
  const sellerName = seller?.full_name || seller?.name || null;
  const isVerified = Boolean(seller?.is_verified);
  const status = listing?.status || 'active';

  // Status messages and badge info
  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return {
          message: 'This listing is active and available',
          badgeText: 'Active',
          icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
        };
      case 'sold':
        return {
          message: 'This item has been sold',
          badgeText: 'Sold',
          icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          badgeColor: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
        };
      case 'pending':
      case 'pending_review':
        return {
          message: 'This listing is pending approval',
          badgeText: 'Pending Review',
          icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          badgeColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
        };
      case 'inactive':
      case 'expired':
        return {
          message: 'This listing is no longer available',
          badgeText: status?.toLowerCase() === 'expired' ? 'Expired' : 'Inactive',
          icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z',
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          badgeColor: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        };
      case 'rejected':
        return {
          message: 'This listing has been rejected',
          badgeText: 'Rejected',
          icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z',
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          badgeColor: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
        };
      default:
        return {
          message: 'This listing status is unknown',
          badgeText: status || 'Unknown',
          icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z',
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          badgeColor: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
        };
    }
  };

  const statusInfo = getStatusInfo(status);
  const isActive = status === 'active';

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <nav className="text-sm">
          <ol className="list-none p-0 flex text-gray-500 dark:text-gray-400">
            <li className="flex items-center">
              <a href="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</a>
              <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </li>
            {category && (
              <li className="flex items-center">
                <span className="text-gray-700 dark:text-gray-300">{category}</span>
                <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </li>
            )}
            {subcategory && (
              <li className="flex items-center">
                <span className="text-gray-700 dark:text-gray-300">{subcategory}</span>
                <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </li>
            )}
            {title && (
              <li className="text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                {title}
              </li>
            )}
          </ol>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Images and Seller Info */}
          <div className="space-y-6">
            {/* Image Gallery */}
            <ImageGallery images={allImages} title={title || 'Listing image'} />
            
            {/* About the Seller Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                About the Seller
              </h2>
              <div className="flex items-center gap-4">
                <Link href={`/u/${seller?._id || ''}`}>
                  <UserAvatar 
                    user={seller} 
                    size={64} 
                    className="shadow-lg"
                  />
                </Link>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    <Link href={`/u/${seller?._id || ''}`} className="hover:underline">
                      {sellerName || 'Unknown seller'}
                    </Link>
                    {isVerified && (
                      <span className="inline-flex items-center ml-2">
                        <svg className="w-4 h-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </h3>
                  <div className="flex flex-col gap-1">
                    {seller?.created_at && (() => {
                      try {
                        const memberSince = new Date(seller.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                        return (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Member since {memberSince}
                          </p>
                        );
                      } catch {
                        return null;
                      }
                    })()}
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Contact available after chat
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details, Description & Actions */}
          <div className="space-y-6">
            {/* Status Message for Non-Active Listings */}
            {!isActive && (
              <div className={`rounded-2xl p-6 shadow-lg ${statusInfo.bgColor}`}>
                <div className="flex items-center gap-3">
                  <svg className={`w-6 h-6 ${statusInfo.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={statusInfo.icon} />
                  </svg>
                  <h2 className={`text-xl font-semibold ${statusInfo.color}`}>
                    {statusInfo.message}
                  </h2>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {status === 'sold' ? 'This item is no longer available for offers.' : 
                   status === 'pending' ? 'Please check back later once the listing is approved.' :
                   'This listing may have been removed or deactivated.'}
                </p>
              </div>
            )}

            {/* Main Details Card - For All Listings */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <div className="space-y-4">
                  {title && (
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                          {title}
                        </h1>
                        {/* Status Badge */}
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.badgeColor}`}>
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={statusInfo.icon} />
                            </svg>
                            {statusInfo.badgeText}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 mt-1">
                        <SocialShare 
                          title={`${title} - Available for Swap on Swapify`}
                          text={`Check out this ${category || 'item'} available for swap: ${title}`}
                          url={typeof window !== 'undefined' ? window.location.href : ''}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        />
                      </div>
                    </div>
                  )}
                  
                  {price !== null && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400">
                        ₹{price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Inclusive of all taxes
                      </span>
                    </div>
                  )}

                  {/* Location */}
                  {location && (
                    <div className="flex items-start gap-2 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">Pickup Location</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {location}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Category & Subcategory */}
                  {(category || subcategory) && (
                    <div className="flex flex-wrap gap-2">
                      {category && (
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                          {category}
                        </span>
                      )}
                      {subcategory && (
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                          {subcategory}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Posted Date */}
                  {postedOn && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Posted on {postedOn}
                    </div>
                  )}

                  {/* Seller Quick Info */}
                  {sellerName && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span>Listed by</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        <Link href={`/u/${seller?._id || ''}`} className="hover:underline">
                          {sellerName}
                        </Link>
                        {isVerified && (
                          <span className="inline-flex items-center ml-1">
                            <svg className="w-4 h-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </span>
                    </div>
                  )}

                  {/* Make Offer Button - Only for Active Listings */}
                  {isActive && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <MakeOffer listing={listing} />
                    </div>
                  )}
                </div>
              </div>

            {/* Description Card - For All Listings */}
            {listing?.description && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  About this item
                </h2>
                <ListingDescription description={listing.description} />
              </div>
            )}

            {/* Safety Tips - For All Listings */}
            <SafetyTips />
          </div>
        </div>

        {/* Related Listings Section - For All Listings */}
        {Array.isArray(relatedListings) && relatedListings.length > 0 && (
          <RelatedListings listings={relatedListings} currentListing={listing} />
        )}
      </div>
    </main>
  );
}