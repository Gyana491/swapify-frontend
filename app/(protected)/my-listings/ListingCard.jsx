import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import MarkSoldModal from './MarkSoldModal';

const ListingCard = ({ listing }) => {
    const [imageError, setImageError] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isMarkingSold, setIsMarkingSold] = useState(false);
    const [showMarkSoldModal, setShowMarkSoldModal] = useState(false);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    // Format price to Indian format
    const formatIndianPrice = (price) => {
        const formatter = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        });
        return formatter.format(price);
    };

    // Get status color and text with improved styling
    const getStatusInfo = (status) => {
        switch (status) {
            case 'active':
                return { color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700', text: 'Active' };
            case 'sold':
                return { color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700', text: 'Sold' };
            case 'pending_review':
                return { color: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700', text: 'Pending' };
            case 'draft':
                return { color: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700', text: 'Draft' };
            case 'paused':
                return { color: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700', text: 'Paused' };
            case 'reserved':
                return { color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700', text: 'Reserved' };
            case 'cancelled':
                return { color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700', text: 'Cancelled' };
            case 'expired':
                return { color: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700', text: 'Expired' };
            case 'archived':
                return { color: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700', text: 'Archived' };
            default:
                return { color: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700', text: 'Unknown' };
        }
    };

    const imageUrl = listing.cover_image
        ? `${process.env.NEXT_PUBLIC_MEDIACDN}/uploads/${listing.cover_image}`
        : '/assets/place-holder.jpg';

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        window.dispatchEvent(new CustomEvent('showDeleteModal', { detail: listing._id }));
        setShowMenu(false);
    };

    const handleMarkAsSoldClick = (e) => {
        e.stopPropagation();
        setShowMarkSoldModal(true);
    };

    const handleConfirmMarkAsSold = async () => {
        setIsMarkingSold(true);
        
        try {
            const response = await fetch(`/api/listings/${listing._id}/mark-sold`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to mark listing as sold');
            }

            // Dispatch event to update the listing in the parent component
            window.dispatchEvent(new CustomEvent('listingStatusUpdated', { 
                detail: { listingId: listing._id, newStatus: 'sold' } 
            }));
            
            setShowMarkSoldModal(false);
        } catch (error) {
            console.error('Error marking listing as sold:', error);
            alert('Failed to mark listing as sold. Please try again.');
        } finally {
            setIsMarkingSold(false);
        }
    };

    const handleCloseMarkSoldModal = () => {
        if (!isMarkingSold) {
            setShowMarkSoldModal(false);
        }
    };

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-lg dark:border-gray-600 dark:bg-gray-800">
            {/* Main Content - Image and Info in Row */}
            <div className="flex">
                {/* Image Section */}
                <div className="relative flex-shrink-0">
                    <Link href={`/listing/${listing._id}`} className="block">
                        <div className="relative h-32 w-32 sm:h-36 sm:w-36 md:h-40 md:w-40">
                            <Image
                                src={imageError ? '/assets/place-holder.jpg' : imageUrl}
                                alt={`Image of ${listing.title}`}
                                fill
                                sizes="(max-width: 640px) 128px, (max-width: 768px) 144px, 160px"
                                onError={() => setImageError(true)}
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                priority={false}
                            />
                            {listing.status === 'sold' && (
                                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                                    <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold shadow-lg">
                                        SOLD
                                    </span>
                                </div>
                            )}
                            {/* Status Badge */}
                            <div className="absolute top-2 left-2">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border shadow-sm backdrop-blur-sm ${getStatusInfo(listing.status).color}`}>
                                    {getStatusInfo(listing.status).text}
                                </span>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Content Section */}
                <div className="flex flex-col flex-grow p-4 min-w-0">
                    <div className="flex justify-between items-start mb-auto">
                        <div className="flex-grow min-w-0">
                            <Link href={`/listing/${listing._id}`}>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 transition-colors duration-200 hover:text-blue-600 dark:text-white dark:hover:text-blue-400 mb-1">
                                    {formatIndianPrice(listing.price)}
                                </h3>
                            </Link>
                            
                            <Link href={`/listing/${listing._id}`}>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 line-clamp-2 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200">
                                    {listing.title}
                                </p>
                            </Link>
                            
                            <div className="flex items-start text-gray-500 dark:text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-3 w-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4c3.865 0 7 3.134 7 7 0 3.337-3 8-7 13-4-5-7-9.663-7-13 0-3.866 3.135-7 7-7zM12 6a2 2 0 100 4 2 2 0 000-4z" />
                                </svg>
                                <p className="text-xs line-clamp-2 leading-tight">
                                    {listing.location_display_name.length > 45 ? listing.location_display_name.substring(0, 45) + '...' : listing.location_display_name}
                                </p>
                            </div>
                        </div>

                        {/* Menu Button */}
                        <div className="relative ml-2 flex-shrink-0" ref={menuRef}>
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setShowMenu(!showMenu);
                                }}
                                className="p-1.5 bg-gray-50 hover:bg-gray-100 rounded-full dark:bg-gray-700 dark:hover:bg-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600"
                                aria-label="Open menu"
                            >
                                <BsThreeDotsVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                            </button>
                            {showMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-20 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                                    <button
                                        onClick={handleDeleteClick}
                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors duration-200 flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Delete Listing
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3">
                {listing.status === 'active' && (
                    <Link href={`/offers/${listing._id}`} className="flex-1">
                        <button
                            className="w-full inline-flex items-center justify-center rounded-lg bg-purple-600 px-2 py-2 text-xs font-medium text-white transition-all duration-200 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-800 active:scale-95"
                            aria-label="Check offers for this listing"
                        >
                            Offers
                        </button>
                    </Link>
                )}

                {listing.status !== 'sold' && (
                    <button
                        onClick={handleMarkAsSoldClick}
                        disabled={isMarkingSold}
                        className="flex-1 inline-flex items-center justify-center rounded-lg bg-green-600 px-2 py-2 text-xs font-medium text-white transition-all duration-200 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Mark listing as sold"
                    >
                        {isMarkingSold ? 'Processing...' : 'Mark Sold'}
                    </button>
                )}

                <Link href={`/edit/${listing._id}`} className="flex-1">
                    <button
                        className="w-full inline-flex items-center justify-center rounded-lg bg-blue-600 px-2 py-2 text-xs font-medium text-white transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 active:scale-95"
                        aria-label="Edit listing"
                    >
                        Edit
                    </button>
                </Link>

                <Link href={`/listing/${listing._id}`} className="flex-1">
                    <button
                        className="w-full inline-flex items-center justify-center rounded-lg bg-emerald-600 px-2 py-2 text-xs font-medium text-white transition-all duration-200 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:bg-emerald-600 dark:hover:bg-emerald-700 dark:focus:ring-emerald-800 active:scale-95"
                        aria-label="View listing details"
                    >
                        View
                    </button>
                </Link>
            </div>

            <MarkSoldModal
                isOpen={showMarkSoldModal}
                onClose={handleCloseMarkSoldModal}
                onConfirm={handleConfirmMarkAsSold}
                listingTitle={listing.title}
                isProcessing={isMarkingSold}
            />
        </div>
    );
};

export default ListingCard;