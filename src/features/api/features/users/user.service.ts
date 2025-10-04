import { prisma } from '@/features/api/connection/prisma';
import { TUserCreationAttributes } from '@/types/user.type';
import { Prisma, User } from '@/features/api/generated/prisma';
import { hashPassword } from '@/utils/passwordHash';
import { UniqueIdentifier } from '@dnd-kit/core';
import { AppError } from '@/lib/app-error';
import { NextRequest } from 'next/server';

export async function createUserWithoutAvatar(
  payload: Omit<TUserCreationAttributes, 'avatarImg'>,
  tx: Prisma.TransactionClient
) {
  try {
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
        status: 409,
        message: 'User already exists',
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
  } catch (error) {
    console.error('Error creating user:', error);
    throw new AppError({
      status: 500,
      message: 'Error creating user',
      isExpose: true,
    });
  }
}

export async function updateUserAvatar(
  userId: UniqueIdentifier,
  avatarUrl: string,
  avatarPublicId: string,
  tx: Prisma.TransactionClient
) {
  try {
    return tx.user.update({
      where: { id: userId as string },
      data: {
        avatarUrl,
        avatarPublicId,
      },
    });
  } catch (error) {
    console.error('Error updating user avatar:', error);
    throw new AppError({
      status: 500,
      message: 'Error updating user avatar',
      isExpose: true,
    });
  }
}

export async function fetchAllUsersService(req: NextRequest) {
  try {
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
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new AppError({
      status: 500,
      message: 'Error fetching users',
      isExpose: true,
    });
  }
}
