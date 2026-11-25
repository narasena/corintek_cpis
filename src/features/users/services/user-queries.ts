import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';
import { ICurrentUserProfile } from '@/@types/user.type';
import type { IJwtPayload } from '@/@types/auth.type';
import { canAccess, RbacResource } from '@/lib/rbac';
import {
  toUserResponse,
  userResponseSelect,
  technicianResponseSelect,
  profileResponseSelect,
  toProfileResponse,
  toTechnicianResponse,
} from '../utils';

function ensureUsersReadAccess(actor: IJwtPayload) {
  if (!canAccess(actor.role, RbacResource.USERS_ADMIN, 'read')) {
    throw new Error('Unauthorized');
  }
}

/**
 * Internal helper to find an active user or throw error.
 */
async function findActiveUserOrThrow<T extends Prisma.UserSelect>(
  id: string,
  select: T
) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      ...select,
      deletedAt: true,
    } as any,
  });

  if (!user || (user as any).deletedAt) {
    throw new Error('Pengguna tidak ditemukan');
  }

  return user;
}

/**
 * Get all users with TECHNICIAN role (for dropdowns/assignments)
 * Accessible by any authenticated user who can view log sheets
 *
 * NOTE: Using LOG_SHEETS resource is a characterization-locked behavior (Finding 1.1).
 */
export async function getTechniciansList(actor: IJwtPayload) {
  if (!canAccess(actor.role, RbacResource.LOG_SHEETS, 'read')) {
    throw new Error('Unauthorized');
  }

  const technicians = await prisma.user.findMany({
    where: {
      deletedAt: null,
      role: 'TECHNICIAN',
    },
    select: technicianResponseSelect,
    orderBy: {
      firstName: 'asc',
    },
  });

  return technicians.map(toTechnicianResponse);
}

/**
 * Get all non-deleted users
 */
export async function getAllUsers(actor: IJwtPayload) {
  ensureUsersReadAccess(actor);

  const users = await prisma.user.findMany({
    where: {
      deletedAt: null,
    },
    select: userResponseSelect,
    orderBy: {
      createdAt: 'desc',
    },
  });

  return users.map((u: any) => toUserResponse(u));
}

/**
 * Get a single user by ID
 */
export async function getUserById(actor: IJwtPayload, id: string) {
  ensureUsersReadAccess(actor);

  const user = await findActiveUserOrThrow(id, userResponseSelect);

  return toUserResponse(user as any);
}

/**
 * Get current user profile for self-service
 */
export async function getCurrentUserProfile(
  userId: string
): Promise<ICurrentUserProfile> {
  const user = await findActiveUserOrThrow(userId, profileResponseSelect);

  return toProfileResponse(user);
}
