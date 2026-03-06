import { cookies } from 'next/headers';
import { verifyToken, generateToken } from './jwt';
import { IJwtPayload } from '@/@types/auth.type';
import { AUTH_INFRA_CONFIG } from './constants/auth';

// Re-export password primitives from crypto for compatibility
export { comparePassword, hashPassword } from '@/features/auth/crypto';

/**
 * Foundational Authentication Error
 */
export class AuthenticationError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Get the current authenticated user payload from cookies (Infrastructure Layer)
 * This only verifies the JWT, it does NOT check the database status.
 * @returns User payload from JWT or null if not authenticated
 */
export async function getCurrentUser(): Promise<IJwtPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_INFRA_CONFIG.COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    const payload = await verifyToken(token);
    return payload;
  } catch {
    return null;
  }
}

/**
 * Set an authenticated session cookie
 * @param payload - User data to store in JWT
 */
export async function setAuthSession(
  payload: Omit<IJwtPayload, 'iat' | 'exp'>
): Promise<void> {
  const token = await generateToken(payload);
  const cookieStore = await cookies();

  cookieStore.set(AUTH_INFRA_CONFIG.COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: AUTH_INFRA_CONFIG.COOKIE_MAX_AGE,
    path: '/',
  });
}

/**
 * Delete the authenticated session cookie
 */
export async function deleteAuthSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_INFRA_CONFIG.COOKIE_NAME);
}

/**
 * Get auth cookie name (for consistency)
 */
export function getAuthCookieName(): string {
  return AUTH_INFRA_CONFIG.COOKIE_NAME;
}
