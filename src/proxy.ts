import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_CONFIG, AUTH_ROUTES } from './features/auth/constants';

/**
 * Thin Proxy - Lightweight routing checks ONLY
 * 
 * Security: This follows the Thin Proxy pattern to avoid CVE-2025-29927
 * - NO JWT verification (moved to Server Components)
 * - NO RBAC checks (moved to Server Components)
 * - NO database calls
 * 
 * Only checks: Does auth cookie exist?
 */

// List of protected routes (public routes that need no auth)
const PUBLIC_ROUTES = [
  AUTH_ROUTES.LOGIN,
  '/forbidden',
  '/_next',
  '/favicon.ico',
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith('/api/'));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAuthCookie = request.cookies.has(AUTH_CONFIG.COOKIE_NAME);

  // 1. Public routes - allow access
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // 2. Protected routes - check cookie existence only
  if (!hasAuthCookie) {
    const loginUrl = new URL(AUTH_ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Authenticated users accessing login page - redirect to dashboard
  if (pathname === AUTH_ROUTES.LOGIN) {
    // Let them through - they'll be redirected by Server Component if needed
    return NextResponse.next();
  }

  // Allow request - actual auth verification happens in Server Components
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
};
