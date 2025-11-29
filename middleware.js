import { NextResponse } from 'next/server';

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Check if accessing admin pages (except login)
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
        const session = request.cookies.get('admin_session');

        // If no session, redirect to login
        if (!session) {
            const loginUrl = new URL('/admin/login', request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    // If already logged in and trying to access login page, redirect to admin
    if (pathname === '/admin/login') {
        const session = request.cookies.get('admin_session');
        if (session) {
            const adminUrl = new URL('/admin', request.url);
            return NextResponse.redirect(adminUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*'
};
