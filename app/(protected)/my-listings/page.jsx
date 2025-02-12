import { cookies } from 'next/headers';
import Header from "@/app/components/Header";
import MobileNavigation from "@/app/components/MobileNavigation";
import ListingsContainer from './ListingsContainer';

async function getListings() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');
    const token = tokenCookie?.value;

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${process.env.BACKEND}/my-listings`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch listings');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching listings:', error);
    return [];
  }
}

export default async function MyListings() {
  const listings = await getListings();
  
  return (
    <>
      <Header />
      <MobileNavigation />
      
      <section className="bg-white dark:bg-gray-900 mb-[60px] md:mb-2">
        <h1 className="text-2xl text-center font-bold tracking-tight text-gray-900 dark:text-white my-4">
          My Listings
        </h1>

        <ListingsContainer initialListings={listings} />
      </section>
    </>
  );
}