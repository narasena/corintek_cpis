import { prisma } from '@/lib/prisma';
import { TUserCreateInput, TUserUpdateInput } from '@/@types/user.type';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Create a new user with hashed password
 */
export async function createUser(
  data: Omit<TUserCreateInput, 'confirmPassword'>
) {
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
        `A deleted user with this email or phone exists. Please use a different email/phone, or contact admin to restore the account.`
      );
    }
    // Active user with same credentials
    throw new Error('User with this email or phone number already exists');
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
 * Get all non-deleted users
 */
export async function getAllUsers() {
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
export async function getUserById(id: string) {
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
    throw new Error('User not found');
  }

  if (user.deletedAt) {
    throw new Error('User has been deleted');
  }

  return user;
}

/**
 * Update user information
 */
export async function updateUser(id: string, data: TUserUpdateInput) {
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new Error('User not found');
  }

  if (existingUser.deletedAt) {
    throw new Error('Cannot update deleted user');
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
      throw new Error('Email or phone number already in use');
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
export async function deleteUser(id: string) {
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new Error('User not found');
  }

  if (existingUser.deletedAt) {
    throw new Error('User already deleted');
  }

  await prisma.user.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });

  return { success: true };
}
