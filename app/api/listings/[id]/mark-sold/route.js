import { NextResponse } from 'next/server';

export async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        const tokenCookie = request.cookies.get('token');
        const token = tokenCookie ? tokenCookie.value : null;

        if (!token) {
            return NextResponse.json(
                { message: 'No authentication token found' },
                { status: 401 }
            );
        }

    const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND || process.env.BACKEND || 'http://localhost:5000';
    const response = await fetch(`${API_BASE_URL}/listings/${id}/mark-sold`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { message: data.message || 'Failed to mark listing as sold' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error marking listing as sold:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
