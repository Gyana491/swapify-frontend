import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    
    // If no token, redirect to login
    if (!token) {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('next', new URL(request.url).pathname + new URL(request.url).search);
        return NextResponse.redirect(loginUrl);
    }

    try {
        // Verify token with backend
        const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND || process.env.BACKEND || 'http://localhost:8000';
        const verifyResponse = await fetch(`${API_BASE_URL}/verify-token`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await verifyResponse.json();

        // If verification failed
        if (!verifyResponse.ok || !data.isLoggedIn) {
            const loginUrl = new URL('/auth/login', request.url);
            loginUrl.searchParams.set('next', new URL(request.url).pathname + new URL(request.url).search);
            const response = NextResponse.redirect(loginUrl);
            response.cookies.delete('token');
            return response;
        }

        // Token is valid, proceed with the request
        const response = NextResponse.next();
        if (data.user?._id) {
            response.headers.set('x-user-id', data.user._id);
        }
        
        return response;
    } catch (error) {
        // Only redirect on actual errors, not verification failures
        return NextResponse.next();
    }
}

export const config = {
    matcher: [
        '/my-profile',
        '/my-profile/:path*',
        '/create-listing',
        '/create-listing/:path*',
        '/edit/:path*',
        '/my-listings',
        '/my-listings/:path*',
        '/offers',
        '/offers/:path*'
    ]
}