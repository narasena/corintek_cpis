/**
 * Core Security & Auth Infrastructure Constants
 * 
 * Foundational constants used by the infrastructure layer.
 * These are separated from feature-level constants to prevent circular dependencies.
 */

export const JWT_INFRA_CONFIG = {
  EXPIRES_IN: '7d',
  ALGORITHM: 'HS256' as const,
} as const;

export const AUTH_INFRA_CONFIG = {
  COOKIE_NAME: 'auth_token',
  COOKIE_MAX_AGE: 60 * 60 * 24 * 7, // 7 days
} as const;

export const AUTH_INFRA_ERROR = {
  JWT_SECRET_REQUIRED: 'JWT_SECRET environment variable is required',
  TOKEN_INVALID: 'Token tidak valid',
  TOKEN_EXPIRED: 'Sesi telah berakhir, silakan login kembali',
  PAYLOAD_VALIDATION_FAILED: 'Data token tidak valid (Skema mismatch)',
} as const;
