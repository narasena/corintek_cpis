import { cookies } from 'next/headers';
import { verifyToken } from './jwt';
import { IJwtPayload } from '@/@types/auth.type';
import { TUserRole } from '@/@types/user.type';
import { AUTH_CONFIG } from '@/features/auth/constants';
import * as authService from '@/features/auth/service';

// Re-export password primitives from crypto for compatibility
export { comparePassword, hashPassword } from '@/features/auth/crypto';

export class AuthenticationError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Get the current authenticated user from cookies
 * @returns User payload from JWT or null if not authenticated
 */
export async function getCurrentUser(): Promise<IJwtPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    const payload = await verifyToken(token);
    return payload;
  } catch {
    return null;
  }
}

export interface ICurrentUserDetails {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  avatarUrl: string | null;
  role: TUserRole;
}

export async function getCurrentUserDetails(): Promise<ICurrentUserDetails | null> {
  const payload = await getCurrentUser();
  if (!payload) return null;

  // Validate session user status using the centralized auth service
  const user = await authService.validateSessionUser(payload.id);

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    avatarUrl: user.avatarUrl,
    role: user.role as TUserRole,
  };
}

/**
 * Get auth cookie name (for consistency)
 */
export function getAuthCookieName(): string {
  return AUTH_CONFIG.COOKIE_NAME;
}

/**
 * Require authenticated user - throws if not authenticated
 * Use this in Server Actions to get actor payload or fail fast
 */
export async function requireActor(): Promise<IJwtPayload> {
  const user = await getCurrentUserDetails();
  if (!user) throw new AuthenticationError();
  return { id: user.id, email: user.email, role: user.role };
}

/**
 * Get actor or null - returns null if not authenticated
 * Use this when authentication is optional
 */
export async function getActorOrNull(): Promise<IJwtPayload | null> {
  const user = await getCurrentUserDetails();
  if (!user) return null;
  return { id: user.id, email: user.email, role: user.role };
}
