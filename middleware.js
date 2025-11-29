import { NextResponse } from 'next/server';

export function middleware(request) {
    const { pathname } = request.nextUrl;
    const hostname = request.headers.get('host');

    // 1. ADMIN AUTHENTICATION
    // Check if accessing admin pages (except login)
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
        const session = request.cookies.get('admin_session');
        if (!session) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    // If already logged in and trying to access login page, redirect to admin
    if (pathname === '/admin/login') {
        const session = request.cookies.get('admin_session');
        if (session) {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
    }

    // 2. SUBDOMAIN/CUSTOM DOMAIN ROUTING
    // Exclude API, Admin, Static files, and Next.js internals
    if (
        !pathname.startsWith('/admin') &&
        !pathname.startsWith('/api') &&
        !pathname.startsWith('/_next') &&
        !pathname.startsWith('/favicon.ico') &&
        !pathname.match(/\.(jpg|jpeg|png|gif|svg|css|js)$/)
    ) {
        // Check if we are on the custom domain (or any domain that isn't localhost/vercel-preview)
        // You can be more specific: if (hostname === 'latest.swivomagic.com')
        // For now, we'll apply this rewrite logic to ALL domains for root paths that aren't home

        // If path is just '/', do nothing (shows home page)
        if (pathname === '/') {
            return NextResponse.next();
        }

        // If path starts with /category/, let it through (don't rewrite)
        if (pathname.startsWith('/category/')) {
            return NextResponse.next();
        }

        // If path is NOT starting with /article, rewrite it to /article/[slug]
        // This allows 'latest.swivomagic.com/my-slug' to render 'app/article/[slug]'
        if (!pathname.startsWith('/article/')) {
            const url = request.nextUrl.clone();
            url.pathname = `/article${pathname}`;
            return NextResponse.rewrite(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
