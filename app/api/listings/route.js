export async function GET() {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND || process.env.BACKEND || 'http://localhost:5000';
    const data = await fetch(`${API_BASE_URL}/listings`);

    if (!data.ok) {
      throw new Error('Failed to fetch listings');
    }

    const posts = await data.json();
 
    return Response.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return Response.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

