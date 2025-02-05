import Header from '@/app/components/Header';
import MobileNavigation from '@/app/components/MobileNavigation';
import EditListingForm from './EditListingForm';

// Mark as async server component
async function EditListingPage({ params }) {
  const { id } = params;

  
  return (
    <>
      <Header />
      <MobileNavigation />
      <section className="bg-white dark:bg-gray-900">
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

export default EditListingPage;