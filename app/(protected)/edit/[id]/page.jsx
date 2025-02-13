import Header from '@/app/components/Header';
import MobileNavigation from '@/app/components/MobileNavigation';
import EditListingForm from './EditListingForm';

// Mark as async server component
export default async function EditListingPage(props) {
  // Get the id from props.params
  const id = await props.params?.id;

  if (!id) {
    return (
      <>
        <Header />
        <MobileNavigation />
        <section className="bg-white dark:bg-gray-900 pb-20 md:pb-4">
          <div className="max-w-3xl px-4 py-4 mx-auto">
            <div className="text-center text-red-600 dark:text-red-400">
              Listing ID not found
            </div>
          </div>
        </section>
      </>
    );
  }
  
  return (
    <>
      <Header />
      <MobileNavigation />
      <section className="bg-white dark:bg-gray-900 pb-20 md:pb-4">
        <div className="max-w-3xl px-4 py-4 mx-auto">
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white text-center">
            Edit Listing
          </h2>
          <EditListingForm listingId={id} />
        </div>
      </section>
    </>
  );
}

// Generate metadata for the page
export async function generateMetadata({ params }) {
  const id = params?.id;
  
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
      title: `Edit: ${listing.title || 'Listing'} - Swapify`,
      description: `Edit your listing: ${listing.title}`
    };
  } catch (error) {
    return {
      title: 'Edit Listing - Swapify',
      description: 'Edit your listing on Swapify'
    };
  }
}