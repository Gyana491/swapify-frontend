import axios from "axios";
import Link from "next/link";
import Header from "./components/Header";
import MobileNavigation from "./components/MobileNavigation";
import Image from "next/image";

// Helper function to format price in Indian currency
const formatIndianPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(price);
};

const Home = async () => {
    let data = [];
    try {
        const response = await axios.get(`${process.env.HOST}/api/listings`);
        data = response.data;
    } catch (error) {
        console.error('Error fetching listings:', error);
        // Return empty array if fetch fails
        data = [];
    }
    

    return (
        <>
            <Header />
            <MobileNavigation />
            <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 bg-white dark:bg-gray-900 p-3 sm:p-6 max-w-screen-xl mx-auto">
                {data && data.map((item: any) => (
                    <div key={item._id} className="group bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
                        <Link href={`/listing/${item._id}`}>
                            <div className="relative w-full aspect-[4/3] overflow-hidden">
                                <Image 
                                    src={`${process.env.NEXT_PUBLIC_MEDIACDN}/uploads/${item.cover_image}`} 
                                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                                    alt={item.title || "Listing image"}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            </div>
                        </Link>
                        <div className="p-2 sm:p-4">
                            <Link href={`/listing/${item._id}`}>
                                <h5 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
                                    {formatIndianPrice(item.price)}
                                </h5>
                            </Link>
                            <Link href={`/listing/${item._id}`}>
                                <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 mb-1 sm:mb-2 line-clamp-2">
                                    {item.title}
                                </p>
                            </Link>
                            <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 sm:mb-3 capitalize">
                                {item.category_id}
                            </p>
                            <div className="flex items-center mb-2 sm:mb-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4c3.865 0 7 3.134 7 7 0 3.337-3 8-7 13-4-5-7-9.663-7-13 0-3.866 3.135-7 7-7zM12 6a2 2 0 100 4 2 2 0 000-4z" />
                                </svg>
                                <p className="truncate">{item.city}, {item.country}</p>
                            </div>
                            <Link 
                                href={`/listing/${item._id}`} 
                                className="inline-flex items-center w-full justify-center px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-md sm:rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-700 transition-colors duration-200"
                            >
                                View Details
                                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 ms-1 sm:ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                                </svg>
                            </Link>
                        </div>
                    </div>
                ))}
            </section>


        </>
    );
};

export default Home;