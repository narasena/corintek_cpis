import { SignJWT, jwtVerify, decodeJwt } from 'jose';
import { IJwtPayload } from '@/@types/auth.type';

// Ensure secret is encoded as Uint8Array for jose
const JWT_SECRET = process.env.JWT_SECRET;
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);
const JWT_EXPIRES_IN = '7d';

/**
 * Generate a JWT token for authenticated user
 * @param payload - User data to encode in token
 * @returns Signed JWT token string
 * @throws Error if JWT_SECRET is not configured
 */
export async function generateToken(
  payload: Omit<IJwtPayload, 'iat' | 'exp'>
): Promise<string> {
  if (!JWT_SECRET) {
    throw new Error(
      '[CPIS-ERROR] JWT.generateToken: JWT_SECRET environment variable is required'
    );
  }

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(SECRET_KEY);
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token string to verify
 * @returns Decoded payload if valid
 * @throws Error if token is invalid or expired or JWT_SECRET is not configured
 */
export async function verifyToken(token: string): Promise<IJwtPayload> {
  if (!JWT_SECRET) {
    throw new Error(
      '[CPIS-ERROR] JWT.verifyToken: JWT_SECRET environment variable is required'
    );
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as IJwtPayload;
  } catch {
    throw new Error(
      '[CPIS-ERROR] JWT.verifyToken: Token tidak valid atau kedaluwarsa'
    );
  }
}

/**
 * Decode a JWT token without verification (use with caution)
 * @param token - JWT token string to decode
 * @returns Decoded payload or null if invalid
 */
export function decodeToken(token: string): IJwtPayload | null {
  try {
    return decodeJwt(token) as unknown as IJwtPayload;
  } catch {
    return null;
  }
}
