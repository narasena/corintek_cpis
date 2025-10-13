import { createErrorResponse } from '@/lib/error-handler';
import {
  createParameterService,
  fetchAllParametersService,
} from './parameters.service';
import { NextRequest, NextResponse } from 'next/server';
import requestValidation from '@/utils/api/v1/validation/requestValidation';
import { TParameterAttributes } from '@/types/parameter.type';
import { parameterSchema } from '@/app/(main)/parameters/schemas/parameterSchema';
import { prisma } from '@/features/api/connection/prisma';
import { Prisma } from '@/features/api/generated/prisma';

export async function fetchAllParameters() {
  try {
    const parameters = await fetchAllParametersService();
    return NextResponse.json({
      success: true,
      parameters,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function createParameter(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedResult = requestValidation<TParameterAttributes>({
      validationSchema: parameterSchema,
      data: body,
    });
    if (validatedResult instanceof NextResponse) {
      return validatedResult;
    }

    const validatedData = validatedResult;
    let newParameter;
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      newParameter = await createParameterService(validatedData, tx);
    });
    return NextResponse.json(
      {
        success: true,
        message: 'Parameter baru berhasil ditambahkan',
        newParameter,
      },
      { status: 201 }
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
