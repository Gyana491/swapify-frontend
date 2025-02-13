import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    // Await params before destructuring
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    // Fetch listing from backend
    const response = await fetch(`${process.env.BACKEND}/listings/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch listing');
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching listing:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch listing' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    // Await params before destructuring
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      );
    }

    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    const body = await request.json();

    const response = await fetch(`${process.env.BACKEND}/listings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    );
  }
}


