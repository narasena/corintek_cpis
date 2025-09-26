import { IUser, TUserAttributes } from "@/types/user.type";
import { prisma } from "../../connection/prisma";
import { Prisma, User } from "../../generated/prisma";
import { hashPassword } from "@/utils/passwordHash";
import { AppError } from "@/lib/app-error";

// This is where your actual database logic lives.
export async function createUserService(payload: TUserAttributes) {
  const whereClause: Prisma.UserWhereInput = {
    OR: [
      { email: payload.email },
    ],
    deletedAt: null,
  };

  if (payload.phoneNumber) {
    whereClause.OR?.push({ phoneNumber: payload.phoneNumber });
  }

  const existingUser: User | null = await prisma.user.findFirst({
    where: whereClause,
  });


  if (existingUser) {
    throw new AppError({
      message:"User with this email or phone number already exists",
      status:409,
      isExpose:true,
  });
  }

  const hashedPassword = hashPassword(payload.password);

  const createdUser = await prisma.user.create({
    data: { ...payload, password: hashedPassword },
  });

  return createdUser;
}
