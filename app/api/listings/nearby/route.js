import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        // Get query parameters from the URL
        const { searchParams } = new URL(request.url);
        const latitude = searchParams.get('latitude');
        const longitude = searchParams.get('longitude');
        const maxDistance = searchParams.get('maxDistance') || 50000; // Default 50km

        // Validate coordinates
        if (!latitude || !longitude) {
            return NextResponse.json(
                { message: 'Latitude and longitude are required' },
                { status: 400 }
            );
        }

        // Forward the request to the backend
        const response = await fetch(
            `${process.env.BACKEND}/nearby-listings?latitude=${latitude}&longitude=${longitude}&maxDistance=${maxDistance}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { message: errorData.message || 'Failed to fetch nearby listings' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Error in nearby-listings API:', error);
        return NextResponse.json(
            { 
                message: 'Failed to fetch nearby listings',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
} 