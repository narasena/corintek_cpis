import {
  logSheetSchema,
  TLogSheetAttributes,
} from '@/app/(main)/log-sheets/schemas/logSheetSchema';
import { createErrorResponse } from '@/lib/error-handler';
import requestValidation from '@/utils/api/v1/validation/requestValidation';
import { NextRequest, NextResponse } from 'next/server';
import { createLogSheetService } from './logSheets.service';
import { fetchProjectByIdService } from '@/features/api/features/v1/projects/project.service';
import { Prisma } from '@/features/api/generated/prisma';
import { prisma } from '@/features/api/connection/prisma';

export async function createLogSheet(projectId: string, req: NextRequest) {
  try {
    const project = await fetchProjectByIdService(projectId);
    const chillerTotalUnit = project?.chillers?.length as number;
    const coolingTowerTotalUnit = project?.coolingTowers?.length as number;

    const schema = logSheetSchema({ chillerTotalUnit, coolingTowerTotalUnit });

    const body = await req.json();
    const validatedInput = requestValidation<TLogSheetAttributes>({
      validationSchema: schema,
      data: body,
    });
    if (validatedInput instanceof NextResponse) {
      return validatedInput;
    }
    let newLogSheet;
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      newLogSheet = await createLogSheetService(
        validatedInput as TLogSheetAttributes,
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

export async function fetchAllLogSheets(projectId: string, req: NextRequest) {
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
