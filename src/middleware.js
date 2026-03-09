import { NextResponse } from 'next/server';

export function middleware(request) {
  // We can't access localStorage in Middleware (server-side),
  // but we can check for a cookie if you decide to store the token there.
  // For now, client-side protection in page.js is usually enough for a simple admin panel.
  
  return NextResponse.next();
}