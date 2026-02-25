/**
 * Shared Prisma select objects to reduce duplication
 * Import and spread these into your queries
 */

export const USER_BASIC_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
} as const;

export const USER_WITH_EMAIL_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
} as const;

export const USER_PROFILE_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  idNumber: true,
  email: true,
  phoneNumber: true,
  avatarUrl: true,
  role: true,
  employmentStatus: true,
  isActive: true,
  isBlocked: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} as const;

export const CLIENT_BASIC_SELECT = {
  id: true,
  name: true,
} as const;

export const PROJECT_BASIC_SELECT = {
  id: true,
  name: true,
  quoteNumber: true,
  status: true,
} as const;

export const MACHINE_BASIC_SELECT = {
  id: true,
  unitNumber: true,
  type: true,
} as const;
