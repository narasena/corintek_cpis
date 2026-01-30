import { z } from 'zod';

// =============================================================================
// Enums (Mirrors Prisma schema)
// =============================================================================

export const UserRole = {
  ADMIN: 'ADMIN',
  SUPERVISOR: 'SUPERVISOR',
  TECHNICIAN: 'TECHNICIAN',
  DIRECTOR: 'DIRECTOR',
  CLIENT_TECHNICIAN: 'CLIENT_TECHNICIAN',
  CLIENT_SUPERVISOR: 'CLIENT_SUPERVISOR',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const EmploymentStatus = {
  PERMANENT: 'PERMANENT',
  CONTRACT: 'CONTRACT',
  FREELANCE: 'FREELANCE',
} as const;

export type EmploymentStatus =
  (typeof EmploymentStatus)[keyof typeof EmploymentStatus];

// =============================================================================
// Zod Schemas
// =============================================================================

/**
 * Schema for creating a new user
 */
export const userCreateSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required').max(100),
    lastName: z.string().max(100).optional().nullable(),
    idNumber: z.string().max(50).optional().nullable(),
    email: z.email('Invalid email address'),
    phoneNumber: z.string().min(1, 'Phone number is required').max(20),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    avatarUrl: z.url().optional().nullable(),
    role: z.enum(UserRole as unknown as { [k: string]: string }),
    employmentStatus: z.enum(
      EmploymentStatus as unknown as { [k: string]: string }
    ),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/**
 * Schema for updating a user (all fields optional except id)
 */
export const userUpdateSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().max(100).optional().nullable(),
  idNumber: z.string().max(50).optional().nullable(),
  email: z.email().optional(),
  phoneNumber: z.string().min(1).max(20).optional(),
  password: z.string().min(8).optional(),
  avatarUrl: z.url().optional().nullable(),
  role: z.enum(UserRole as unknown as { [k: string]: string }).optional(),
  employmentStatus: z
    .enum(EmploymentStatus as unknown as { [k: string]: string })
    .optional(),
  isActive: z.boolean().optional(),
  isBlocked: z.boolean().optional(),
});

/**
 * Schema for user response (excludes sensitive data like password)
 */
export const userResponseSchema = z.object({
  id: z.uuid(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  idNumber: z.string().nullable(),
  email: z.email(),
  phoneNumber: z.string(),
  avatarUrl: z.url().nullable(),
  role: z.enum(UserRole as unknown as { [k: string]: string }),
  employmentStatus: z.enum(
    EmploymentStatus as unknown as { [k: string]: string }
  ),
  isActive: z.boolean(),
  isBlocked: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
});

/**
 * Schema for user login
 */
export const userLoginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Schema for listing users with pagination
 */
export const userListParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  role: z.enum(UserRole as unknown as { [k: string]: string }).optional(),
  employmentStatus: z
    .enum(EmploymentStatus as unknown as { [k: string]: string })
    .optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(['firstName', 'lastName', 'email', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// =============================================================================
// Inferred TypeScript Types
// =============================================================================

/** Input type for creating a user */
export type UserCreateInput = z.infer<typeof userCreateSchema>;

/** Input type for updating a user */
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

/** User response type (safe to expose, no password) */
export type UserResponse = z.infer<typeof userResponseSchema>;

/** Login credentials */
export type UserLoginInput = z.infer<typeof userLoginSchema>;

/** User list query parameters */
export type UserListParams = z.infer<typeof userListParamsSchema>;

/** Paginated user list response */
export interface UserListResponse {
  data: UserResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
