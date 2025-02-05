import Image from 'next/image';
import Header from '@/app/components/Header';
import MobileNavigation from '@/app/components/MobileNavigation';
import ChatWithSeller from './components/ChatWithSeller';
import MakeOffer from './components/MakeOffer';
import ListingDescription from './components/ListingDescription';

// Fetch function for server-side data fetching
async function getListing(id) {
  try {
    const response = await fetch(`${process.env.BACKEND}/listings/${id}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch listing: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching listing:', error)
    throw error // Re-throw to be handled by the page component
  }
}

async function getRelatedListings(categoryId, currentListingId) {
  try {
    const response = await fetch(`${process.env.BACKEND}/listings?category=${categoryId}&limit=5`)
    if (!response.ok) {
      throw new Error(`Failed to fetch related listings: ${response.statusText}`)
    }
    const data = await response.json()
    // Filter out the current listing and limit to 4 items
    return data
      .filter(listing => listing._id !== currentListingId)
      .slice(0, 4)
  } catch (error) {
    console.error('Error fetching related listings:', error)
    return [] // Return empty array on error
  }
}

async function ListingPage({ params }) {
  const listing = await getListing(params.id);
  const relatedListings = await getRelatedListings(listing?.category_id, params.id);

  if (!listing) return <div>No listing found</div>;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <MobileNavigation />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-12">
        {/* Breadcrumb - Hide on smallest screens */}
        <nav className="hidden sm:block mb-6 sm:mb-8 text-sm">
          <ol className="list-none p-0 flex text-gray-500 dark:text-gray-400">
            <li className="flex items-center">
              <a href="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</a>
              <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li className="text-gray-700 dark:text-gray-300 truncate max-w-[200px]">{listing.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-8">
          {/* Image Section */}
          <div className="md:col-span-5">
            <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl transform transition-transform hover:scale-[1.02]">
              <Image 
                src={`${process.env.NEXT_PUBLIC_MEDIACDN}/uploads/${listing.cover_image}`}
                alt={listing.title}
                width={600}
                height={700}
                className="w-full h-[300px] sm:h-[500px] object-cover"
                priority
              />
              <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex flex-wrap gap-2">
                <span className="bg-blue-600 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium shadow-lg">
                  Recently Posted
                </span>
                {listing.category_id && (
                  <span className="bg-purple-600 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium shadow-lg">
                    {listing.category_id}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="md:col-span-7">
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-lg sm:shadow-xl backdrop-blur-sm bg-opacity-95">
              <div className="space-y-4 sm:space-y-8">
                {/* Title and Price */}
                <div>
                  <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                    {listing.title}
                  </h1>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <span className="text-3xl sm:text-5xl font-bold text-blue-600 dark:text-blue-400">
                      ₹{listing.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      Inclusive of all taxes
                    </span>
                  </div>
                </div>

                {/* Location */}
                {listing.location && (
                  <div className="flex items-center gap-2 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-medium">
                      {listing.location?.city || 'City not specified'}
                      {listing.location?.state && `, ${listing.location.state}`}
                    </p>
                  </div>
                )}

                {/* Description */}
                {listing.description && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg sm:rounded-xl p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">
                      About this item
                    </h2>
                    <ListingDescription description={listing.description} />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <ChatWithSeller phoneNumber={listing.seller_no} listing={listing} />
                  <MakeOffer listing={listing} />
                </div>

                {/* Additional Info */}
                <div className="p-3 sm:p-4 bg-blue-50 dark:bg-gray-700 rounded-lg text-xs sm:text-sm">
                  <p className="text-blue-800 dark:text-blue-200">
                    <span className="font-semibold">💡 Tip:</span> For a safe buying experience, meet the seller at a safe location and inspect the item before making payment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Listings Section */}
        {relatedListings.length > 0 && (
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Similar Listings
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedListings.map((item) => (
                <div key={item._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                  <div className="relative w-full aspect-[4/3]">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_MEDIACDN}/uploads/${item.cover_image}`}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      ₹{item.price.toLocaleString('en-IN')}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                      {item.title}
                    </p>
                    <a
                      href={`/listing/${item._id}`}
                      className="inline-block w-full text-center text-sm text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default ListingPage;
