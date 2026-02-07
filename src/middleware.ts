import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const session = request.cookies.get('session');
    const { pathname } = request.nextUrl;

    // Protect all routes except /login and public assets
    const isPublicPath = pathname === '/login' || pathname.startsWith('/_next') || pathname.startsWith('/static');

    if (!session && !isPublicPath) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If logged in and trying to go to login, redirect to dashboard
    if (session && pathname === '/login') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If logged in and at root, redirect to dashboard
    if (session && pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
