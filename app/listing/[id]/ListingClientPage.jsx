'use client';

import { useEffect, useMemo, useState } from 'react';
import ListingContent from './components/ListingContent';

const sanitizeBaseUrl = (base = '') => (base.endsWith('/') ? base.slice(0, -1) : base);

const buildListingUrl = (baseUrl, listingId) => {
  if (!listingId) return null;
  if (baseUrl) {
    return `${sanitizeBaseUrl(baseUrl)}/listings/${listingId}`;
  }
  return `/api/listings/${listingId}`;
};

const buildRelatedUrl = (baseUrl, category) => {
  if (!category) return null;
  if (baseUrl) {
    const url = new URL('/listings', sanitizeBaseUrl(baseUrl));
    url.searchParams.set('limit', '5');
    url.searchParams.set('category', category);
    return url.toString();
  }
  // Fallback: fetch all listings via API route and filter client-side
  const search = new URLSearchParams({ category, limit: '5' }).toString();
  return `/api/listings?${search}`;
};

const ListingClientPage = ({ listingId, fallbackErrorMessage = 'Error loading listing. Please try again later.' }) => {
  const [listing, setListing] = useState(null);
  const [relatedListings, setRelatedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const apiBase = useMemo(() => sanitizeBaseUrl(process.env.NEXT_PUBLIC_BACKEND || ''), []);

  useEffect(() => {
    if (!listingId) {
      setError('Listing ID is missing.');
      setLoading(false);
      return undefined;
    }

    let ignore = false;

    const fetchListingData = async () => {
      if (ignore) return;
      setLoading(true);
      setError('');

      try {
        const listingUrl = buildListingUrl(apiBase, listingId);
        if (!listingUrl) {
          throw new Error('Unable to build listing URL');
        }

        const listingResponse = await fetch(listingUrl, {
          cache: 'no-store',
        });

        if (!listingResponse.ok) {
          const errorBody = await listingResponse.json().catch(() => ({}));
          throw new Error(errorBody?.error || `Failed to fetch listing (${listingResponse.status})`);
        }

        const listingData = await listingResponse.json();
        if (ignore) return;
        setListing(listingData);

        if (listingData?.category) {
          const relatedUrl = buildRelatedUrl(apiBase, listingData.category);

          if (relatedUrl) {
            try {
              const relatedResponse = await fetch(relatedUrl, {
                cache: 'no-store',
              });

              if (!relatedResponse.ok) {
                console.error('Failed to fetch related listings', relatedResponse.statusText);
                if (!ignore) setRelatedListings([]);
              } else {
                const payload = await relatedResponse.json();
                const relatedArray = Array.isArray(payload) ? payload : payload?.listings;
                const normalized = Array.isArray(relatedArray) ? relatedArray : [];
                if (!ignore) {
                  setRelatedListings(
                    normalized
                      .filter((item) => item && item._id && item._id !== listingData?._id)
                      .slice(0, 4)
                  );
                }
              }
            } catch (relatedError) {
              if (!ignore) {
                console.error('Error fetching related listings:', relatedError);
                setRelatedListings([]);
              }
            }
          } else if (!ignore) {
            setRelatedListings([]);
          }
        } else if (!ignore) {
          setRelatedListings([]);
        }
      } catch (fetchError) {
        if (ignore) return;
        console.error('Error loading listing:', fetchError);
        setError(fetchError.message || fallbackErrorMessage);
        setListing(null);
        setRelatedListings([]);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchListingData();

    return () => {
      ignore = true;
    };
  }, [apiBase, listingId, fallbackErrorMessage]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="container mx-auto px-4 py-16">
        <p className="text-center text-red-600 dark:text-red-400">
          {error || fallbackErrorMessage}
        </p>
      </div>
    );
  }

  return <ListingContent listing={listing} relatedListings={relatedListings} />;
};

export default ListingClientPage;
