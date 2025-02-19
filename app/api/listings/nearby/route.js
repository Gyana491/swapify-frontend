import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const cookieStore = cookies();
    const latitude = cookieStore.get('latitude')?.value;
    const longitude = cookieStore.get('longitude')?.value;
    
    // Get maxDistance from query parameters (optional)
    const { searchParams } = new URL(request.url);
    const maxDistance = searchParams.get('maxDistance') || 100000; // Default 100km
    const category = searchParams.get('category'); // Optional category filter
    
    if (!latitude || !longitude) {
        return NextResponse.json(
            { error: 'Location not set' },
            { status: 400 }
        );
    }

    try {
        let url = `${process.env.BACKEND}/nearby-listings?latitude=${latitude}&longitude=${longitude}&maxDistance=${maxDistance}`;
        
        if (category) {
            url += `&category=${encodeURIComponent(category)}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch nearby listings');
        }

        const data = await response.json();
        
        // Sort listings by distance
        const sortedListings = data.sort((a, b) => a.distance - b.distance);
        
        return NextResponse.json(sortedListings);
    } catch (error) {
        console.error('Error fetching nearby listings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch nearby listings' },
            { status: 500 }
        );
    }
} 