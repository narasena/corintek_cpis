import {
  userResponseSchema,
  TUserResponse,
  TUserInternal,
  ICurrentUserProfile,
} from '@/@types/user.type';
import type { Prisma } from '@/generated/prisma/client';
import { z } from 'zod';

/**
 * CORE Selection fragment used across all user data shapes.
 */
const CORE_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
} as const;

/**
 * CLIENT Selection fragment for role-based assignments.
 */
const CLIENT_SELECT = {
  clientId: true,
  client: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

/**
 * PROFILE Selection fragment for self-service management.
 */
export const profileResponseSelect = {
  ...CORE_SELECT,
  phoneNumber: true,
  avatarUrl: true,
  employmentStatus: true,
} as const satisfies Prisma.UserSelect;

/**
 * TECHNICIAN Selection fragment for dropdowns/assignments.
 */
export const technicianResponseSelect = {
  ...CORE_SELECT,
  ...CLIENT_SELECT,
} as const satisfies Prisma.UserSelect;

/**
 * FULL Selection for standard user management.
 * Matches fields required by TUserResponse (userResponseSchema).
 */
export const userResponseSelect = {
  ...profileResponseSelect,
  ...CLIENT_SELECT,
  idNumber: true,
  address: true,
  isActive: true,
  isBlocked: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} as const satisfies Prisma.UserSelect;

/**
 * Derived Zod schemas from primary userResponseSchema (SSOT).
 */
export const profileResponseSchema = userResponseSchema.pick({
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phoneNumber: true,
  avatarUrl: true,
  role: true,
  employmentStatus: true,
});

export const technicianResponseSchema = userResponseSchema.pick({
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  clientId: true,
  client: true,
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
