'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod/v4';
import * as logSheetService from './service';
import {
  CreateLogSheetEntrySchema,
  CreateLogSheetSchema,
  LogSheetEntryRoleEnum,
  LogSheetStatusEnum,
  UpdateLogSheetSchema,
} from './types';
import { ValueTypeEnum } from '@/features/parameters/types';

const SaveLogSheetEntriesSchema = z.object({
  logSheetId: z.string().uuid('Log sheet ID tidak valid'),
  entries: z.array(
    z.object({
      parameterId: z.string().uuid('Parameter ID tidak valid'),
      machineId: z
        .string()
        .uuid('Machine ID tidak valid')
        .nullable()
        .optional(),
      role: LogSheetEntryRoleEnum.default('VALUE'),
      valueType: ValueTypeEnum,
      numericValue: z.number().nullable().optional(),
      boolValue: z.boolean().nullable().optional(),
      textValue: z.string().nullable().optional(),
      checkedAt: z.coerce.date().nullable().optional(),
    })
  ),
});

function isEmptyEntry(entry: {
  valueType: 'NUMBER' | 'BOOLEAN' | 'TEXT';
  numericValue?: number | null;
  boolValue?: boolean | null;
  textValue?: string | null;
}) {
  if (entry.valueType === 'NUMBER') {
    return entry.numericValue === null || entry.numericValue === undefined;
  }

  if (entry.valueType === 'BOOLEAN') {
    return entry.boolValue === null || entry.boolValue === undefined;
  }

  if (entry.valueType === 'TEXT') {
    return (
      entry.textValue === null ||
      entry.textValue === undefined ||
      entry.textValue.trim() === ''
    );
  }

  return true;
}

export async function getLogSheetsByProjectAction(projectId: string) {
  try {
    const validatedProjectId = z.string().uuid().parse(projectId);
    const logSheets =
      await logSheetService.getLogSheetsByProject(validatedProjectId);
    return { success: true, data: logSheets };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Gagal mengambil data log sheet',
    };
  }
}

export async function createLogSheetAction(data: unknown) {
  try {
    const validatedData = CreateLogSheetSchema.parse(data);
    const logSheet = await logSheetService.createLogSheet(validatedData);

    revalidatePath('/log-sheets');
    revalidatePath(`/log-sheets/${validatedData.projectId}`);
    return { success: true, data: logSheet };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Gagal membuat log sheet',
    };
  }
}

export async function updateLogSheetAction(data: unknown) {
  try {
    const validatedData = UpdateLogSheetSchema.parse(data);
    const logSheet = await logSheetService.updateLogSheet(validatedData);

    revalidatePath('/log-sheets');
    revalidatePath(`/log-sheets/${logSheet.projectId}`);
    return { success: true, data: logSheet };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Gagal memperbarui log sheet',
    };
  }
}

export async function updateLogSheetStatusAction(data: unknown) {
  try {
    const validatedData = z
      .object({
        id: z.string().uuid(),
        status: LogSheetStatusEnum,
      })
      .parse(data);

    const logSheet = await logSheetService.updateLogSheet(validatedData);
    revalidatePath('/log-sheets');
    revalidatePath(`/log-sheets/${logSheet.projectId}`);
    return { success: true, data: logSheet };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Gagal memperbarui status log sheet',
    };
  }
}

export async function deleteLogSheetAction(id: string) {
  try {
    const validatedId = z.string().uuid().parse(id);
    const logSheet = await logSheetService.deleteLogSheet(validatedId);

    revalidatePath('/log-sheets');
    revalidatePath(`/log-sheets/${logSheet.projectId}`);
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Gagal menghapus log sheet',
    };
  }
}

export async function getLogSheetDetailAction(id: string) {
  try {
    const validatedId = z.string().uuid().parse(id);
    const detail = await logSheetService.getLogSheetDetail(validatedId);
    return { success: true, data: detail };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Gagal mengambil detail log sheet',
    };
  }
}

export async function saveLogSheetEntriesAction(data: unknown) {
  try {
    const validatedData = SaveLogSheetEntriesSchema.parse(data);

    for (const entry of validatedData.entries) {
      if (isEmptyEntry(entry)) continue;
      CreateLogSheetEntrySchema.parse({
        ...entry,
        logSheetId: validatedData.logSheetId,
      });
    }

    await logSheetService.upsertLogSheetEntries(
      validatedData.logSheetId,
      validatedData.entries.map(entry => ({
        ...entry,
        logSheetId: validatedData.logSheetId,
      }))
    );

    revalidatePath('/log-sheets');
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Gagal menyimpan log sheet',
    };
  }
}
