import { TChemicalAttributes } from '@/app/(main)/chemicals/schemas/chemicalSchema';
import { prisma } from '@/features/api/connection/prisma';
import { Prisma } from '@/features/api/generated/prisma';
import { AppError } from '@/lib/app-error';
import { serviceErrorResponse } from '@/lib/error-handler';

export async function fetchAllChemicalsService() {
  try {
    const whereClause: Prisma.ChemicalWhereInput = {
      deletedAt: null,
    };

    const chemicals = await prisma.chemical.findMany({
      where: whereClause,
    });

    return chemicals;
  } catch (error) {
    serviceErrorResponse({
      error,
      customErrorMessage: 'Error fetching chemicals',
      status: 500,
    });
  }
}

export async function createChemicalService(
  data: TChemicalAttributes,
  tx: Prisma.TransactionClient
) {
  try {
    const existingChemical = await tx.chemical.findFirst({
      where: {
        OR: [
          {
            name: {
              equals: data.name,
              mode: 'insensitive',
            },
          },
          { code: data.code },
        ],
      },
    });
    if (existingChemical) {
      throw new AppError({
        status: 400,
        message: 'Chemical sudah ada',
        isExpose: true,
      });
    }
    return await tx.chemical.create({
      data: {
        name: data.name,
        code: data.code,
        type: data.type,
        description: String(data.description) || null,
        unit: String(data.unit) || null,
      },
    });
  } catch (error) {
    serviceErrorResponse({
      error,
      customErrorMessage: 'Error creating chemical',
      status: 500,
    });
  }
}
