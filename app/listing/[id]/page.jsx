import Image from 'next/image';
import Header from '@/app/components/Header';
import MobileNavigation from '@/app/components/MobileNavigation';

// Helper components for icons (keeping them client-side)
const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1.5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4c3.865 0 7 3.134 7 7 0 3.337-3 8-7 13-4-5-7-9.663-7-13 0-3.866 3.135-7 7-7zM12 6a2 2 0 100 4 2 2 0 000-4z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
    {/* WhatsApp icon paths */}
  </svg>
);

// Client Components
const ChatWithSeller = ({ seller }) => (
  <button className="w-full md:w-auto mb-2 md:mb-0 inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none">
    <WhatsAppIcon />
    <span className="ml-2">Chat with {seller}</span>
  </button>
);

const MakeOffer = () => (
  <button className="w-full md:w-auto inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:outline-none">
    Make an Offer
  </button>
);

const ListingDescription = ({ description }) => (
  <div className="mt-4">
    <h6 className="mb-2 text-lg font-bold">Description</h6>
    <p className="font-normal text-gray-700 dark:text-gray-400">
      {description}
    </p>
  </div>
);

// Fetch function for server-side data fetching
async function getListing(id) {
  // Mock data for development
  const dummyListing = {
    id: id,
    title: "iPhone 13 Pro Max - Excellent Condition",
    price: 75000,
    cover_image: "20250109062236-Screenshot__2_.png", // Make sure this image exists in your public/uploads folder
    description: "Selling my iPhone 13 Pro Max 256GB in excellent condition. Used for 6 months, no scratches or dents. Comes with original box, charger, and warranty card. Battery health 98%.",
    location: {
      city: "Mumbai",
      state: "Maharashtra"
    },
    seller: {
      username: "JohnDoe",
      phone: "+91 9876543210"
    },
    created_at: new Date().toISOString()
  };

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return dummyListing;
}

// Make the page component async
async function ListingPage({ params }) {
  const listing = await getListing(params.id);

  if (!listing) return <div>No listing found</div>;

  return (
    <>
      <Header />
      <MobileNavigation />
      <section className="p-2 bg-white dark:bg-gray-900 dark:text-white">
        <div className="mx-auto mb-4 flex flex-col gap-2 sm:flex-row max-w-screen-xl">
          <div className="w-full md:w-2/6">
            <div className="w-full relative border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
              <Image 
                src={`${process.env.NEXT_PUBLIC_MEDIACDN}/uploads/${listing.cover_image}`}
                alt={listing.title}
                width={400}
                height={450}
                className="w-full h-[400px] object-cover lg:h-[450px] rounded-lg"
              />
              <button className="absolute top-0 bg-blue-500 text-white p-2 rounded hover:bg-blue-800 m-2">
                Recently Posted
              </button>
            </div>
          </div>

          <div className="w-full flex flex-col justify-between md:w-4/6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 p-4">
            <div>
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {listing.title}
              </h5>
              <h3 className="mb-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                ₹{listing.price}
              </h3>
              
              {listing.location && (
                <div className="flex items-center mb-3">
                  <LocationIcon />
                  <p className="font-normal text-gray-700 dark:text-gray-400 line-clamp-1 lg:line-clamp-2">
                    {listing.location?.city || 'City not specified'}
                    {listing.location?.state && `, ${listing.location.state}`}
                  </p>
                </div>
              )}
            </div>

            <div className="md:flex gap-4">
              <ChatWithSeller seller={listing.seller?.username || 'unknown'} />
              <MakeOffer />
            </div>

            {listing.description && (
              <ListingDescription description={listing.description} />
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default ListingPage;
