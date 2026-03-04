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
} as const;
