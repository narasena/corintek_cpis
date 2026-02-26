import { prisma } from '@/lib/prisma';
import {
  TUserCreateInput,
  TUserUpdateInput,
  TProfileUpdateInput,
  ICurrentUserProfile,
} from '@/@types/user.type';
import type { IJwtPayload } from '@/@types/auth.type';
import { canAccess, RbacResource } from '@/lib/rbac';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

function ensureUsersAccess(
  actor: IJwtPayload,
  capability: 'create' | 'read' | 'update' | 'delete'
) {
  if (!canAccess(actor.role, RbacResource.USERS_ADMIN, capability)) {
    throw new Error('Unauthorized');
  }
}

/**
 * Create a new user with hashed password
 */
export async function createUser(
  actor: IJwtPayload,
  data: Omit<TUserCreateInput, 'confirmPassword'>
) {
  ensureUsersAccess(actor, 'create');

  // Check for existing user with same email or phone (including soft-deleted)
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: data.email }, { phoneNumber: data.phoneNumber }],
    },
  });

  if (existingUser) {
    // If user was soft-deleted, provide specific error message
    if (existingUser.deletedAt) {
      throw new Error(
        `Pengguna yang dihapus dengan email atau telepon ini sudah ada. Silakan gunakan email/telepon lain, atau hubungi admin untuk memulihkan akun.`
      );
    }
    // Active user with same credentials
    throw new Error('Pengguna dengan email atau nomor telepon ini sudah ada');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  // Create user
  const user = await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName ?? null,
      idNumber: data.idNumber ?? null,
      email: data.email,
      phoneNumber: data.phoneNumber,
      password: hashedPassword,
      avatarUrl: data.avatarUrl ?? null,
      role: data.role as any, // Already validated by Zod
      employmentStatus: data.employmentStatus as any, // Already validated by Zod
    },
    select: {
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
    },
  });

  return user;
}

/**
 * Get all users with TECHNICIAN role (for dropdowns/assignments)
 * Accessible by any authenticated user who can view log sheets
 */
export async function getTechniciansList(actor: IJwtPayload) {
  // Allow access if user can read log sheets (which Technicians can)
  if (!canAccess(actor.role, RbacResource.LOG_SHEETS, 'read')) {
    throw new Error('Unauthorized');
  }

  const technicians = await prisma.user.findMany({
    where: {
      deletedAt: null,
      role: 'TECHNICIAN',
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      // Minimal fields for selection
    },
    orderBy: {
      firstName: 'asc',
    },
  });

  return technicians as any[]; // Cast to TUserResponse[] equivalent
}

/**
 * Get all non-deleted users
 */
export async function getAllUsers(actor: IJwtPayload) {
  ensureUsersAccess(actor, 'read');

  const users = await prisma.user.findMany({
    where: {
      deletedAt: null,
    },
    select: {
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
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return users;
}

/**
 * Get a single user by ID
 */
export async function getUserById(actor: IJwtPayload, id: string) {
  ensureUsersAccess(actor, 'read');

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
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
    },
  });

  if (!user) {
    throw new Error('Pengguna tidak ditemukan');
  }

  if (user.deletedAt) {
    throw new Error('Pengguna telah dihapus');
  }

  return user;
}

/**
 * Update user information
 */
export async function updateUser(
  actor: IJwtPayload,
  id: string,
  data: TUserUpdateInput
) {
  ensureUsersAccess(actor, 'update');

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new Error('Pengguna tidak ditemukan');
  }

  if (existingUser.deletedAt) {
    throw new Error('Tidak dapat memperbarui pengguna yang telah dihapus');
  }

  // Check email/phone uniqueness if being updated
  if (data.email || data.phoneNumber) {
    const duplicateUser = await prisma.user.findFirst({
      where: {
        OR: [
          ...(data.email ? [{ email: data.email }] : []),
          ...(data.phoneNumber ? [{ phoneNumber: data.phoneNumber }] : []),
        ],
        NOT: {
          id,
        },
        deletedAt: null,
      },
    });

    if (duplicateUser) {
      throw new Error('Email atau nomor telepon sudah digunakan');
    }
  }

  // Hash password if it's being updated
  const updateData = { ...data } as any; // Type-safe update
  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, SALT_ROUNDS);
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
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
    },
  });

  return user;
}

/**
 * Soft delete a user by setting deletedAt timestamp
 */
export async function deleteUser(actor: IJwtPayload, id: string) {
  ensureUsersAccess(actor, 'delete');

  // Check if user exists
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

export async function getCurrentUserProfile(
  userId: string
): Promise<ICurrentUserProfile> {
  const user = await prisma.user.findUnique({
    where: { id: userId, deletedAt: null },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      avatarUrl: true,
      role: true,
      employmentStatus: true,
    },
  });

  if (!user) {
    throw new Error('Pengguna tidak ditemukan');
  }

  return user as ICurrentUserProfile;
}

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
    await ensurePhoneNumberIsUnique(data.phoneNumber, userId);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      firstName: data.firstName,
      lastName: data.lastName ?? null,
      phoneNumber: data.phoneNumber,
      avatarUrl: data.avatarUrl ?? null,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      avatarUrl: true,
      role: true,
      employmentStatus: true,
    },
  });

  return user as ICurrentUserProfile;
}

async function ensurePhoneNumberIsUnique(
  phoneNumber: string,
  excludeUserId: string
) {
  const duplicate = await prisma.user.findFirst({
    where: { phoneNumber, deletedAt: null, NOT: { id: excludeUserId } },
  });

  if (duplicate) {
    throw new Error('Nomor telepon sudah digunakan');
  }
}
