import axios from "axios";
import Link from "next/link";
import Header from "./components/Header";
import MobileNavigation from "./components/MobileNavigation";
import Image from "next/image";



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
            <section className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-center bg-white dark:bg-gray-900 p-4 max-w-screen-xl  mx-auto">
                {data && data.map((item:any) => (
                    <div key={item._id} className="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                    <Link href={`/listing/${item._id}`}>
                        <div className="w-full aspect-w-16 aspect-h-9">
                            <Image src={`${process.env.NEXT_PUBLIC_MEDIACDN}/uploads/${item.cover_image}`} className="object-cover w-full h-full aspect-square" alt="Your Image" width={200} height={200}/>
                        </div>
                    </Link>
                    <div className="p-5">
                        <Link href={`/listing/${item._id}`}>
                          <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{item.price}</h5>
                        </Link>
                        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400 line-clamp-1 lg:line-clamp-2">{item.category_id}</p>
                        <div className="flex items-center mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1.5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4c3.865 0 7 3.134 7 7 0 3.337-3 8-7 13-4-5-7-9.663-7-13 0-3.866 3.135-7 7-7zM12 6a2 2 0 100 4 2 2 0 000-4z" />
                            </svg>
                            <p className="font-normal text-gray-700 dark:text-gray-400 line-clamp-1 lg:line-clamp-2">{item.city},{item.country}</p>
                        </div>
                        <Link href={`/listing/${item._id}`} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800  ">
                            <span className="line-clamp-1 ">Check Details</span>
                            
                            <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
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