import Header from '@/app/components/header/Header';
import MobileNavigation from '@/app/components/MobileNavigation';
import EditListingForm from './EditListingForm';

// Mark as async server component
export default async function EditListingPage({ params }) {
  const { id } = params;

  if (!id) {
    return (
      <>
        <Header />
        <MobileNavigation />
        <section className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen pb-20 md:pb-4">
          <div className="max-w-3xl px-4 py-8 mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">❌</span>
              </div>
              <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                Listing Not Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                The listing ID is missing or invalid.
              </p>
            </div>
          </div>
        </section>
      </>
    );
  }
  
  return (
    <>
      <Header />
      <section className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="px-4 py-6 sm:py-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-3">
                Edit Your Listing
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Update your product details, images, and pricing to attract more buyers
              </p>
            </div>
          </div>
          <EditListingForm listingId={id} />
        </div>
      </section>
      <MobileNavigation />
    </>
  );
}

// Generate metadata for the page
export async function generateMetadata({ params }) {
  const { id } = params;
  
  if (!id) {
    return {
      title: 'Edit Listing - Swapify',
      description: 'Edit your listing on Swapify'
    };
  }

  try {
    const response = await fetch(`${process.env.BACKEND}/listings/${id}`);
    const listing = await response.json();

    return {
      title: `Edit: ${listing.title} - Swapify`,
      description: `Edit your listing: ${listing.title}`
    };
  } catch (error) {
    return {
      title: 'Edit Listing - Swapify',
      description: 'Edit your listing on Swapify'
    };
  }
}