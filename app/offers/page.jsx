'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { SmallAvatar } from '@/app/components/UserAvatar';

export default function OffersPage() {
  // Tabs: sent (offers I sent as buyer), received (offers I received as seller)
  const [activeTab, setActiveTab] = useState('received'); // 'sent' | 'received'
  const [sentOffers, setSentOffers] = useState([]);
  const [receivedOffers, setReceivedOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingOfferId, setProcessingOfferId] = useState(null);

  useEffect(() => {
    // Load both datasets in parallel so tabs are instant to switch
    const load = async () => {
      setLoading(true);
      setError('');
      try {
  await Promise.all([fetchSent(), fetchReceived()]);
      } catch (e) {
        // error state is set in individual fetchers
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const fetchSent = async () => {
    try {
      const response = await fetch('/api/offers/my-offers');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch your offers');
      }

      // Ensure newest first
      const offers = (Array.isArray(data?.offers) ? data.offers : [])
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setSentOffers(offers);
    } catch (error) {
      console.error('Error fetching sent offers:', error);
      setError((prev) => prev || error.message);
      toast.error('Failed to load your sent offers');
    }
  };

  const fetchReceived = async () => {
    try {
      // Fetch all offers where current user is the seller (received offers)
      const response = await fetch('/api/offers/received');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch received offers');
      }

      const offers = (Array.isArray(data?.offers) ? data.offers : [])
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setReceivedOffers(offers);
    } catch (error) {
      console.error('Error fetching received offers:', error);
      setError((prev) => prev || error.message);
      toast.error('Failed to load your received offers');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

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

  const handleOfferAction = async (offer, action) => {
    if (processingOfferId) return;

    // If accepting, confirm with a toast UI
    if (action === 'accepted') {
      const confirmed = await confirmAccept('Are you sure you want to accept this offer? Your Contact Details Will Be Shared With the buyer.');
      if (!confirmed) return;
    }

    setProcessingOfferId(offer._id);
    
    try {
      const response = await fetch(`/api/offers/${offer?.listing?._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offerId: offer._id,
          status: action
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${action} offer`);
      }

      if (data.success) {
        toast.success(`Offer ${action} successfully`);
        // Refresh received offers to update status
        await fetchReceived();
      } else {
        throw new Error(data.message || `Failed to ${action} offer`);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setProcessingOfferId(null);
    }
  };

  const SentEmptyState = () => (
    <div className="text-center py-20">
      <div className="max-w-md mx-auto">
        <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h18M9 7h6m-9 4h12M7 15h10M5 19h14" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No offers sent</h3>
        <p className="text-gray-500 dark:text-gray-400">
          You haven’t sent any offers yet. Explore listings and make an offer to start a conversation.
        </p>
        <div className="mt-6">
          <Link href="/search" className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Browse Listings
          </Link>
        </div>
      </div>
    </div>
  );

  const ReceivedEmptyState = () => (
    <div className="text-center py-20">
      <div className="max-w-md mx-auto">
        <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 7h-3V6a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No offers received</h3>
        <p className="text-gray-500 dark:text-gray-400">You haven’t received any offers on your listings yet.</p>
      </div>
    </div>
  );

  const SentList = () => (
    <div className="space-y-4">
      {sentOffers.map((offer) => (
        <div key={offer._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <div className="flex">
            {/* Listing Image */}
            <div className="relative w-32 h-24 bg-gray-200 dark:bg-gray-700 flex-shrink-0">
              {offer?.listing?.cover_image && (
                <Image
                  src={`${process.env.NEXT_PUBLIC_MEDIACDN}/uploads/${offer.listing.cover_image}`}
                  alt={offer?.listing?.title || 'Listing'}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              )}
            </div>
            {/* Details */}
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate max-w-xs">
                    {offer?.listing?.title || 'Listing'}
                  </h3>
                  {/* Seller details (for offers I sent) */}
                  {offer?.seller && (
                    <div className="mt-1 flex items-center gap-2">
                      <SmallAvatar user={offer?.seller} />
                      <span className="text-xs text-gray-700 dark:text-gray-300">Seller: <Link href={`/u/${offer?.seller?._id}`} className="font-medium hover:underline">{offer?.seller?.full_name || offer?.seller?.username || 'Seller'}</Link></span>
                    </div>
                  )}
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Your offer: <span className="font-semibold text-green-600 dark:text-green-400">{formatPrice(offer.offerAmount)}</span></p>
                </div>
                <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${
                  offer.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  offer.status === 'accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  offer.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}>
                  {offer.status}
                </span>
              </div>
              {offer.message && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-2 mb-2">
                  <p className="text-xs text-gray-700 dark:text-gray-300">"{offer.message}"</p>
                </div>
              )}
              {/* When accepted, show seller contact details and WhatsApp button */}
              {offer.status === 'accepted' && (
                <div className="mt-2 p-3 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <p className="text-xs text-green-800 dark:text-green-200 font-medium">Offer accepted! You can now contact the seller.</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {offer?.seller?.phone_number && (
                      <a
                        href={`https://wa.me/${(offer?.seller?.phone_number || '').replace(/[^\d]/g, '')}?text=${encodeURIComponent(`Hi${offer?.seller?.full_name ? ' ' + offer.seller.full_name : ''}, I'm contacting you regarding your listing: ${offer?.listing?.title || ''} on Swapify.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M19.11 17.63c-.27-.14-1.58-.78-1.83-.87-.25-.09-.43-.14-.62.14-.18.27-.71.87-.87 1.05-.16.18-.32.2-.6.07-.27-.14-1.15-.43-2.2-1.36-.81-.72-1.36-1.61-1.53-1.88-.16-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.62-1.49-.85-2.04-.22-.53-.45-.45-.62-.45-.16 0-.34-.02-.53-.02-.18 0-.48.07-.74.34-.25.27-.98.96-.98 2.33s1.01 2.71 1.15 2.9c.14.18 1.99 3.03 4.82 4.25.67.29 1.19.45 1.6.58.67.21 1.28.18 1.77.11.54-.08 1.58-.65 1.81-1.29.22-.64.22-1.19.16-1.29-.06-.1-.24-.16-.51-.3z"/><path d="M27.12 4.88C24.18 1.94 20.21.33 16 .33S7.82 1.94 4.88 4.88C1.94 7.82.33 11.79.33 16c0 2.34.62 4.64 1.8 6.65L.47 31.67l9.19-1.71c1.95 1.06 4.16 1.62 6.34 1.62h.01c4.21 0 8.18-1.61 11.12-4.55 2.94-2.94 4.55-6.91 4.55-11.12 0-4.21-1.61-8.18-4.56-11.13zM16 29.46h-.01c-1.94 0-3.85-.52-5.5-1.5l-.39-.23-5.45 1.02 1.04-5.32-.25-.38c-1.12-1.77-1.7-3.82-1.7-5.9 0-6.12 4.98-11.1 11.1-11.1 2.97 0 5.75 1.16 7.86 3.27 2.1 2.1 3.27 4.9 3.27 7.86 0 6.12-4.98 11.09-11.1 11.09z"/></svg>
                        Contact Seller
                      </a>
                    )}
                  </div>
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <Link href={`/listing/${offer?.listing?._id}`} className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">View Listing</Link>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const ReceivedList = () => (
    <div className="space-y-4">
      {receivedOffers.map((offer) => (
        <div key={offer._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <div className="flex">
            {/* Listing Image */}
            <div className="relative w-32 h-24 bg-gray-200 dark:bg-gray-700 flex-shrink-0">
              {offer?.listing?.cover_image && (
                <Image
                  src={`${process.env.NEXT_PUBLIC_MEDIACDN}/uploads/${offer.listing.cover_image}`}
                  alt={offer?.listing?.title || 'Listing'}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              )}
            </div>

            {/* Details */}
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate max-w-xs">
                    {offer?.listing?.title || 'Listing'}
                  </h3>
                  {/* Buyer details (for offers I received) */}
                  {offer?.buyer && (
                    <div className="mt-1 flex items-center gap-2">
                      <SmallAvatar user={offer?.buyer} />
                      <span className="text-xs text-gray-700 dark:text-gray-300">Buyer: <Link href={`/u/${offer?.buyer?._id}`} className="font-medium hover:underline">{offer?.buyer?.full_name || offer?.buyer?.username || offer?.contactName || 'Buyer'}</Link></span>
                    </div>
                  )}
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Offer amount: <span className="font-semibold text-green-600 dark:text-green-400">{formatPrice(offer.offerAmount)}</span></p>
                </div>
                <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${
                  offer.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  offer.status === 'accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  offer.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}>
                  {offer.status}
                </span>
              </div>

              {offer.message && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-2 mb-2">
                  <p className="text-xs text-gray-700 dark:text-gray-300">"{offer.message}"</p>
                </div>
              )}

              <div className="flex gap-2 mt-2">
                {offer.status === 'pending' && (
                  <button
                    onClick={() => handleOfferAction(offer, 'accepted')}
                    disabled={processingOfferId === offer._id}
                    className="bg-green-600 text-white py-1.5 px-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {processingOfferId === offer._id ? 'Processing...' : 'Accept'}
                  </button>
                )}
                {offer.status === 'accepted' && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium">Accepted</span>
                    </div>
                    {(offer?.contactPhone || offer?.buyer?.phone_number) && (
                      <a
                        href={`https://wa.me/${(offer?.contactPhone || offer?.buyer?.phone_number || '').replace(/[^\d]/g, '')}?text=${encodeURIComponent(`Hi${offer?.buyer?.full_name ? ' ' + offer.buyer.full_name : ''}, I'm the seller of '${offer?.listing?.title || ''}' on Swapify.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M19.11 17.63c-.27-.14-1.58-.78-1.83-.87-.25-.09-.43-.14-.62.14-.18.27-.71.87-.87 1.05-.16.18-.32.2-.6.07-.27-.14-1.15-.43-2.2-1.36-.81-.72-1.36-1.61-1.53-1.88-.16-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.62-1.49-.85-2.04-.22-.53-.45-.45-.62-.45-.16 0-.34-.02-.53-.02-.18 0-.48.07-.74.34-.25.27-.98.96-.98 2.33s1.01 2.71 1.15 2.9c.14.18 1.99 3.03 4.82 4.25.67.29 1.19.45 1.6.58.67.21 1.28.18 1.77.11.54-.08 1.58-.65 1.81-1.29.22-.64.22-1.19.16-1.29-.06-.1-.24-.16-.51-.3z"/><path d="M27.12 4.88C24.18 1.94 20.21.33 16 .33S7.82 1.94 4.88 4.88C1.94 7.82.33 11.79.33 16c0 2.34.62 4.64 1.8 6.65L.47 31.67l9.19-1.71c1.95 1.06 4.16 1.62 6.34 1.62h.01c4.21 0 8.18-1.61 11.12-4.55 2.94-2.94 4.55-6.91 4.55-11.12 0-4.21-1.61-8.18-4.56-11.13zM16 29.46h-.01c-1.94 0-3.85-.52-5.5-1.5l-.39-.23-5.45 1.02 1.04-5.32-.25-.38c-1.12-1.77-1.7-3.82-1.7-5.9 0-6.12 4.98-11.1 11.1-11.1 2.97 0 5.75 1.16 7.86 3.27 2.1 2.1 3.27 4.9 3.27 7.86 0 6.12-4.98 11.09-11.1 11.09z"/></svg>
                        Contact Buyer
                      </a>
                    )}
                  </div>
                )}
                {offer.status === 'rejected' && (
                  <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">Rejected</span>
                  </div>
                )}
                <Link href={`/offers/${offer?.listing?._id}`} className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">View All Offers</Link>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

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
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Offers</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Track your offers as a buyer and manage offers on your listings as a seller.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-4" aria-label="Tabs">
            <button
              className={`whitespace-nowrap py-2 px-3 border-b-2 text-sm font-medium ${activeTab === 'received' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
              onClick={() => setActiveTab('received')}
            >
              Received
            </button>
            <button
              className={`whitespace-nowrap py-2 px-3 border-b-2 text-sm font-medium ${activeTab === 'sent' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
              onClick={() => setActiveTab('sent')}
            >
              Sent
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'sent' ? (
          sentOffers.length === 0 ? <SentEmptyState /> : <SentList />
        ) : (
          receivedOffers.length === 0 ? <ReceivedEmptyState /> : <ReceivedList />
        )}
      </div>
    </div>
  );
}