import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const latitude = searchParams.get('latitude');
        const longitude = searchParams.get('longitude');
        const maxDistance = searchParams.get('maxDistance') || 50000;
        const category = searchParams.get('category');

        if (!latitude || !longitude) {
            return NextResponse.json({ 
                listings: [],
                message: 'Location coordinates are required'
            }, { status: 400 });
        }

        const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND || process.env.BACKEND || 'http://localhost:5000';
        const backendUrl = new URL('/nearby-listings', API_BASE_URL);
        backendUrl.searchParams.set('latitude', latitude);
        backendUrl.searchParams.set('longitude', longitude);
        backendUrl.searchParams.set('maxDistance', String(maxDistance));
        if (category && category !== 'all') backendUrl.searchParams.set('category', category);

        const response = await fetch(backendUrl.toString());
        
        if (!response.ok) {
            throw new Error(`Backend responded with status: ${response.status}`);
        }

        const data = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ 
            listings: [],
            message: 'Failed to fetch nearby listings',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
} 