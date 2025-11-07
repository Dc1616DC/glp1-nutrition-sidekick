import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Pages that should be hidden from public access
const HIDDEN_ROUTES = [
  '/auth-test',
  '/pwa-test',
  '/pwa-diagnostic',
  '/test-reminders',
  '/test-timing',
  '/admin/import-meals',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current path should be hidden
  if (HIDDEN_ROUTES.some(route => pathname.startsWith(route))) {
    // Redirect to 404
    return NextResponse.redirect(new URL('/404', request.url));
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
