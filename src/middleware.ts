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

/**
 * Standardizes redirects within the middleware perimeter
 */
function redirectTo(request: NextRequest, path: string, params?: Record<string, string>): NextResponse {
  const url = new URL(path, request.url);
  if (params) {
    Object.entries(params).forEach(([key, val]) => url.searchParams.set(key, val));
  }
  return NextResponse.redirect(url);
}

/**
 * Handles authentication-related redirects (Login-to-Dashboard, Protected-to-Login).
 */
function handleAuthGuard(request: NextRequest, identity: IJwtPayload | null): NextResponse | null {
  const { pathname } = request.nextUrl;
  const isAuthenticated = !!identity;

  // 1. Authenticated users trying to access login/auth routes
  if (isAuthenticated && pathname === AUTH_ROUTES.LOGIN) {
    const landingPage = identity?.role
      ? getLandingPage(identity.role)
      : AUTH_ROUTES.USERS;
    return redirectTo(request, landingPage);
  }

  // 2. Unauthenticated users trying to access protected routes
  if (!isAuthenticated && pathname !== AUTH_ROUTES.LOGIN) {
    return redirectTo(request, AUTH_ROUTES.LOGIN, { from: pathname });
  }

  return null;
}

/**
 * Handles authorization-related checks (RBAC resource matching and permissions).
 */
function handleRbacGuard(request: NextRequest, identity: IJwtPayload): NextResponse | null {
  const { pathname } = request.nextUrl;
  const { role } = identity;
  const resource = matchPathToResource(pathname);

  // If role is missing (invalid identity) or resource access is denied
  if (!role || !resource || !canAccess(role, resource, 'read')) {
    return redirectTo(request, AUTH_ROUTES.FORBIDDEN);
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const identity = await getIdentity(request);

  // 1. Check Authentication Perimeter
  const authGuardResponse = handleAuthGuard(request, identity);
  if (authGuardResponse) return authGuardResponse;

  // 2. Check Authorization Perimeter (RBAC)
  if (identity) {
    const rbacGuardResponse = handleRbacGuard(request, identity);
    if (rbacGuardResponse) return rbacGuardResponse;
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
