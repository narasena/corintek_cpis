import {
  userResponseSchema,
  TUserResponse,
  TUserInternal,
  ICurrentUserProfile,
} from '@/@types/user.type';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

/**
 * Reusable Prisma select object for standard user responses.
 * Matches fields required by TUserResponse (userResponseSchema).
 */
export const userResponseSelect = {
  id: true,
  firstName: true,
  lastName: true,
  idNumber: true,
  email: true,
  phoneNumber: true,
  avatarUrl: true,
  address: true,
  role: true,
  employmentStatus: true,
  isActive: true,
  isBlocked: true,
  clientId: true,
  client: {
    select: {
      id: true,
      name: true,
    },
  },
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} as const satisfies Prisma.UserSelect;

/**
 * Reusable Prisma select object for technician selection (e.g. dropdowns).
 */
export const technicianResponseSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  clientId: true,
  client: {
    select: {
      id: true,
      name: true,
    },
  },
} as const satisfies Prisma.UserSelect;

/**
 * Reusable Prisma select object for self-service profile management.
 */
export const profileResponseSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phoneNumber: true,
  avatarUrl: true,
  role: true,
  employmentStatus: true,
} as const satisfies Prisma.UserSelect;

/**
 * Zod schema for current user profile.
 */
export const profileResponseSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  email: z.string().email(),
  phoneNumber: z.string(),
  avatarUrl: z.string().nullable(),
  role: z.string(),
  employmentStatus: z.string(),
});

/**
 * Zod schema for technician response.
 */
export const technicianResponseSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  email: z.string().email(),
  role: z.string(),
  clientId: z.string().uuid().nullable(),
  client: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
    })
    .nullable(),
});

/**
 * Interface for user security/status fields.
 * Encapsulates the minimum data required to validate an actor's standing.
 */
export interface IUserStatus {
  deletedAt: Date | null;
  isActive: boolean;
  isBlocked: boolean;
}

/**
 * Validates if a user is allowed to authenticate or access protected resources.
 * Checks for soft-deletion, inactive status, and administrator blocks.
 *
 * @param user - User object with status fields
 * @returns True if the user is in good standing
 */
export function isUserAuthValid(user: IUserStatus): boolean {
  return !user.deletedAt && user.isActive && !user.isBlocked;
}

/**
 * Safely transforms a raw database user object into a validated TUserResponse.
 *
 * @param user - Raw database user object
 * @returns Validated TUserResponse
 */
export function toUserResponse(user: TUserInternal): TUserResponse {
  return userResponseSchema.parse(user);
}

/**
 * Safely transforms a raw database user object into a profile response.
 *
 * @param data - Raw database user object
 * @returns Validated ICurrentUserProfile
 */
export function toProfileResponse(data: unknown): ICurrentUserProfile {
  return profileResponseSchema.parse(data) as ICurrentUserProfile;
}

/**
 * Safely transforms a technician database object into a safe response.
 * Matches fields needed for assignments/dropdowns.
 *
 * @param data - Raw database technician object
 * @returns Validated technician data
 */
export function toTechnicianResponse(data: unknown) {
  return technicianResponseSchema.parse(data);
}
