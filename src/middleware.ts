import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const session = request.cookies.get('session');
    const { pathname } = request.nextUrl;

    // We only run on routes matched in the config below (/dashboard and /login)
    
    // 1. Unauthenticated users trying to access the dashboard
    if (!session && pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 2. Authenticated users trying to access the login page
    if (session && pathname === '/login') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

// Narrowing the matcher ensures the public homepage is served instantly 
// without ever invoking the middleware logic.
export const config = {
    matcher: ['/dashboard/:path*', '/login'],
};
