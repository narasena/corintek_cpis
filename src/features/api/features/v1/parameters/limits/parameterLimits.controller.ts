import { createErrorResponse } from '@/lib/error-handler';
import { NextRequest, NextResponse } from 'next/server';
import {
  createParameterLimitService,
  fetchAllParameterLimitsService,
} from './parameterLimits.service';
import { TParameterLimitAttributes } from '@/types/parameter.type';
import requestValidation from '@/utils/api/v1/validation/requestValidation';
import { parameterLimitSchema } from '@/app/(main)/parameters/schemas/parameterLimitSchema';
import { prisma } from '@/features/api/connection/prisma';
import { Prisma } from '@/features/api/generated/prisma';

export async function fetchAllParameterLimits() {
  try {
    const parameterLimits = await fetchAllParameterLimitsService();
    return NextResponse.json({
      success: true,
      parameterLimits,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function createParameterLimit(req: NextRequest) {
  try {
    const body = await req.json();

    const validatedResult = requestValidation<TParameterLimitAttributes>({
      validationSchema: parameterLimitSchema,
      data: body,
    });
    if (validatedResult instanceof NextResponse) {
      return validatedResult;
    }

    const validatedData = validatedResult;

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await createParameterLimitService(
        validatedData as TParameterLimitAttributes,
        tx
      );
    });
    return NextResponse.json(
      {
        success: true,
        message: 'Parameter limit baru berhasil ditambahkan',
      },
      { status: 201 }
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
