import { getCurrentUser, AuthenticationError } from '@/lib/auth-helpers';
import { IJwtPayload } from '@/@types/auth.type';
import { TUserRole } from '@/@types/user.type';
import * as authService from '../service';

/**
 * User context details returned to components
 */
export interface ICurrentUserDetails {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  avatarUrl: string | null;
  role: TUserRole;
}

/**
 * Get the full details of the current authenticated user from the database.
 * This function performs a DB status check.
 */
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
