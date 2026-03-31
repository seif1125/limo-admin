// middleware.js (in your root or /src folder)
import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('adminToken')?.value;
  const { pathname } = request.nextUrl;

  // 1. If NOT logged in and trying to access /dashboard -> Redirect to /login
  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. If LOGGED in and trying to access /login -> Redirect to /dashboard
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Specify which routes this middleware should run on
export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};