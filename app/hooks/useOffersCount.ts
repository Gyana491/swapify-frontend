'use client';

import { useEffect, useState } from 'react';
import { getToken } from '../utils/getToken';

type OffersTotals = {
	totalOffers: number; // sum of offers across active listings
	listingsWithOffers: number; // number of active listings that have >=1 offer
};

export function useOffersCount() {
	const [offersCount, setOffersCount] = useState<OffersTotals>({
		totalOffers: 0,
		listingsWithOffers: 0,
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

		const fetchOffersCount = async () => {
		try {
			setLoading(true);
			setError(null);
						const token = getToken();
						if (!token) {
							// Not logged in: skip network calls and reset counts
							setOffersCount({ totalOffers: 0, listingsWithOffers: 0 });
							return;
						}
						const baseOpts: RequestInit = { cache: 'no-store' };
						const response = await fetch('/api/offers', baseOpts);
			if (!response.ok) throw new Error('Failed to fetch offers');
			const data = await response.json();

			// Expected shape from backend /api/offers -> { success, listings: [{ status, offerStats: { totalOffers }}, ...] }
			const listings = Array.isArray(data)
				? data
				: (Array.isArray(data.listings) ? data.listings : []);

					let totalOffers = 0;
					let listingsWithOffers = 0;
					listings
				.filter((l: any) => l?.status === 'active')
				.forEach((listing: any) => {
					const countFromStats = Number(listing?.offerStats?.totalOffers || 0);
					const countFromArray = Array.isArray(listing?.offers) ? listing.offers.length : 0;
					const count = countFromStats || countFromArray;
					if (count > 0) {
						totalOffers += count;
						listingsWithOffers += 1;
					}
				});

							// Secondary pass: if active-only count is zero, try counting across ALL statuses
							// from the aggregate payload (in case offers exist on non-active items for some reason).
							if (totalOffers === 0 && listings.length > 0) {
								let allTotal = 0;
								let allListingsWithOffers = 0;
								listings.forEach((listing: any) => {
									const countFromStats = Number(listing?.offerStats?.totalOffers || 0);
									const countFromArray = Array.isArray(listing?.offers) ? listing.offers.length : 0;
									const count = countFromStats || countFromArray;
									if (count > 0) {
										allTotal += count;
										allListingsWithOffers += 1;
									}
								});
								if (allTotal > 0) {
									totalOffers = allTotal;
									listingsWithOffers = allListingsWithOffers;
								}
							}

							// Fallback path: if aggregate (both active-only and all-status) returned 0,
							// query my listings then compute by per-listing endpoint.
					if (totalOffers === 0) {
						try {
							  const mlRes = await fetch('/api/my-listings', baseOpts);
							const mlData = await mlRes.json();
							const allListings: any[] = Array.isArray(mlData)
								? mlData
								: (Array.isArray(mlData?.listings) ? mlData.listings : []);

									const active = allListings.filter((l) => l?.status === 'active');
									// Limit to first 50 to avoid too many requests; adjust as needed
									const slice = active.slice(0, 50);
							const perListingCounts = await Promise.all(
											slice.map(async (l) => {
									try {
													const r = await fetch(`/api/offers/${l._id}`, baseOpts);
										const d = await r.json();
										if (!r.ok) return 0;
										const offers = Array.isArray(d?.offers) ? d.offers : [];
										return offers.length;
									} catch { return 0; }
								})
							);
							const fallbackTotal = perListingCounts.reduce((a, b) => a + b, 0);
							const fallbackListingsWithOffers = perListingCounts.filter((c) => c > 0).length;
							totalOffers = fallbackTotal;
							listingsWithOffers = fallbackListingsWithOffers;
						} catch {}
					}

					setOffersCount({ totalOffers, listingsWithOffers });
		} catch (err: any) {
			console.error('Error fetching offers count:', err);
			setError(err?.message || 'Unknown error');
			setOffersCount({ totalOffers: 0, listingsWithOffers: 0 });
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchOffersCount();
		const onVisible = () => {
			if (document.visibilityState === 'visible') fetchOffersCount();
		};
		document.addEventListener('visibilitychange', onVisible);
		return () => document.removeEventListener('visibilitychange', onVisible);
	}, []);

	return { offersCount, loading, error, refetch: fetchOffersCount };
}

