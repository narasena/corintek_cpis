import { prisma } from '@/features/api/connection/prisma';
import { Prisma } from '@/features/api/generated/prisma/client';
import { serviceErrorResponse } from '@/lib/error-handler';

export async function fetchStandardMethodsService() {
  try {
    const whereClause: Prisma.StandardMethodWhereInput = {
      deletedAt: null,
    };
    const standardMethods = await prisma.standardMethod.findMany({
      where: whereClause,
    });
    return standardMethods;
  } catch (error) {
    serviceErrorResponse({
      error,
      customErrorMessage: 'Error fetching standard methods',
      status: 500,
    });
  }
}
