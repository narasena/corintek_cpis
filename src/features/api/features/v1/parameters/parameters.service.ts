import { prisma } from '@/features/api/connection/prisma';
import { Prisma } from '@/features/api/generated/prisma';
import { AppError } from '@/lib/app-error';
import { serviceErrorResponse } from '@/lib/error-handler';
import { toCamelCase } from '@/lib/string-utils';
import { TParameterAttributes } from '@/types/parameter.type';

export async function fetchAllParametersService() {
  try {
    const whereClause: Prisma.ParameterWhereInput = {
      deletedAt: null,
    };
    return await prisma.parameter.findMany({
      where: whereClause,
    });
  } catch (error) {
    serviceErrorResponse({
      error,
      customErrorMessage: 'Error fetching parameters',
      status: 500,
    });
  }
}

export async function createParameterService(
  data: TParameterAttributes,
  tx: Prisma.TransactionClient
) {
  try {
    const existingParameter = await tx.parameter.findUnique({
      where: { name: String(data.name) },
    });
    if (existingParameter && existingParameter.deletedAt === null) {
      throw new AppError({
        status: 409,
        message: 'Parameter sudah ada',
        isExpose: true,
      });
    }
    return await tx.parameter.create({
      data: {
        name: data.name,
        variableName: toCamelCase(data.name),
        valueType: data.valueType,
        unit: data.unit ? (data.unit as string) : null,
        description: data.description ? (data.description as string) : null,
      },
    });
  } catch (error) {
    serviceErrorResponse({
      error,
      customErrorMessage: 'Error creating parameter',
      status: 500,
    });
  }
}
