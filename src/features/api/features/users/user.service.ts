import { prisma } from "@/features/api/connection/prisma";
import { TUserCreationAttributes } from "@/types/user.type";
import { Prisma, User } from "@/features/api/generated/prisma";
import { hashPassword } from "@/utils/passwordHash";
import { AppError } from "@/lib/app-error";

export async function createUserWithoutAvatar(payload: Omit<TUserCreationAttributes, 'avatarImg'>, tx: any) {
  const whereClause: Prisma.UserWhereInput = {
    OR: [
      { email: payload.email },
    ],
    deletedAt: null,
  };

  if (payload.phoneNumber) {
    whereClause.OR?.push({ phoneNumber: payload.phoneNumber });
  }

  const existingUser: User | null = await tx.user.findFirst({
    where: whereClause,
  });

  console.log('Duplicate check result:', existingUser ? 'User exists' : 'No duplicate');

  if (existingUser) {
    throw new AppError({
      message: "User with this email or phone number already exists",
      status: 409,
      isExpose: true,
    });
  }

  console.log('Creating user with data:', {
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    phoneNumber: payload.phoneNumber,
    role: payload.role,
    // Omit password for security
  });

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

  console.log('User created successfully without avatar:', { id: createdUser.id, email: createdUser.email });

  return createdUser;
}

export async function updateUserAvatar(userId: string, avatarUrl: string, avatarPublicId: string, tx: any) {
  return tx.user.update({
    where: { id: userId },
    data: {
      avatarUrl,
      avatarPublicId,
    },
  });
}

export async function fetchAllUsersService () {
  const whereClause: Prisma.UserWhereInput = {
    deletedAt: null,
  };

  const allUsers = await prisma.user.findMany({
    where: whereClause,
    omit:{
      password: true
    }
  });

  return allUsers

}