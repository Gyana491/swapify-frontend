"use client"
import { useState, useEffect } from 'react';
import ListingCard from './ListingCard';
import DeleteModal from './DeleteModal';

const ListingsContainer = ({ initialListings }) => {
    const [listings, setListings] = useState(initialListings);
    const [selectedListingId, setSelectedListingId] = useState(null);
    const [error, setError] = useState(null);

    // Update listings when initialListings prop changes
    useEffect(() => {
        setListings(initialListings);
    }, [initialListings]);

    useEffect(() => {
        const handleShowModal = (event) => {
            setSelectedListingId(event.detail);
        };

        const handleDeleteSuccess = () => {
            setListings(prevListings =>
                prevListings.filter(listing => listing._id !== selectedListingId)
            );
            setSelectedListingId(null);
        };

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

        window.addEventListener('showDeleteModal', handleShowModal);
        window.addEventListener('listingDeleted', handleDeleteSuccess);
        window.addEventListener('listingStatusUpdated', handleStatusUpdate);

        return () => {
            window.removeEventListener('showDeleteModal', handleShowModal);
            window.removeEventListener('listingDeleted', handleDeleteSuccess);
            window.removeEventListener('listingStatusUpdated', handleStatusUpdate);
        };
    }, [selectedListingId]);
    return (
    <section className="mx-auto max-w-screen-lg bg-white px-4 pb-2 dark:bg-gray-900">
            {error && (
                <div className="text-red-500 text-center mb-4">{error}</div>
            )}

            {!listings.length && (
                <div className="flex flex-col items-center justify-center py-16 text-center text-gray-600 dark:text-gray-300">
                    <svg className="w-12 h-12 mb-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M3 4a1 1 0 0 0-1 1v13.382A2 2 0 0 0 3.276 20.8l2.895-1.447A2 2 0 0 1 7.276 19h11.448A2 2 0 0 0 21 17V5a1 1 0 0 0-1-1H3zm1 2h16v11a1 1 0 0 1-1 1H7.276a3 3 0 0 0-1.342.316L4 19.118V6z"/>
                    </svg>
                    <p className="mb-3">You haven't posted any listings yet.</p>
                    <a href="/create-listing" className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700">
                        + Create your first listing
                    </a>
                </div>
            )}

            {!!listings.length && (
                <div className="flex flex-col gap-4 sm:gap-5">
                    {listings.map((listing) => (
                        <ListingCard
                            key={listing._id}
                            listing={listing}
                        />
                    ))}
                </div>
            )}

            <DeleteModal
                listingId={selectedListingId}
                onDeleteSuccess={() => {
                    window.dispatchEvent(new Event('listingDeleted'));
                }}
            />
        </section>
    );
};

export default ListingsContainer; 