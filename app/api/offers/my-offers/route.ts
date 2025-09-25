import { NextRequest, NextResponse } from 'next/server';

// Prefer explicit BACKEND envs and default to 8000 per project config
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND || process.env.BACKEND || 'http://localhost:8000';

// GET /api/offers/my-offers - Get offers made by current user (buyer)
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/api/offers/my-offers`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch your offers' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching user offers:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
