import { NextRequest, NextResponse } from 'next/server';

// Prefer explicit BACKEND envs and default to 5000 (backend default port)
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND || process.env.BACKEND || 'http://localhost:5000';

// GET /api/offers - Get all listings with offers for current user
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/api/offers/my-listings-with-offers`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch offers' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching offers:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// POST /api/offers - Submit a new offer
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { listingId, offerAmount, message, contactName, contactPhone } = body;

    const invalidAmount = offerAmount === undefined || offerAmount === null || isNaN(Number(offerAmount)) || Number(offerAmount) < 0;
    if (!listingId || invalidAmount || !message || !contactName || !contactPhone) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: listingId, valid offerAmount (>=0), message, contactName, contactPhone' },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/api/offers/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ listingId, offerAmount, message, contactName, contactPhone }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to submit offer' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error submitting offer:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}