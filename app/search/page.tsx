import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";
import MobileNavigation from "../components/MobileNavigation";

// Helper function to format price in Indian currency
const formatIndianPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
};

async function searchListings(query: string) {
  try {
    const response = await fetch(`${process.env.BACKEND}/search-listings?query=${encodeURIComponent(query)}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch search results');
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching listings:', error);
    return [];
  }
}

export default async function SearchPage({
  searchParams
}: {
  searchParams: { q: string }
}) {
  const query = searchParams.q || '';
  const searchResults = await searchListings(query);

  return (
    <>
      <Header />
      <MobileNavigation />
      
      <main className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Search Results
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {searchResults.length} results found for "{query}"
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {searchResults.map((item: any) => (
            <div key={item._id} className="group bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
              <Link href={`/listing/${item._id}`}>
                <div className="relative w-full aspect-[4/3] overflow-hidden">
                  <Image 
                    src={`${process.env.NEXT_PUBLIC_MEDIACDN}/uploads/${item.cover_image}`} 
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    alt={item.title || "Listing image"}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                </div>
              </Link>
              <div className="p-4">
                <Link href={`/listing/${item._id}`}>
                  <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {formatIndianPrice(item.price)}
                  </h5>
                </Link>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 capitalize">
                  {item.title}
                </p>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4c3.865 0 7 3.134 7 7 0 3.337-3 8-7 13-4-5-7-9.663-7-13 0-3.866 3.135-7 7-7zM12 6a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                  <p className="truncate">{item.city}, {item.state}</p>
                </div>
              </div>
            </div>
          ))}

          {searchResults.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                No results found for "{query}"
              </div>
              <Link 
                href="/"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Return to homepage
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
} 