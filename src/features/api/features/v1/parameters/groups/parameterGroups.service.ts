import { NextRequest } from 'next/server';
import { Prisma } from '@/features/api/generated/prisma';
import { prisma } from '@/features/api/connection/prisma';
import { TParameterGroupAttributes } from '@/types/parameter.type';
import { serviceErrorResponse } from '@/lib/error-handler';
import { AppError } from '@/lib/app-error';

export async function fetchAllParameterGroupsService() {
  try {
    const whereClause: Prisma.ParameterGroupWhereInput = {
      deletedAt: null,
    };
    return await prisma.parameterGroup.findMany({
      where: whereClause,
    });
  } catch (error) {
    serviceErrorResponse({
      error,
      customErrorMessage: 'Error fetching parameter groups',
      status: 500,
    });
  }
}

export async function fetchParameterGroupByIdService(
  req: NextRequest,
  id: string
) {
  return await prisma.parameterGroup.findUnique({
    where: { id },
    include: {
      // Include related data if needed
    },
  });
}

export async function createParameterGroupService(
  data: TParameterGroupAttributes,
  tx: Prisma.TransactionClient
) {
  try {
    const whereClause: Prisma.ParameterGroupWhereInput = {
      deletedAt: null,
    };
    const existingParameterGroup = await tx.parameterGroup.findFirst({
      where: { ...whereClause, name: data.name, type: data.type },
    });
    if (existingParameterGroup) {
      throw new AppError({
        status: 400,
        message: 'Grup parameter sudah ada',
        isExpose: true,
      });
    }
    return await tx.parameterGroup.create({
      data: {
        // Map data to the database fields
        name: data.name,
        type: data.type,
        description: String(data.description) || null,
        // Add other fields as needed
      },
    });
  } catch (error) {
    serviceErrorResponse({
      error,
      customErrorMessage: 'Error creating parameter group',
      status: 500,
    });
  }
}

export async function updateParameterGroupService(
  id: string,
  data: TParameterGroupAttributes,
  tx: Prisma.TransactionClient
) {
  return await tx.parameterGroup.update({
    where: { id },
    data: {
      // Map data to the database fields
      name: data.name,
      type: data.type,
      description: String(data.description) || null,
      // Add other fields as needed
    },
  });
}

export async function deleteParameterGroupService(
  id: string,
  tx: Prisma.TransactionClient
) {
  return await tx.parameterGroup.delete({
    where: { id },
  });
}
