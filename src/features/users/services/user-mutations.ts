import { prisma } from '@/lib/prisma';
import {
  TUserCreateInput,
  TUserUpdateInput,
  TProfileUpdateInput,
  ICurrentUserProfile,
} from '@/@types/user.type';
import type { IJwtPayload } from '@/@types/auth.type';
import { canAccess, RbacResource } from '@/lib/rbac';
import { hashPassword } from '@/features/auth/crypto';
import {
  toUserResponse,
  userResponseSelect,
  profileResponseSelect,
  toProfileResponse,
} from '../utils';

function ensureUsersWriteAccess(
  actor: IJwtPayload,
  capability: 'create' | 'update' | 'delete'
) {
  if (!canAccess(actor.role, RbacResource.USERS_ADMIN, capability)) {
    throw new Error('Unauthorized');
  }
}

/**
 * Internal helper to ensure email and phone are unique.
 * Returns the duplicate user if found (including soft-deleted ones).
 */
async function findDuplicateUser(
  data: { email?: string; phoneNumber?: string },
  excludeId?: string
) {
  return await prisma.user.findFirst({
    where: {
      OR: [
        ...(data.email ? [{ email: data.email }] : []),
        ...(data.phoneNumber ? [{ phoneNumber: data.phoneNumber }] : []),
      ],
      NOT: excludeId ? { id: excludeId } : undefined,
    },
  });
}

/**
 * Create a new user
 */
export async function createUser(
  actor: IJwtPayload,
  data: Omit<TUserCreateInput, 'confirmPassword'>
) {
  ensureUsersWriteAccess(actor, 'create');

  const duplicate = await findDuplicateUser({
    email: data.email,
    phoneNumber: data.phoneNumber,
  });

  if (duplicate) {
    if (duplicate.deletedAt) {
      throw new Error(
        `Pengguna yang dihapus dengan email atau telepon ini sudah ada. Silakan gunakan email/telepon lain, atau hubungi admin untuk memulihkan akun.`
      );
    }
    throw new Error('Pengguna dengan email atau nomor telepon ini sudah ada');
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName ?? null,
      idNumber: data.idNumber ?? null,
      email: data.email,
      phoneNumber: data.phoneNumber,
      password: hashedPassword,
      avatarUrl: data.avatarUrl ?? null,
      address: data.address ?? null,
      role: data.role as any,
      employmentStatus: data.employmentStatus as any,
      clientId: data.clientId ?? null,
    },
    select: userResponseSelect,
  });

  return toUserResponse(user as any);
}

/**
 * Update user information
 */
export async function updateUser(
  actor: IJwtPayload,
  id: string,
  data: TUserUpdateInput
) {
  ensureUsersWriteAccess(actor, 'update');

  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new Error('Pengguna tidak ditemukan');
  }

  if (existingUser.deletedAt) {
    throw new Error('Tidak dapat memperbarui pengguna yang telah dihapus');
  }

  if (data.email || data.phoneNumber) {
    const duplicate = await findDuplicateUser(
      { email: data.email, phoneNumber: data.phoneNumber },
      id
    );

    if (duplicate && !duplicate.deletedAt) {
      throw new Error('Email atau nomor telepon sudah digunakan');
    }
  }

  const updateData = { ...data } as any;
  if (data.password) {
    updateData.password = await hashPassword(data.password);
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...updateData,
      address: data.address ?? null,
      clientId: data.clientId ?? null,
    },
    select: userResponseSelect,
  });

  return toUserResponse(user as any);
}

/**
 * Soft delete a user
 */
export async function deleteUser(actor: IJwtPayload, id: string) {
  ensureUsersWriteAccess(actor, 'delete');

  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new Error('Pengguna tidak ditemukan');
  }

  if (existingUser.deletedAt) {
    throw new Error('Pengguna sudah dihapus');
  }

  await prisma.user.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });

  return { success: true };
}

/**
 * Update current user profile (self-service)
 */
export async function updateCurrentUserProfile(
  userId: string,
  data: TProfileUpdateInput
): Promise<ICurrentUserProfile> {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId, deletedAt: null },
  });

  if (!existingUser) {
    throw new Error('Pengguna tidak ditemukan');
  }

  if (data.phoneNumber && data.phoneNumber !== existingUser.phoneNumber) {
    const duplicate = await findDuplicateUser(
      { phoneNumber: data.phoneNumber },
      userId
    );
    if (duplicate && !duplicate.deletedAt) {
      throw new Error('Nomor telepon sudah digunakan');
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      firstName: data.firstName,
      lastName: data.lastName ?? null,
      phoneNumber: data.phoneNumber,
      avatarUrl: data.avatarUrl ?? null,
    },
    select: profileResponseSelect,
  });

  return toProfileResponse(user);
}

/**
 * Restore a soft-deleted user
 */
export async function restoreUser(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new Error('Pengguna tidak ditemukan');
  }

  if (!user.deletedAt) {
    throw new Error('Pengguna tidak sedang dihapus');
  }

  const restoredUser = await prisma.user.update({
    where: { id },
    data: {
      deletedAt: null,
    },
    select: userResponseSelect,
  });

  return toUserResponse(restoredUser as any);
}

/**
 * Permanently delete a user
 */
export async function permanentlyDeleteUser(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new Error('Pengguna tidak ditemukan');
  }

  await prisma.user.delete({
    where: { id },
  });

  return { success: true };
}
