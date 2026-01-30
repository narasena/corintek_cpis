import { z } from 'zod';
import { TUserRole } from './user.type';

// =============================================================================
// Zod Schemas
// =============================================================================

/**
 * Schema for login credentials
 */
export const authLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Schema for login response
 */
export const authLoginResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  user: z
    .object({
      id: z.string(),
      email: z.string(),
      firstName: z.string(),
      lastName: z.string().nullable(),
      role: z.string(),
    })
    .optional(),
});

// =============================================================================
// Inferred TypeScript Types
// =============================================================================

/** Login credentials input */
export type TAuthLoginInput = z.infer<typeof authLoginSchema>;

/** Login response */
export type TAuthLoginResponse = z.infer<typeof authLoginResponseSchema>;

// =============================================================================
// JWT Payload Interface
// =============================================================================

/**
 * JWT token payload structure
 */
export interface IJwtPayload {
  id: string;
  email: string;
  role: TUserRole;
  iat?: number;
  exp?: number;
}
