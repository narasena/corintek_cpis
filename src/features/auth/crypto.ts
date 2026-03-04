import bcrypt from 'bcrypt';
import { AUTH_CONFIG, FAKE_PASSWORD_HASH } from './constants';

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, AUTH_CONFIG.SALT_ROUNDS);
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
 * Securely compares a provided password against a potential user password.
 * Implements timing-attack prevention by always performing a comparison,
 * using a fake hash if the user's password is not provided.
 * 
 * @param providedPassword - Plain text password from login attempt
 * @param userPassword - Hashed password from database (or undefined if user not found)
 * @returns True only if userPassword exists AND matches providedPassword
 */
export async function secureCompare(
  providedPassword: string,
  userPassword?: string
): Promise<boolean> {
  // Use a fake hash for non-existent users to normalize response time (~100ms)
  const hashToVerify = userPassword || FAKE_PASSWORD_HASH;
  const isValid = await comparePassword(providedPassword, hashToVerify);

  // If userPassword was undefined, the check MUST fail even if providedPassword
  // somehow matches the fake hash (e.g. if the attacker knows the fake hash's plaintext).
  return !!userPassword && isValid;
}
