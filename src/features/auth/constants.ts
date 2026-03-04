/**
 * Authentication and JWT related constants
 */

export const JWT_CONFIG = {
  EXPIRES_IN: '7d',
  ALGORITHM: 'HS256' as const,
} as const;

export const AUTH_CONFIG = {
  COOKIE_NAME: 'auth_token',
  SALT_ROUNDS: 10,
} as const;

export const ERROR_MESSAGES = {
  JWT_SECRET_REQUIRED: 'JWT_SECRET environment variable is required',
  TOKEN_INVALID: 'Token tidak valid atau kedaluwarsa',
  PAYLOAD_VALIDATION_FAILED: 'Payload validation failed',
  AUTHENTICATION_FAILED: 'Email atau kata sandi tidak valid',
} as const;

/**
 * A pre-computed bcrypt hash (10 rounds) for the word "password" 
 * used to prevent timing attacks during authentication for non-existent users.
 */
export const FAKE_PASSWORD_HASH = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6L6s57WyHYy6H.mK';
