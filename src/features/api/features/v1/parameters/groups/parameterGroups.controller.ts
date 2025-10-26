import { createErrorResponse } from '@/lib/error-handler';
import { NextRequest, NextResponse } from 'next/server';
import {
  createParameterGroupService,
  fetchAllParameterGroupsService,
  fetchParameterGroupByIdService,
  updateParameterGroupService,
  deleteParameterGroupService,
  fetchParameterGroupsByTypeService,
} from './parameterGroups.service';
import requestValidation from '@/utils/api/v1/validation/requestValidation';
import { prisma } from '@/features/api/connection/prisma';
import { ParameterGroupType, Prisma } from '@/features/api/generated/prisma';
import { TParameterGroupAttributes } from '@/types/parameter.type';
import { parameterGroupSchema } from '@/app/(main)/parameters/schemas/parameterGroupSchema';
import { AppError } from '@/lib/app-error';

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

export async function fetchAllParameterGroups() {
  try {
    const parameterGroups = await fetchAllParameterGroupsService();
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

export async function fetchParameterGroupsByType(type: ParameterGroupType) {
  try {
    const isValidType = Object.values(ParameterGroupType).includes(type);
    if (!isValidType) {
      throw new AppError({
        status: 400,
        message: 'Invalid parameter group type',
        isExpose: true,
      });
    }
    const groupParameters = await fetchParameterGroupsByTypeService(type);
    return NextResponse.json({
      success: true,
      groupParameters,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
