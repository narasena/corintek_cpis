import { SignJWT, jwtVerify, decodeJwt, errors } from 'jose';
import { IJwtPayload, jwtPayloadSchema } from '@/@types/auth.type';
import { JWT_INFRA_CONFIG, AUTH_INFRA_ERROR } from './constants/auth';

export class JWTError extends Error {
  constructor(message: string, public code: 'EXPIRED' | 'INVALID' | 'SECRET_MISSING' | 'VALIDATION_FAILED') {
    super(message);
    this.name = 'JWTError';
  }
}

/**
 * Fail-fast initialization of the JWT secret key (Encapsulated Constant)
 */
const SECRET_KEY = (() => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new JWTError(
      `[CPIS-ERROR] JWT.init: ${AUTH_INFRA_ERROR.JWT_SECRET_REQUIRED}`,
      'SECRET_MISSING'
    );
  }
  return new TextEncoder().encode(secret);
})();

/**
 * Generate a JWT token for authenticated user
 * @param payload - User data to encode in token
 * @returns Signed JWT token string
 */
export async function generateToken(
  payload: Omit<IJwtPayload, 'iat' | 'exp'>
): Promise<string> {
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
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return jwtPayloadSchema.parse(payload);
  } catch (error) {
    throw handleJwtError(error, 'JWT.verifyToken');
  }
}

/**
 * Internal helper to map library errors to domain-specific JWTError
 * @param error - Caught error from verification process
 * @param context - Function name for error reporting
 */
function handleJwtError(error: any, context: string): JWTError {
  if (error instanceof errors.JWTExpired) {
    return new JWTError(
      `[CPIS-ERROR] ${context}: ${AUTH_INFRA_ERROR.TOKEN_EXPIRED}`,
      'EXPIRED'
    );
  }

  if (error instanceof Error && (error.name === 'ZodError' || (error as any).issues)) {
    return new JWTError(
      `[CPIS-ERROR] ${context}: ${AUTH_INFRA_ERROR.PAYLOAD_VALIDATION_FAILED}: ${error.message}`,
      'VALIDATION_FAILED'
    );
  }

  return new JWTError(
    `[CPIS-ERROR] ${context}: ${AUTH_INFRA_ERROR.TOKEN_INVALID}`,
    'INVALID'
  );
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
