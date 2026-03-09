import { z } from 'zod';

// =============================================================================
// Enums (Mirrors Prisma schema)
// =============================================================================

export const UserRole = {
  ADMIN: 'ADMIN',
  SUPERVISOR: 'SUPERVISOR',
  TECHNICIAN: 'TECHNICIAN',
  REPORTING: 'REPORTING',
  DIRECTOR: 'DIRECTOR',
  CLIENT: 'CLIENT',
  CLIENT_TECHNICIAN: 'CLIENT_TECHNICIAN',
  CLIENT_SUPERVISOR: 'CLIENT_SUPERVISOR',
} as const;

export type TUserRole = (typeof UserRole)[keyof typeof UserRole];

export const EmploymentStatus = {
  PERMANENT: 'PERMANENT',
  CONTRACT: 'CONTRACT',
  FREELANCE: 'FREELANCE',
} as const;

export type TEmploymentStatus =
  (typeof EmploymentStatus)[keyof typeof EmploymentStatus];

// =============================================================================
// Zod Schemas
// =============================================================================

const CLIENT_ROLES: string[] = [
  'CLIENT',
  'CLIENT_TECHNICIAN',
  'CLIENT_SUPERVISOR',
];

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
    address: z.string().max(255).optional().nullable(),
    role: z.enum(UserRole as unknown as { [k: string]: string }),
    employmentStatus: z.enum(
      EmploymentStatus as unknown as { [k: string]: string }
    ),
    clientId: z.uuid().optional().nullable(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine(
    data => {
      // Client roles must have a clientId
      if (CLIENT_ROLES.includes(data.role)) {
        return data.clientId != null && data.clientId !== '';
      }
      return true;
    },
    {
      message: 'Klien wajib dipilih untuk role klien',
      path: ['clientId'],
    }
  );

/**
 * Schema for updating a user (all fields optional except id)
 */
export const userUpdateSchema = z
  .object({
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().max(100).optional().nullable(),
    idNumber: z.string().max(50).optional().nullable(),
    email: z.email().optional(),
    phoneNumber: z.string().min(1).max(20).optional(),
    password: z.string().min(8).optional(),
    avatarUrl: z.url().optional().nullable(),
    address: z.string().max(255).optional().nullable(),
    role: z.enum(UserRole as unknown as { [k: string]: string }).optional(),
    employmentStatus: z
      .enum(EmploymentStatus as unknown as { [k: string]: string })
      .optional(),
    isActive: z.boolean().optional(),
    isBlocked: z.boolean().optional(),
    clientId: z.uuid().optional().nullable(),
  })
  .refine(
    data => {
      // Client roles must have a clientId when role is being updated
      if (data.role && CLIENT_ROLES.includes(data.role)) {
        return data.clientId != null && data.clientId !== '';
      }
      return true;
    },
    {
      message: 'Klien wajib dipilih untuk role klien',
      path: ['clientId'],
    }
  );

/**
 * Schema for internal user data (includes soft-delete metadata)
 */
export const userInternalSchema = z.object({
  id: z.uuid(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  idNumber: z.string().nullable(),
  email: z.email(),
  phoneNumber: z.string(),
  avatarUrl: z.url().nullable(),
  address: z.string().nullable(),
  role: z.enum(UserRole as unknown as { [k: string]: string }),
  employmentStatus: z.enum(
    EmploymentStatus as unknown as { [k: string]: string }
  ),
  isActive: z.boolean(),
  isBlocked: z.boolean(),
  clientId: z.uuid().nullable(),
  client: z
    .object({
      id: z.uuid(),
      name: z.string(),
    })
    .nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
});

/**
 * Schema for user response (safe to expose, excludes soft-delete metadata)
 */
export const userResponseSchema = userInternalSchema.omit({ deletedAt: true });

/**
 * Schema for user login
 */
export const userLoginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const profileUpdateSchema = z.object({
  firstName: z.string().min(1, 'Nama depan wajib diisi').max(100),
  lastName: z.string().max(100).optional().nullable(),
  phoneNumber: z.string().min(1, 'Nomor telepon wajib diisi').max(20),
  avatarUrl: z.url().optional().nullable(),
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
  clientId: z.uuid().optional(),
  sortBy: z.enum(['firstName', 'lastName', 'email', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// =============================================================================
// Inferred TypeScript Types
// =============================================================================

/** Input type for creating a user */
export type TUserCreateInput = z.infer<typeof userCreateSchema>;

/** Input type for updating a user */
export type TUserUpdateInput = z.infer<typeof userUpdateSchema>;

/** Internal user data including metadata */
export type TUserInternal = z.infer<typeof userInternalSchema>;

/** User response type (safe to expose, no password, no deletedAt) */
export type TUserResponse = z.infer<typeof userResponseSchema>;

/** Login credentials */
export type TUserLoginInput = z.infer<typeof userLoginSchema>;

/** Profile update input (self-service, excludes admin fields) */
export type TProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

/** Profile response type (safe to expose for self-service) */
export interface ICurrentUserProfile {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phoneNumber: string;
  avatarUrl: string | null;
  role: TUserRole;
  employmentStatus: TEmploymentStatus;
}

/** User list query parameters */
export type TUserListParams = z.infer<typeof userListParamsSchema>;

/** Paginated user list response */
export interface IUserListResponse {
  data: TUserResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
