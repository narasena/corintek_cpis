import {
  TClientCreationAttributes,
  TClientPICCreationAttributes,
} from '@/types/client.type';

import { AppError } from '@/lib/app-error';
import { UniqueIdentifier } from '@dnd-kit/core';

import { NextRequest } from 'next/server';
import { hashPassword } from '@/utils/api/v1/passwordHash';
import { Client, Prisma, User } from '@/features/api/generated/prisma';
import { prisma } from '@/features/api/connection/prisma';
import { serviceErrorResponse } from '@/lib/error-handler';

export async function createClientWithoutAvatar(
  payload: Omit<TClientCreationAttributes, 'avatarImg'>,
  tx: Prisma.TransactionClient
) {
  try {
    const whereClause: Prisma.ClientWhereInput | Prisma.ClientWhereUniqueInput =
      {
        deletedAt: null,
      };

    const existingName: Client | null = await tx.client.findUnique({
      where: {
        ...(whereClause as Prisma.ClientWhereUniqueInput),
        name: payload.name,
      },
    });

    if (existingName) {
      throw new AppError({
        status: 409,
        message: 'Nama client sudah pernah terdaftar',
        isExpose: true,
      });
    }

    if (payload.email) {
      const existingEmail: Client | null = await tx.client.findFirst({
        where: {
          ...whereClause,
          email: payload.email,
        },
      });

      if (existingEmail) {
        throw new AppError({
          status: 409,
          message: 'Client dengan email ini sudah pernah terdaftar',
          isExpose: true,
        });
      }
    }
    if (payload.phoneNumber) {
      const existingPhoneNumber: Client | null = await tx.client.findFirst({
        where: {
          ...whereClause,
          phoneNumber: payload.phoneNumber,
        },
      });

      if (existingPhoneNumber) {
        throw new AppError({
          status: 409,
          message: 'Client dengan nomor telepon ini sudah pernah terdaftar',
          isExpose: true,
        });
      }
    }
    if (payload.websiteUrl) {
      const existingWebsiteUrl: Client | null = await tx.client.findFirst({
        where: {
          ...whereClause,
          websiteUrl: payload.websiteUrl,
        },
      });

      if (existingWebsiteUrl) {
        throw new AppError({
          status: 409,
          message: 'Client dengan website ini sudah pernah terdaftar',
          isExpose: true,
        });
      }
    }

    const createdClient = await tx.client.create({
      data: {
        name: payload.name,
        description: payload.description || null,
        avatarUrl: null,
        avatarPublicId: null,
        email: (payload.email as string) || null,
        phoneNumber: (payload.phoneNumber as string) || null,
        address: payload.address || null,
        websiteUrl: (payload.websiteUrl as string) || null,
      },
    });

    return createdClient;
  } catch (error) {
    const errMessage = 'Error ketika menambahkan client';
    console.error(`${errMessage}:`, error);
    throw new AppError({
      status: 500,
      message: errMessage,
      isExpose: true,
    });
  }
}

export async function updateClientAvatar(
  clientId: UniqueIdentifier,
  avatarUrl: string,
  avatarPublicId: string,
  tx: Prisma.TransactionClient
) {
  try {
    return tx.client.update({
      where: { id: clientId as string },
      data: {
        avatarUrl,
        avatarPublicId,
      },
    });
  } catch (error) {
    console.error('Error updating client avatar:', error);
    throw new AppError({
      status: 500,
      message: 'Error updating client avatar',
      isExpose: true,
    });
  }
}

export async function fetchAllClientsService() {
  try {
    const whereClause: Prisma.ClientWhereInput = {
      deletedAt: null,
    };

    const allClients = await prisma.client.findMany({
      where: whereClause,
    });

    return allClients;
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw new AppError({
      status: 500,
      message: 'Error fetching clients',
      isExpose: true,
    });
  }
}

export async function fetchClientByIdService(
  req: NextRequest,
  clientId: string
) {
  try {
    const whereClause: Prisma.ClientWhereInput | Prisma.ClientWhereUniqueInput =
      {
        deletedAt: null,
      };
    const client = await prisma.client.findUnique({
      where: {
        ...(whereClause as Prisma.ClientWhereUniqueInput),
        id: clientId,
      },
      include: {
        personnel: {
          include: {
            personnel: { omit: { password: true } },
          },
        },
      },
    });

    if (!client) {
      throw new AppError({
        status: 404,
        message: 'Klien tidak ditemukan',
        isExpose: true,
      });
    }

    return client;
  } catch (error) {
    const errMessage = 'Error ketika mencari client';
    console.error(`${errMessage}:`, error);
    throw new AppError({
      status: 500,
      message: errMessage,
      isExpose: true,
    });
  }
}

export async function createClientPersonnelWithoutAvatar(
  payload: Omit<TClientPICCreationAttributes, 'avatarImg'>,
  tx: Prisma.TransactionClient,
  clientId: string
) {
  try {
    const whereClause: Prisma.UserWhereInput | Prisma.UserWhereUniqueInput = {
      OR: [{ email: payload.email }],
      deletedAt: null,
    };

    if (payload.phoneNumber) {
      whereClause.OR?.push({ phoneNumber: payload.phoneNumber });
    }

    const existingClientPersonnel: User | null = await tx.user.findFirst({
      where: whereClause,
    });

    if (existingClientPersonnel) {
      throw new AppError({
        status: 409,
        message: 'PIC Klien sudah pernah terdaftar',
        isExpose: true,
      });
    }

    const createdClientPersonnel = await tx.user.create({
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

    await tx.clientPersonnel.create({
      data: {
        clientId,
        personnelId: createdClientPersonnel.id,
      },
    });

    return createdClientPersonnel;
  } catch (error) {
    const errMessage = 'Terjadi kesalahan saat menambahkan PIC klien';
    console.error(`${errMessage}:`, error);
    throw new AppError({
      status: 500,
      message: errMessage,
      isExpose: true,
    });
  }
}

export async function updateClientPersonnelAvatar(
  clientPersonnelId: UniqueIdentifier,
  avatarUrl: string,
  avatarPublicId: string,
  tx: Prisma.TransactionClient
) {
  try {
    return tx.user.update({
      where: { id: clientPersonnelId as string },
      data: {
        avatarUrl,
        avatarPublicId,
      },
    });
  } catch (error) {
    console.error('Error updating client personnel avatar:', error);
    throw new AppError({
      status: 500,
      message: 'Error updating client personnel avatar',
      isExpose: true,
    });
  }
}

export async function fetchClientPersonnelService(
  req: NextRequest,
  clientId: string
) {
  try {
    const whereClause: Prisma.ClientPersonnelWhereInput = {
      deletedAt: null,
    };

    const clientPersonnel = await prisma.clientPersonnel.findMany({
      where: {
        clientId,
        ...whereClause,
      },
      include: { personnel: { omit: { password: true } } },
    });

    return clientPersonnel;
  } catch (error) {
    const errMessage = 'Error ketika mencari client personnel';
    console.error(`${errMessage}:`, error);
    throw new AppError({
      status: 500,
      message: errMessage,
      isExpose: true,
    });
  }
}

export async function fetchProjectsByClientService(clientId: string) {
  try {
    const whereClause: Prisma.ProjectWhereInput = {
      deletedAt: null,
    };
    return await prisma.project.findMany({
      where: {
        clientId,
        ...whereClause,
      },
    });
  } catch (error) {
    serviceErrorResponse({
      error,
      customErrorMessage: 'Error fetching projects by client',
      status: 500,
    });
  }
}
