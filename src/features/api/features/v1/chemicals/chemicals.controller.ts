import { createErrorResponse } from '@/lib/error-handler';
import { NextRequest, NextResponse } from 'next/server';
import {
  createChemicalService,
  fetchAllChemicalsService,
} from './chemicals.service';
import {
  chemicalSchema,
  TChemicalAttributes,
} from '@/app/(main)/chemicals/schemas/chemicalSchema';
import requestValidation from '@/utils/api/v1/validation/requestValidation';
import { prisma } from '@/features/api/connection/prisma';
import { Prisma } from '@/features/api/generated/prisma';

export async function fetchAllChemicals() {
  try {
    const chemicals = await fetchAllChemicalsService();
    return NextResponse.json({
      success: true,
      chemicals,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function createChemical(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Body: ', body);
    console.log('null: ', null);
    const validatedResult = requestValidation<TChemicalAttributes>({
      validationSchema: chemicalSchema,
      data: body,
    });
    if (validatedResult instanceof NextResponse) {
      return validatedResult;
    }
    const validatedData = validatedResult;
    let newChemical;
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      newChemical = await createChemicalService(validatedData, tx);
    });
    return NextResponse.json(
      {
        success: true,
        message: 'Chemical baru berhasil ditambahkan',
        newChemical,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
