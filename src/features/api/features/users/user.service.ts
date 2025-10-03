import { prisma } from '@/features/api/connection/prisma';
import { TUserCreationAttributes } from '@/types/user.type';
import { Prisma, User } from '@/features/api/generated/prisma';
import { hashPassword } from '@/utils/passwordHash';
import { AppError } from '@/lib/app-error';
import { UniqueIdentifier } from '@dnd-kit/core';

export async function createUserWithoutAvatar(
  payload: Omit<TUserCreationAttributes, 'avatarImg'>,
  tx: Prisma.TransactionClient
) {
  const whereClause: Prisma.UserWhereInput = {
    OR: [{ email: payload.email }],
    deletedAt: null,
  };

  if (payload.phoneNumber) {
    whereClause.OR?.push({ phoneNumber: payload.phoneNumber });
  }

  const existingUser: User | null = await tx.user.findFirst({
    where: whereClause,
  });

  if (existingUser) {
    throw new AppError({
      message: 'User with this email or phone number already exists',
      status: 409,
      isExpose: true,
    });
  }

  const createdUser = await tx.user.create({
    data: {
      firstName: payload.firstName,
      lastName: payload.lastName,
      idNumber: payload.idNumber || null,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      role: payload.role,
      employmentStatus: payload.employmentStatus,
      password: hashPassword(payload.password),
      avatarUrl: null,
      avatarPublicId: null,
    },
  });

  return createdUser;
}

export async function updateUserAvatar(
  userId: UniqueIdentifier,
  avatarUrl: string,
  avatarPublicId: string,
  tx: Prisma.TransactionClient
) {
  return tx.user.update({
    where: { id: userId as string },
    data: {
      avatarUrl,
      avatarPublicId,
    },
  });
}

export async function fetchAllUsersService() {
  const whereClause: Prisma.UserWhereInput = {
    deletedAt: null,
  };

  const allUsers = await prisma.user.findMany({
    where: whereClause,
    omit: {
      password: true,
    },
  });

  return allUsers;
}
