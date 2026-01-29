import { createDynamicLogSheetSchema } from '@/app/(main)/log-sheets/schemas/dynamicLogSheetSchema';
import { createErrorResponse } from '@/lib/error-handler';
import requestValidation from '@/utils/api/v1/validation/requestValidation';
import { NextRequest, NextResponse } from 'next/server';
import {
  createLogSheetService,
  fetchAllLogSheetsService,
  fetchLogSheetByIdService,
} from './logSheets.service';
import { fetchProjectByIdService } from '@/features/api/features/v1/projects/project.service';
import { Prisma } from '@/features/api/generated/prisma/client';
import { prisma } from '@/features/api/connection/prisma';
import { ILogSheetServiceData } from '@/types/log-sheet.type';

export async function createLogSheet(projectId: string, req: NextRequest) {
  try {
    const project = await fetchProjectByIdService(projectId);
    if (!project) {
      return NextResponse.json(
        {
          success: false,
          message: 'Project not found',
        },
        { status: 404 }
      );
    }

    // Fetch parameter groups for dynamic schema validation
    const parameterGroups = await prisma.parameterGroup.findMany({
      where: {
        type: 'LOG_SHEET',
      },
      include: {
        members: {
          include: {
            parameter: true,
          },
        },
      },
    });

    const schema = createDynamicLogSheetSchema(parameterGroups);

    const body = await req.json();
    const validatedInput = requestValidation<ILogSheetServiceData>({
      validationSchema: schema,
      data: body,
    });
    if (validatedInput instanceof NextResponse) {
      return validatedInput;
    }
    let newLogSheet;
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      newLogSheet = await createLogSheetService(
        validatedInput as ILogSheetServiceData,
        tx,
        projectId
      );
    });
    return NextResponse.json({
      success: true,
      message: 'Log sheet berhasil dibuat',
      newLogSheet,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function fetchAllLogSheets(projectId: string) {
  try {
    const logSheets = await fetchAllLogSheetsService(projectId);
    return NextResponse.json({
      success: true,
      logSheets,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function fetchLogSheetById(id: string) {
  try {
    const logSheetDetails = await fetchLogSheetByIdService(id);
    return NextResponse.json({
      success: true,
      logSheetDetails,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
