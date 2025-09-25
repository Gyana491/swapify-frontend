import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query');
        const latitude = searchParams.get('latitude');
        const longitude = searchParams.get('longitude');
        const maxDistance = searchParams.get('maxDistance') || 50;

        if (!query) {
            return NextResponse.json({ 
                listings: [],
                message: 'Search query is required' 
            }, { status: 400 });
        }

        // Construct the backend URL with all parameters
    const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND || process.env.BACKEND || 'http://localhost:5000';
    const backendUrl = new URL('/search-listings', API_BASE_URL);
        backendUrl.searchParams.set('query', query);
        
        if (latitude && longitude) {
            backendUrl.searchParams.set('latitude', latitude);
            backendUrl.searchParams.set('longitude', longitude);
            backendUrl.searchParams.set('maxDistance', maxDistance);
        }

        // console.log('Fetching from backend:', backendUrl.toString());

        const response = await fetch(backendUrl.toString(), {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Backend error: ${errorText}`);
        }

    const data = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        
        return NextResponse.json({ 
            listings: [],
            total: 0,
            message: 'Failed to fetch search results',
            error: error.message
        }, { 
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            }
        });
    }
}