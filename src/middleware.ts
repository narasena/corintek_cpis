import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/jwt';
import { canAccess, matchPathToResource } from './lib/rbac';

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login'];

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = ['/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookies
  const token = request.cookies.get('auth_token')?.value;

  // Check if user is authenticated
  let isAuthenticated = false;
  let role: string | null = null;
  if (token) {
    try {
      const payload = await verifyToken(token);
      isAuthenticated = true;
      role = (payload as { role?: string }).role ?? null;
    } catch {
      // Token is invalid or expired
      isAuthenticated = false;
    }
  }

  // If user is authenticated and trying to access auth routes (like login)
  // redirect them to the users page
  if (isAuthenticated && AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL('/users', request.url));
  }

  // If user is not authenticated and trying to access protected routes
  // redirect them to login
  if (!isAuthenticated && !PUBLIC_ROUTES.includes(pathname)) {
    // Don't redirect for static files and API routes
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.includes('.')
    ) {
      return NextResponse.next();
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && role) {
    const resource = matchPathToResource(pathname);
    if (resource && !canAccess(role, resource, 'read')) {
      return NextResponse.redirect(new URL('/forbidden', request.url));
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
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
};
