import { cookies } from 'next/headers';
import { verifyToken } from './jwt';
import { IJwtPayload } from '@/@types/auth.type';
import bcrypt from 'bcrypt';

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

    const payload = verifyToken(token);
    return payload;
  } catch {
    return null;
  }
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
