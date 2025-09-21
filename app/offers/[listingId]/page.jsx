'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function ListingOffersPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = params?.listingId;
  const [offers, setOffers] = useState([]);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingOfferId, setProcessingOfferId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Toast-based confirmation dialog
  const confirmAccept = (message = 'Are you sure you want to accept this offer?') => {
    return new Promise((resolve) => {
      toast.custom((t) => (
        <div className={`max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black/5 dark:ring-white/10 p-4 ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Confirm Action</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{message}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => { toast.dismiss(t.id); resolve(false); }}
              className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={() => { toast.dismiss(t.id); resolve(true); }}
              className="px-3 py-1.5 text-sm rounded-md bg-green-600 text-white hover:bg-green-700"
            >
              Accept
            </button>
          </div>
        </div>
      ), { duration: 60000 });
    });
  };

  useEffect(() => {
    if (!listingId) return;
    // Fetch listing details and offers in parallel so the listing view is shown even if there are no offers
    const fetchAll = async () => {
      try {
        await Promise.all([fetchListing(), fetchOffers()]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [listingId]);

  const fetchListing = async () => {
    try {
      const res = await fetch(`/api/listings/${listingId}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || data?.error || 'Failed to fetch listing');
      }
      setListing(data || null);
    } catch (e) {
      // Don't block offers view if listing fails; surface message
      setError((prev) => prev || e.message);
    }
  };

  const fetchOffers = async () => {
    try {
      if (refreshing) return;
      const response = await fetch(`/api/offers/${listingId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch offers');
      }

      if (data.success) {
        const arr = Array.isArray(data.offers) ? data.offers : [];
        setOffers(arr);
        // If listing isn't loaded yet, try derive from offers payload
        if (!listing && arr.length > 0 && arr[0]?.listing) {
          setListing(arr[0].listing);
        }
        if (refreshing) toast.success('Offers refreshed');
      } else {
        throw new Error(data.message || 'Failed to fetch offers');
      }
    } catch (error) {
      setError(error.message);
      toast.error('Failed to load offers');
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchOffers();
    } finally {
      setRefreshing(false);
    }
  };

  const handleOfferAction = async (offerId, action) => {
    if (processingOfferId) return;

    // If accepting, confirm with a toast UI
    if (action === 'accepted') {
      const confirmed = await confirmAccept('Are you sure you want to accept this offer?');
      if (!confirmed) return;
    }

    setProcessingOfferId(offerId);
    
    try {
      const response = await fetch(`/api/offers/${listingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offerId,
          status: action
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${action} offer`);
      }

      if (data.success) {
        toast.success(`Offer ${action} successfully`);
        fetchOffers(); // Refresh the offers list
      } else {
        throw new Error(data.message || `Failed to ${action} offer`);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setProcessingOfferId(null);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/offers" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Offers for Listing
            </h1>
          </div>
          
          {listing && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex gap-4">
                {/* Cover Image */}
                <div className="relative w-24 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                  {listing.cover_image ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_MEDIACDN}/uploads/${listing.cover_image}`}
                      alt={listing.title}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <Image
                      src="/assets/place-holder.jpg"
                      alt="Listing placeholder"
                      fill
                      className="object-cover"
                    />
                  )}
                  <div className="absolute top-1 left-1">
                    <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${
                      listing.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {listing.status}
                    </span>
                  </div>
                </div>

                {/* Main Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate text-sm">
                    {listing.title}
                  </h3>
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400 mb-1">
                    {formatPrice(listing.price)}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                    {listing.location_display_name && (
                      <span className="inline-flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {listing.location_display_name}
                      </span>
                    )}
                    {listing.category && (
                      <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs">
                        {listing.category}
                      </span>
                    )}
                    {listing.subcategory && (
                      <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                        {listing.subcategory}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-start flex-shrink-0">
                  <Link
                    href={`/listing/${listingId}`}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs whitespace-nowrap"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {offers.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-sm mx-auto">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-3"
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
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                No offers yet
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                No one has made an offer on this listing yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                All Offers ({offers.length})
              </h2>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                title="Refresh offers"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
              >
                <svg className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v6h6M20 20v-6h-6M20 8a8 8 0 00-15.5 2M4 16a8 8 0 0015.5-2" />
                </svg>
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            
            {offers.map((offer) => (
              <div
                key={offer._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    {offer?.buyer?.google_user_avatar ? (
                      <img
                        src={offer.buyer.google_user_avatar.replace('=s96-c', '=s200-c')}
                        alt={offer?.buyer?.full_name || offer?.buyer?.username || 'Buyer'}
                        className="w-full h-full object-cover"
                      />
                    ) : offer?.buyer?.user_avatar ? (
                      <img
                        src={offer.buyer.user_avatar}
                        alt={offer?.buyer?.full_name || offer?.buyer?.username || 'Buyer'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                        {(offer?.buyer?.full_name || offer?.buyer?.username || 'U').slice(0,1).toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                          {offer.contactName || offer?.buyer?.full_name || offer?.buyer?.username || 'Anonymous'}
                        </h3>
                        <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${getStatusColor(offer.status)}`}>
                          {offer.status}
                        </span>
                      </div>
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatPrice(offer.offerAmount)}
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {formatDate(offer.createdAt)}
                    </p>
                    
                    {offer.message && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-2 mb-3">
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          "{offer.message}"
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                      {offer.contactName && (
                        <div className="text-xs">
                          <span className="text-gray-500 dark:text-gray-400">Name: </span>
                          <span className="text-gray-900 dark:text-white font-medium">{offer.contactName}</span>
                        </div>
                      )}
                      {offer.contactPhone && (
                        <div className="text-xs">
                          <span className="text-gray-500 dark:text-gray-400">Phone: </span>
                          <span className="text-gray-900 dark:text-white font-medium">{offer.contactPhone}</span>
                        </div>
                      )}
                    </div>

                    {offer.status === 'pending' && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleOfferAction(offer._id, 'accepted')}
                          disabled={processingOfferId === offer._id}
                          className="bg-green-600 text-white py-1.5 px-3 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
                        >
                          {processingOfferId === offer._id ? 'Processing...' : 'Accept'}
                        </button>
                      </div>
                    )}

                    {offer.status === 'accepted' && (
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs font-medium">Accepted</span>
                      </div>
                    )}

                    {offer.status === 'rejected' && (
                      <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs font-medium">Rejected</span>
                      </div>
                    )}
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