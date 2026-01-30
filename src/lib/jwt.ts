import jwt from 'jsonwebtoken';
import { IJwtPayload } from '@/@types/auth.type';

const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

/**
 * Generate a JWT token for authenticated user
 * @param payload - User data to encode in token
 * @returns Signed JWT token string
 */
export function generateToken(
  payload: Omit<IJwtPayload, 'iat' | 'exp'>
): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token string to verify
 * @returns Decoded payload if valid
 * @throws Error if token is invalid or expired
 */
export function verifyToken(token: string): IJwtPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as IJwtPayload;
    return decoded;
  } catch {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Decode a JWT token without verification (use with caution)
 * @param token - JWT token string to decode
 * @returns Decoded payload or null if invalid
 */
export function decodeToken(token: string): IJwtPayload | null {
  try {
    return jwt.decode(token) as IJwtPayload;
  } catch {
    return null;
  }
}
