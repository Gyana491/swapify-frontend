import ListingClientPage from './ListingClientPage';

// Fetch function for server-side data fetching
async function getListing(id) {
  try {
    const response = await fetch(`${process.env.BACKEND}/listings/${id}`, {
      cache: 'no-store' // Disable caching for real-time data
    });
    
    
    if (!response.ok) {
      throw new Error(`Failed to fetch listing: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching listing:', error);
    throw error;
  }
}

// Metadata generation for the listing page
export async function generateMetadata({ params }) {
  try {
    const { id } = await params;
    const listing = await getListing(id);
    const baseTitle = listing?.title ? `${listing.title} - Available for Swap` : 'Listing - Swapify';
    const descRaw = listing?.description || 'View this item available for swap on Swapify';
    const description = descRaw.length > 155 ? `${descRaw.slice(0, 155)}...` : descRaw;

    // Build images from cover/additional if "images" not present
    const images = Array.isArray(listing?.images)
      ? listing.images.filter(Boolean)
      : [listing?.cover_image, ...(Array.isArray(listing?.additional_images) ? listing.additional_images : [])].filter(Boolean);

    const ogImages = images.length
      ? images.map(image => ({ url: image, width: 800, height: 600, alt: listing?.title || 'Listing image' }))
      : undefined;

    return {
      title: baseTitle,
      description,
      openGraph: {
        title: listing?.title ? `${listing.title} - Available for Swap on Swapify` : 'Listing - Swapify',
        description,
        images: ogImages,
      },
      twitter: {
        card: 'summary_large_image',
        title: baseTitle,
        description,
        images: images?.[0],
      },
    };
  } catch (error) {
    return {
      title: 'Listing - Swapify',
      description: 'View this item available for swap on Swapify'
    };
  }
}

export default async function ListingPage({ params }) {
  const { id } = await params;
  return <ListingClientPage listingId={id} fallbackErrorMessage="Error loading listing. Please try again later." />;
}


