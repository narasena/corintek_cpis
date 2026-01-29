import { prisma } from '@/features/api/connection/prisma';
import { Prisma } from '@/features/api/generated/prisma/client';
import { serviceErrorResponse } from '@/lib/error-handler';

export async function fetchParameterGroupMembersService(groupId: string) {
  try {
    return await prisma.parameterGroupMember.findMany({
      where: {
        groupId,
        deletedAt: null,
      },
      include: {
        parameter: true,
      },
    });
  } catch (error) {
    serviceErrorResponse({
      error,
      customErrorMessage: 'Error fetching parameter group members',
      status: 500,
    });
  }
}

export async function addParameterGroupMembersService(
  groupId: string,
  parameterIds: string[],
  tx: Prisma.TransactionClient
) {
  try {
    const data = parameterIds.map(parameterId => ({
      groupId,
      parameterId,
    }));
    return await tx.parameterGroupMember.createMany({
      data,
      skipDuplicates: true,
    });
  } catch (error) {
    serviceErrorResponse({
      error,
      customErrorMessage: 'Error adding parameter group members',
      status: 500,
    });
  }
}

export async function removeParameterGroupMembersService(
  groupId: string,
  parameterIds: string[],
  tx: Prisma.TransactionClient
) {
  try {
    return await tx.parameterGroupMember.updateMany({
      where: {
        groupId,
        parameterId: { in: parameterIds },
      },
      data: {
        deletedAt: new Date(),
      },
    });
  } catch (error) {
    serviceErrorResponse({
      error,
      customErrorMessage: 'Error removing parameter group members',
      status: 500,
    });
  }
}
