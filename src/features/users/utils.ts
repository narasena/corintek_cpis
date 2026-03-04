import { userResponseSchema, TUserResponse } from '@/@types/user.type';
import { Prisma } from '@prisma/client';

/**
 * Reusable Prisma select object for standard user responses
 * Matches fields required by TUserResponse (userResponseSchema)
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
} satisfies Prisma.UserSelect;
/**
 * Validates if a user is allowed to authenticate or access protected resources.
 * Checks for soft-deletion, inactive status, and administrator blocks.
 * 
 * @param user - User object with status fields
 * @returns True if the user is in good standing
 */
export function isUserAuthValid(user: {
  deletedAt: Date | null;
  isActive: boolean;
  isBlocked: boolean;
}): boolean {
  return !user.deletedAt && user.isActive && !user.isBlocked;
}

/**
 * Safely transforms a raw database user object into a validated TUserResponse.
...
 * Uses userResponseSchema to ensure sensitive data (like password) is stripped
 * and all required fields/relations are present.
 * 
 * @param user - Raw database user object (must include selected fields/relations)
 * @returns Validated TUserResponse
 * @throws Error if the user object doesn't match the schema
 */
export function toUserResponse(user: unknown): TUserResponse {
  return userResponseSchema.parse(user);
}
