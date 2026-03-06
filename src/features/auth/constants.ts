import { JWT_INFRA_CONFIG, AUTH_INFRA_CONFIG, AUTH_INFRA_ERROR } from '@/lib/constants/auth';

/**
 * Authentication and JWT related constants
 */

export const JWT_CONFIG = JWT_INFRA_CONFIG;

export const AUTH_CONFIG = {
  ...AUTH_INFRA_CONFIG,
  SALT_ROUNDS: 10,
} as const;

export const ERROR_MESSAGES = {
  ...AUTH_INFRA_ERROR,
  AUTHENTICATION_FAILED: 'Email atau kata sandi tidak valid',
  LOGIN_FAILED: 'Login gagal',
} as const;

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login berhasil',
} as const;

/**
 * A pre-computed bcrypt hash (10 rounds) for the word "password" 
 * used to prevent timing attacks during authentication for non-existent users.
 */
export const FAKE_PASSWORD_HASH = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6L6s57WyHYy6H.mK';

export const AUTH_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  FORBIDDEN: '/forbidden',
  USERS: '/users',
} as const;
