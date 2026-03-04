import { SignJWT, jwtVerify, decodeJwt } from 'jose';
import { IJwtPayload, jwtPayloadSchema } from '@/@types/auth.type';
import { JWT_CONFIG, ERROR_MESSAGES } from '@/features/auth/constants';

let cachedSecret: Uint8Array | null = null;

/**
 * Internal helper to get and encode JWT_SECRET (memoized)
 * @param context - Function name for error reporting
 */
function getEncodedSecret(context: string): Uint8Array {
  if (cachedSecret) return cachedSecret;

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      `[CPIS-ERROR] ${context}: ${ERROR_MESSAGES.JWT_SECRET_REQUIRED}`
    );
  }

  cachedSecret = new TextEncoder().encode(secret);
  return cachedSecret;
}

/**
 * Generate a JWT token for authenticated user
 * @param payload - User data to encode in token
 * @returns Signed JWT token string
 * @throws Error if JWT_SECRET is not configured
 */
export async function generateToken(
  payload: Omit<IJwtPayload, 'iat' | 'exp'>
): Promise<string> {
  const SECRET_KEY = getEncodedSecret('JWT.generateToken');

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: JWT_CONFIG.ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(JWT_CONFIG.EXPIRES_IN)
    .sign(SECRET_KEY);
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token string to verify
 * @returns Decoded payload if valid
 * @throws Error if token is invalid or expired or JWT_SECRET is not configured
 */
export async function verifyToken(token: string): Promise<IJwtPayload> {
  const SECRET_KEY = getEncodedSecret('JWT.verifyToken');

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return jwtPayloadSchema.parse(payload);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      throw new Error(
        `[CPIS-ERROR] JWT.verifyToken: ${ERROR_MESSAGES.PAYLOAD_VALIDATION_FAILED}: ${error.message}`
      );
    }
    throw new Error(
      `[CPIS-ERROR] JWT.verifyToken: ${ERROR_MESSAGES.TOKEN_INVALID}`
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
    const payload = decodeJwt(token);
    const result = jwtPayloadSchema.safeParse(payload);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}
