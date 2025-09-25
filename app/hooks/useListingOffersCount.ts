'use client';

import { useEffect, useState } from 'react';

type Options = {
  enabled?: boolean;
  refreshOnFocus?: boolean;
};

export function useListingOffersCount(
  listingId?: string,
  options: Options = {}
) {
  const { enabled = true, refreshOnFocus = true } = options;

  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCount = async () => {
    if (!listingId || !enabled) return;
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/offers/${listingId}`, { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || data?.error || 'Failed to fetch offers');
      }

      // Shape: { success: boolean, offers: Offer[] }
      const offers = Array.isArray(data?.offers) ? data.offers : [];
      setCount(offers.length);
    } catch (e: unknown) {
      console.error('Error fetching offers count:', e);
      setError(e instanceof Error ? e.message : 'Unknown error');
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled || !listingId) return;
    fetchCount();

    if (!refreshOnFocus) return;

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        fetchCount();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId, enabled, refreshOnFocus]);

  return { count, loading, error, refetch: fetchCount };
}
