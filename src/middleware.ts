import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/jwt';
import { canAccess, matchPathToResource, getLandingPage } from './lib/rbac';
import { AUTH_CONFIG, AUTH_ROUTES } from './features/auth/constants';
import { IJwtPayload } from './@types/auth.type';

/**
 * Extracts and verifies the user identity from the request cookies.
 */
async function getIdentity(request: NextRequest): Promise<IJwtPayload | null> {
  const token = request.cookies.get(AUTH_CONFIG.COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const identity = await getIdentity(request);
  const isAuthenticated = !!identity;

  // 1. Authenticated users trying to access login/auth routes
  if (isAuthenticated && pathname === AUTH_ROUTES.LOGIN) {
    const landingPage = identity.role
      ? getLandingPage(identity.role)
      : AUTH_ROUTES.USERS;
    return NextResponse.redirect(new URL(landingPage, request.url));
  }

  // 2. Unauthenticated users trying to access protected routes
  if (!isAuthenticated && pathname !== AUTH_ROUTES.LOGIN) {
    const loginUrl = new URL(AUTH_ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. RBAC Check for authenticated users
  if (isAuthenticated) {
    const { role } = identity;
    const resource = matchPathToResource(pathname);

    // If role is missing (invalid identity) or resource access is denied
    if (!role || !resource || !canAccess(role, resource, 'read')) {
      return NextResponse.redirect(new URL(AUTH_ROUTES.FORBIDDEN, request.url));
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
