import { prisma } from '@/features/api/connection/prisma';
import { Prisma } from '@/features/api/generated/prisma';
import { AppError } from '@/lib/app-error';
import { serviceErrorResponse } from '@/lib/error-handler';
import { TParameterLimitAttributes } from '@/types/parameter.type';

export async function fetchAllParameterLimitsService() {
  try {
    const whereClause: Prisma.ParameterLimitWhereInput = {
      deletedAt: null,
    };
    const parameterLimits = await prisma.parameterLimit.findMany({
      where: whereClause,
      include: {
        parameter: { select: { name: true, unit: true } },
        group: { select: { name: true } },
        method: { select: { methodName: true } },
      },
    });
    return parameterLimits;
  } catch (error) {
    serviceErrorResponse({
      error,
      customErrorMessage: 'Error fetching parameter limits',
      status: 500,
    });
  }
}

export async function createParameterLimitService(
  data: TParameterLimitAttributes,
  tx: Prisma.TransactionClient
) {
  try {
    const whereClause: Prisma.ParameterLimitWhereInput = {
      deletedAt: null,
    };
    const existingLimitOnly = await prisma.parameterLimit.findFirst({
      where: { ...whereClause, parameterId: data.parameterId },
    });
    const existingLimitWithSameMethod = await prisma.parameterLimit.findFirst({
      where: {
        ...whereClause,
        parameterId: data.parameterId,
        methodId: data.methodId,
      },
    });
    const existingLimitWithSameGroup = await prisma.parameterLimit.findFirst({
      where: {
        ...whereClause,
        parameterId: data.parameterId,
        groupId: data.groupId,
      },
    });
    const existingLimitWithSameMethodAndGroup =
      await prisma.parameterLimit.findFirst({
        where: {
          ...whereClause,
          parameterId: data.parameterId,
          methodId: data.methodId,
          groupId: data.groupId,
        },
      });
    if (
      existingLimitOnly ||
      existingLimitWithSameMethod ||
      existingLimitWithSameGroup ||
      existingLimitWithSameMethodAndGroup
    ) {
      throw new AppError({
        status: 400,
        message: 'Limit parameter sudah ada',
        isExpose: true,
      });
    }
    return await tx.parameterLimit.create({
      data: {
        parameterId: data.parameterId,
        methodId: String(data.methodId) || null,
        groupId: String(data.groupId) || null,
        valueType: data.valueType,
        minValue: Number(data.minValue) || null,
        maxValue: Number(data.maxValue) || null,
        booleanValue: data.booleanValue ? (data.booleanValue as boolean) : null,
        textValue: String(data.textValue) || null,
      },
    });
  } catch (error) {
    serviceErrorResponse({
      error,
      customErrorMessage: 'Error creating parameter limit',
      status: 500,
    });
  }
}
