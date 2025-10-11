import { createErrorResponse } from '@/lib/error-handler';
import { NextRequest, NextResponse } from 'next/server';
import {
  createParameterGroupService,
  fetchAllParameterGroupsService,
  fetchParameterGroupByIdService,
  updateParameterGroupService,
  deleteParameterGroupService,
} from './parameterGroups.service';
import requestValidation from '@/utils/api/v1/validation/requestValidation';
import { prisma } from '@/features/api/connection/prisma';
import { Prisma } from '@/features/api/generated/prisma';
import { TParameterGroupAttributes } from '@/types/parameter.type';
import { parameterGroupSchema } from '@/app/(main)/parameters/schemas/parameterGroupSchema';

export async function createParameterGroup(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Body:', body);

    const validatedResult = requestValidation<TParameterGroupAttributes>({
      validationSchema: parameterGroupSchema,
      data: body,
    });
    if (validatedResult instanceof NextResponse) {
      return validatedResult;
    }

    const validatedData = validatedResult;

    let newParameterGroup;
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      newParameterGroup = await createParameterGroupService(
        validatedData as TParameterGroupAttributes,
        tx
      );
    });

    const newParameterGroupMessage =
      'Parameter group baru berhasil ditambahkan';
    console.log(`${newParameterGroupMessage}:`, newParameterGroup);
    return NextResponse.json({
      success: true,
      status: 201,
      message: newParameterGroupMessage,
      newParameterGroup,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function fetchAllParameterGroups(req: NextRequest) {
  try {
    const parameterGroups = await fetchAllParameterGroupsService(req);
    return NextResponse.json({
      success: true,
      parameterGroups,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function fetchParameterGroupById(req: NextRequest, id: string) {
  try {
    const parameterGroup = await fetchParameterGroupByIdService(req, id);
    return NextResponse.json({
      success: true,
      parameterGroup,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function updateParameterGroup(req: NextRequest, id: string) {
  try {
    const body = await req.json();
    console.log('Body:', body);

    const validatedResult = requestValidation<TParameterGroupAttributes>({
      validationSchema: parameterGroupSchema,
      data: body,
    });
    if (validatedResult instanceof NextResponse) {
      return validatedResult;
    }

    const validatedData = validatedResult;

    let updatedParameterGroup;
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      updatedParameterGroup = await updateParameterGroupService(
        id,
        validatedData as TParameterGroupAttributes,
        tx
      );
    });

    const updateParameterGroupMessage = 'Parameter group berhasil diperbarui';
    console.log(`${updateParameterGroupMessage}:`, updatedParameterGroup);
    return NextResponse.json({
      success: true,
      status: 200,
      message: updateParameterGroupMessage,
      updatedParameterGroup,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function deleteParameterGroup(req: NextRequest, id: string) {
  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await deleteParameterGroupService(id, tx);
    });

    const deleteParameterGroupMessage = 'Parameter group berhasil dihapus';
    console.log(`${deleteParameterGroupMessage}:`, id);
    return NextResponse.json({
      success: true,
      status: 200,
      message: deleteParameterGroupMessage,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
