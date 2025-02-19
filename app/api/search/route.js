import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const latitude = searchParams.get('latitude');
  const longitude = searchParams.get('longitude');
  const maxDistance = searchParams.get('maxDistance') || 50;
  const category = searchParams.get('category');
  const subcategory = searchParams.get('subcategory');

  if (!query) {
    return NextResponse.json({ message: 'Search query is required' }, { status: 400 });
  }

  const url = `${process.env.BACKEND}/search-listings?query=${encodeURIComponent(query)}` +
    `&latitude=${latitude}&longitude=${longitude}&maxDistance=${maxDistance}` +
    (category ? `&category=${category}` : '') +
    (subcategory ? `&subcategory=${subcategory}` : '');

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch search results');
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching search listings:', error);
    return NextResponse.json({ message: 'Error fetching search listings' }, { status: 500 });
  }
}