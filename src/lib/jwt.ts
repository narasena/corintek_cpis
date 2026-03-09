import { SignJWT, jwtVerify, decodeJwt, errors } from 'jose';
import { IJwtPayload, jwtPayloadSchema } from '@/@types/auth.type';
import { JWT_INFRA_CONFIG, AUTH_INFRA_ERROR } from './constants/auth';
import { TActionResult, ok } from './action-helpers';
import { isZodError, formatZodError } from './utils/validation';

export class JWTError extends Error {
  constructor(
    message: string,
    public code:
      | 'EXPIRED'
      | 'INVALID'
      | 'SECRET_MISSING'
      | 'VALIDATION_FAILED'
  ) {
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
 * @returns Standardized action result containing payload or error string
 */
export async function verifyToken(
  token: string
): Promise<TActionResult<IJwtPayload>> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const data = jwtPayloadSchema.parse(payload);
    return ok(data);
  } catch (error) {
    return mapJwtErrorToActionResult(error, 'JWT.verifyToken');
  }
}

/**
 * Internal helper to map library errors to standardized TActionResult
 * @param error - Caught error from verification process
 * @param context - Function name for error reporting
 */
function mapJwtErrorToActionResult(
  error: unknown,
  context: string
): TActionResult<never> {
  let message = AUTH_INFRA_ERROR.TOKEN_INVALID;

  if (error instanceof errors.JWTExpired) {
    message = AUTH_INFRA_ERROR.TOKEN_EXPIRED;
  } else if (isZodError(error)) {
    message = `${AUTH_INFRA_ERROR.PAYLOAD_VALIDATION_FAILED}: ${formatZodError(
      error
    )}`;
  }

  console.error(`[CPIS-ERROR] ${context}: ${message}`);

  return {
    success: false,
    error: message,
  };
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
