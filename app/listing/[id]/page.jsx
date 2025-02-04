"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const ListingPage = ({ params }) => {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDescription, setShowDescription] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`/api/listings/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch listing');
        }
        const data = await response.json();
        setListing(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchListing();
    }
  }, [params.id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!listing) return <div>No listing found</div>;

  const handleSubmitOffer = (e) => {
    e.preventDefault();
    // Handle offer submission
    setShowModal(false);
  };

  return (
    <section className="p-2 bg-white dark:bg-gray-900 dark:text-white">
      <div className="mx-auto mb-4 flex flex-col gap-2 sm:flex-row max-w-screen-xl">
        <div className="w-full md:w-2/6">
          <div className="w-full relative border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <Image 
              src={`/uploads/${listing.cover_image}`}
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
            
            <div className="flex items-center mb-3">
              <LocationIcon />
              <p className="font-normal text-gray-700 dark:text-gray-400 line-clamp-1 lg:line-clamp-2">
                {listing.location.city}, {listing.location.state}
              </p>
            </div>
          </div>

          <div className="md:flex gap-4">
            <button onClick={() => router.push(`/messages?seller=${listing.seller.username}`)} 
                    className="flex items-center justify-center gap-2 text-white bg-green-700 max-w-sm hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-bold rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
              <WhatsAppIcon />
              Chat With Seller
            </button>

            <button onClick={() => setShowModal(true)}
                    className="w-full lg:w-2/4 flex items-center justify-center gap-2 text-white bg-yellow-500 hover:bg-yellow-400 focus:ring-2 focus:ring-yellow-300 font-bold text-center rounded-lg text-sm px-5 py-2.5 me-2 mb-2">
              Make Offer
            </button>
          </div>

          {listing.description && (
            <div className="w-full flex flex-col justify-between bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 p-4">
              <p className={`${!showDescription && 'line-clamp-6'}`}>
                {listing.description}
              </p>
              {listing.description.split(' ').length > 20 && (
                <button onClick={() => setShowDescription(!showDescription)}
                        className="text-start font-bold underline cursor-pointer">
                  {showDescription ? 'Read Less' : 'Read More'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Offer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 w-full max-w-md">
            {/* Modal content */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Make Offer</h3>
              <button onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmitOffer}>
              <div className="mb-4">
                <label className="block mb-2">Offer Price</label>
                <input
                  type="number"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter your offer"
                  required
                />
              </div>
              <button type="submit" 
                      className="w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-400">
                Submit Offer
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

// Helper components for icons
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

export default ListingPage;
