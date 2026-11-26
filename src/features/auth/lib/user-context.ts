import { getCurrentUser, AuthenticationError } from '@/lib/auth-helpers';
import { signR2UrlOrNull } from '@/lib/r2-sign';
import { IJwtPayload } from '@/@types/auth.type';
import { TUserResponse } from '@/@types/user.type';
import * as authService from '../service';

/**
 * User context details returned to components.
 * Standardized to match the public user response.
 */
export type ICurrentUserDetails = TUserResponse;

/**
 * Get the full details of the current authenticated user from the database.
 * This function performs a DB status check.
 */
export async function getCurrentUserDetails(): Promise<ICurrentUserDetails | null> {
  const payload = await getCurrentUser();
  if (!payload) return null;

  // Validate session user status using the centralized auth service
  // and return the standardized response object directly.
  const user = await authService.validateSessionUser(payload.id);
  if (!user) return null;

  // The session user's avatar is rendered in the sidebar; sign it for the
  // browser. The stored value stays unsigned.
  return { ...user, avatarUrl: await signR2UrlOrNull(user.avatarUrl) };
}

/**
 * Require authenticated user - throws if not authenticated or user is invalid in DB.
 * Use this in Server Actions or Server Components to get actor payload or fail fast.
 */
export async function requireActor(): Promise<IJwtPayload> {
  const user = await getCurrentUserDetails();
  if (!user) throw new AuthenticationError();
  return { id: user.id, email: user.email, role: user.role };
}

/**
 * Get actor payload or null - returns null if not authenticated or user is invalid in DB.
 * Use this when authentication is optional.
 */
export async function getActorOrNull(): Promise<IJwtPayload | null> {
  const user = await getCurrentUserDetails();
  if (!user) return null;
  return { id: user.id, email: user.email, role: user.role };
}
