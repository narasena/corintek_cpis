import { cookies } from 'next/headers';
import { verifyToken } from './jwt';
import { IJwtPayload } from '@/@types/auth.type';
import { prisma } from '@/lib/prisma';
import { TUserRole } from '@/@types/user.type';
import bcrypt from 'bcrypt';

export class AuthenticationError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

const AUTH_COOKIE_NAME = 'auth_token';
const SALT_ROUNDS = 10;

/**
 * Get the current authenticated user from cookies
 * @returns User payload from JWT or null if not authenticated
 */
export async function getCurrentUser(): Promise<IJwtPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

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

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      role: true,
      isActive: true,
      isBlocked: true,
      deletedAt: true,
    },
  });

  if (!user || user.deletedAt || !user.isActive || user.isBlocked) return null;

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
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain text password with a hashed password
 * @param password - Plain text password
 * @param hashedPassword - Hashed password from database
 * @returns True if passwords match
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Get auth cookie name (for consistency)
 */
export function getAuthCookieName(): string {
  return AUTH_COOKIE_NAME;
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
