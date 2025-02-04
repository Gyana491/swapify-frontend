import Image from 'next/image';
import Link from 'next/link';

const ListingCard = ({ listing }) => {
    return (
        <div className="flex w-full flex-row rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800 mb-4">
            <Link href={`/listing/${listing._id}`}>
                <div className="w-full h-full flex flex-row items-center justify-center">
                    <Image 
                        src={`${process.env.NEXT_PUBLIC_MEDIACDN}/uploads/${listing.cover_image}`}
                        alt={listing.name}
                        width={224}
                        height={224}
                        className="aspect-square w-48 object-cover md:w-56"
                    />
                </div>
            </Link>
            <div className="p-5">
                <Link href={`/listing/${listing._id}`}>
                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {listing.price}
                    </h5>
                </Link>
                <p className="mb-3 line-clamp-1 font-normal text-gray-700 lg:line-clamp-2 dark:text-gray-400">
                    {listing.title}
                </p>
                <div className="mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-1.5 h-4 w-4 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4c3.865 0 7 3.134 7 7 0 3.337-3 8-7 13-4-5-7-9.663-7-13 0-3.866 3.135-7 7-7zM12 6a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                    <p className="line-clamp-1 font-normal text-gray-700 lg:line-clamp-2 dark:text-gray-400">
                        {listing.city}, {listing.state}
                    </p>
                </div>
                <div className="flex flex-row justify-between gap-2">
                    <Link href={`/edit-listing/${listing._id}`}>
                        <button className="inline-flex items-center rounded-lg bg-blue-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            <span className="line-clamp-1">Edit Listing</span>
                        </button>
                    </Link>
                    <button 
                        onClick={() => window.dispatchEvent(new CustomEvent('showDeleteModal', { detail: listing._id }))}
                        className="inline-flex items-center rounded-lg bg-red-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
                    >
                        <span className="line-clamp-1">Delete Listing</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ListingCard; 