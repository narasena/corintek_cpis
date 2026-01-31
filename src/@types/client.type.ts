import { z } from 'zod';

// =============================================================================
// Zod Schemas
// =============================================================================

/**
 * Schema for creating a new client
 */
export const clientCreateSchema = z.object({
  name: z.string().min(1, 'Client name is required').max(150),
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .nullable()
    .or(z.literal('')),
  phoneNumber: z.string().max(20).optional().nullable().or(z.literal('')),
  address: z.string().max(500).optional().nullable().or(z.literal('')),
});

/**
 * Schema for updating a client (all fields optional)
 */
export const clientUpdateSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .nullable()
    .or(z.literal('')),
  phoneNumber: z.string().max(20).optional().nullable().or(z.literal('')),
  address: z.string().max(500).optional().nullable().or(z.literal('')),
});

/**
 * Schema for client response
 */
export const clientResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.email().nullable(),
  phoneNumber: z.string().nullable(),
  address: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
});

/**
 * Schema for listing clients with pagination
 */
export const clientListParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'email', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// =============================================================================
// Inferred TypeScript Types
// =============================================================================

/** Input type for creating a client */
export type TClientCreateInput = z.infer<typeof clientCreateSchema>;

/** Input type for updating a client */
export type TClientUpdateInput = z.infer<typeof clientUpdateSchema>;

/** Client response type */
export type TClientResponse = z.infer<typeof clientResponseSchema>;

/** Client list query parameters */
export type TClientListParams = z.infer<typeof clientListParamsSchema>;

/** Paginated client list response */
export interface IClientListResponse {
  data: TClientResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
