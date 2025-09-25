import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND || process.env.BACKEND || 'http://localhost:8000';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '12';
    const status = searchParams.get('status') || 'active';

    const url = new URL(`/users/${id}/listings`, API_BASE_URL);
    url.searchParams.set('page', page);
    url.searchParams.set('limit', limit);
    if (status) url.searchParams.set('status', status);

    const res = await fetch(url.toString(), { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ message: 'Failed to fetch user listings' }, { status: 500 });
  }
}
