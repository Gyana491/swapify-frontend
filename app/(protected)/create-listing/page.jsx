import CreateListingForm from './CreateListingForm';
import Header from '@/app/components/header/Header';
import MobileNavigation from '@/app/components/MobileNavigation';

const CreateListingPage = () => {
  return (
    <>
      <Header />
      <MobileNavigation />
      
      <section className="bg-white dark:bg-gray-900 pb-20 md:pb-4">
        <div className="max-w-3xl px-4 py-4 mx-auto">
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white text-center">
            Create New Listing
          </h2>
          <CreateListingForm />
        </div>
      </section>
    </>
  );
};

export default CreateListingPage;