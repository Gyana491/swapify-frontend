import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './app/utils/verifyToken';

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.redirect(new URL('/auth/login', request.url));
    
    const authData = await verifyToken(token);
    if (!authData || !authData.isLoggedIn) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    
    // Store user data in headers for access in protected routes
    const response = NextResponse.next();
    if (authData.user) {
        response.headers.set('x-user-id', authData.user._id);
    }
    return response;
}

export const config = {
    matcher: [
        '/create-listing',
        '/my-listings',
        '/my-profile',
        '/edit-listing/:path*',
        '/profile-setup'
    ]
}