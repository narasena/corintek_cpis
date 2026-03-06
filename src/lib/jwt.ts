import { SignJWT, jwtVerify, decodeJwt, errors } from 'jose';
import { IJwtPayload, jwtPayloadSchema } from '@/@types/auth.type';
import { JWT_INFRA_CONFIG, AUTH_INFRA_ERROR } from './constants/auth';

let cachedSecret: Uint8Array | null = null;

export class JWTError extends Error {
  constructor(message: string, public code: 'EXPIRED' | 'INVALID' | 'SECRET_MISSING' | 'VALIDATION_FAILED') {
    super(message);
    this.name = 'JWTError';
  }
}

/**
 * Internal helper to get and encode JWT_SECRET (memoized)
 * @param context - Function name for error reporting
 */
function getEncodedSecret(context: string): Uint8Array {
  if (cachedSecret) return cachedSecret;

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new JWTError(
      `[CPIS-ERROR] ${context}: ${AUTH_INFRA_ERROR.JWT_SECRET_REQUIRED}`,
      'SECRET_MISSING'
    );
  }

  cachedSecret = new TextEncoder().encode(secret);
  return cachedSecret;
}

/**
 * Generate a JWT token for authenticated user
 * @param payload - User data to encode in token
 * @returns Signed JWT token string
 */
export async function generateToken(
  payload: Omit<IJwtPayload, 'iat' | 'exp'>
): Promise<string> {
  const SECRET_KEY = getEncodedSecret('JWT.generateToken');

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: JWT_INFRA_CONFIG.ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(JWT_INFRA_CONFIG.EXPIRES_IN)
    .sign(SECRET_KEY);
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token string to verify
 * @returns Decoded payload if valid
 */
export async function verifyToken(token: string): Promise<IJwtPayload> {
  const SECRET_KEY = getEncodedSecret('JWT.verifyToken');

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return jwtPayloadSchema.parse(payload);
  } catch (error) {
    if (error instanceof errors.JWTExpired) {
      throw new JWTError(
        `[CPIS-ERROR] JWT.verifyToken: ${AUTH_INFRA_ERROR.TOKEN_EXPIRED}`,
        'EXPIRED'
      );
    }
    
    if (error instanceof Error && error.name === 'ZodError') {
      throw new JWTError(
        `[CPIS-ERROR] JWT.verifyToken: ${AUTH_INFRA_ERROR.PAYLOAD_VALIDATION_FAILED}: ${error.message}`,
        'VALIDATION_FAILED'
      );
    }

    throw new JWTError(
      `[CPIS-ERROR] JWT.verifyToken: ${AUTH_INFRA_ERROR.TOKEN_INVALID}`,
      'INVALID'
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
