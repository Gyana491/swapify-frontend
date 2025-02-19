import { cookies } from 'next/headers';

export async function GET(request) {
    try {
        // Get location from cookies - make it async
        const cookieStore = await cookies();
        const latitude = cookieStore.get('latitude')?.value;
        const longitude = cookieStore.get('longitude')?.value;
        
        // Get maxDistance from query parameters (optional)
        const { searchParams } = new URL(request.url);
        const maxDistance = searchParams.get('maxDistance') || '50'; // Default to 50km if not specified
        const category = searchParams.get('category'); // Optional category filter
        
        if (!latitude || !longitude) {
            return new Response(JSON.stringify({ 
                error: 'Location not available' 
            }), { 
                status: 400 
            });
        }

        let url = `${process.env.NEXT_PUBLIC_API_URL}/listings/nearby?` +
            `latitude=${latitude}&longitude=${longitude}&maxDistance=${maxDistance}`;
        
        if (category) {
            url += `&category=${encodeURIComponent(category)}`;
        }

        // Fetch listings from backend
        const response = await fetch(url);
        const data = await response.json();
        
        // Sort listings by distance
        const sortedListings = data.sort((a, b) => a.distance - b.distance);
        
        return new Response(JSON.stringify(sortedListings), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error fetching nearby listings:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to fetch nearby listings' 
        }), { 
            status: 500 
        });
    }
} 