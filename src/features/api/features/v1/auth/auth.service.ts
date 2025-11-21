import { prisma } from '@/features/api/connection/prisma';
import { Prisma } from '@/features/api/generated/prisma/client';
import { AppError } from '@/lib/app-error';
import { serviceErrorResponse } from '@/lib/error-handler';
import { TAuthLoginFormAttributes } from '@/types/auth.type';
import { comparePassword } from '@/utils/api/v1/passwordHash';
import { createToken } from '@/utils/api/v1/token';

export const userLoginService = async (payload: TAuthLoginFormAttributes) => {
  try {
    const whereClause: Prisma.UserWhereInput = {
      deletedAt: null,
      OR: [{ email: payload.email }, { phoneNumber: payload.email }],
    };
    const user = await prisma.user.findFirst({
      where: whereClause,
    });
    if (!user) {
      throw new AppError({
        isExpose: true,
        status: 401,
        message: 'Akun tidak ditemukan / belum terdaftar',
      });
    }
    const isPasswordValid = comparePassword(payload.password, user.password);
    if (!isPasswordValid) {
      throw new AppError({
        isExpose: true,
        status: 401,
        message: 'Password salah',
      });
    }
    if (user.isBlocked) {
      throw new AppError({
        isExpose: true,
        status: 401,
        message: 'Akun di blokir, silahkan hubungi admin',
      });
    }
    if (user.isActive === false) {
      throw new AppError({
        isExpose: true,
        status: 401,
        message: 'Akun di nonaktifkan, silahkan hubungi admin',
      });
    }
    const token = createToken({
      id: user.id,
      role: user.role,
    });
    const loginToken = {
      token,
      id: user.id,
      role: user.role,
    };
    return loginToken;
  } catch (error) {
    serviceErrorResponse({
      error,
      customErrorMessage: 'Gagal masuk ke akun',
      status: 401,
    });
  }
};
