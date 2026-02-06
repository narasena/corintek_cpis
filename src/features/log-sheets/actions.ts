'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod/v4';
import * as logSheetService from './service';
import {
  CreateLogSheetEntrySchema,
  CreateLogSheetSchema,
  LogSheetEntryRoleEnum,
  LogSheetPhotoSchema,
  LogSheetStatusEnum,
  UpdateLogSheetSchema,
} from './types';
import { ValueTypeEnum } from '@/features/parameters/types';
import { chemicalUsageSchema } from '@/@types/chemical.type';

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
      fileUrl: z.string().nullable().optional(),
      checkedAt: z.coerce.date().nullable().optional(),
    })
  ),
});

const SaveLogSheetPhotosSchema = z.object({
  logSheetId: z.string().uuid('Log sheet ID tidak valid'),
  photos: z.array(LogSheetPhotoSchema),
});

const SaveLogSheetChemicalsSchema = z.object({
  logSheetId: z.string().uuid('Log sheet ID tidak valid'),
  usages: z.array(chemicalUsageSchema),
});

function isEmptyEntry(entry: {
  valueType: 'NUMBER' | 'BOOLEAN' | 'TEXT';
  numericValue?: number | null;
  boolValue?: boolean | null;
  textValue?: string | null;
  fileUrl?: string | null;
}) {
  if (entry.fileUrl) return false;

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
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal mengambil data log sheet',
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
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal membuat log sheet',
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
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Gagal memperbarui log sheet',
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

    if (validatedData.status === 'SUBMITTED') {
      await logSheetService.validateLogSheetForSubmission(validatedData.id);
    }

    const logSheet = await logSheetService.updateLogSheet(validatedData);
    revalidatePath('/log-sheets');
    revalidatePath(`/log-sheets/${logSheet.projectId}`);
    return { success: true, data: logSheet };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal memperbarui status log sheet',
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
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Gagal menghapus log sheet',
    };
  }
}

export async function getLogSheetDetailAction(id: string) {
  try {
    const validatedId = z.string().uuid().parse(id);
    const detail = await logSheetService.getLogSheetDetail(validatedId);
    return { success: true, data: detail };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal mengambil detail log sheet',
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
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Gagal menyimpan log sheet',
    };
  }
}

export async function saveLogSheetPhotosAction(data: unknown) {
  try {
    const validatedData = SaveLogSheetPhotosSchema.parse(data);
    await logSheetService.upsertLogSheetPhotos(
      validatedData.logSheetId,
      validatedData.photos
    );

    revalidatePath(`/log-sheets/${validatedData.logSheetId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal menyimpan foto log sheet',
    };
  }
}

export async function saveLogSheetChemicalsAction(data: unknown) {
  try {
    const validatedData = SaveLogSheetChemicalsSchema.parse(data);
    await logSheetService.upsertLogSheetChemicalUsages(
      validatedData.logSheetId,
      validatedData.usages
    );

    revalidatePath(`/log-sheets/${validatedData.logSheetId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal menyimpan penggunaan chemical',
    };
  }
}

export async function uploadLogSheetImageAction(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string;
    const logSheetId = formData.get('logSheetId') as string;

    if (!file) throw new Error('No file uploaded');

    const buffer = Buffer.from(await file.arrayBuffer());
    const workerUrl = process.env.R2_WORKER_URL;
    const authSecret = process.env.R2_AUTH_SECRET;

    if (!workerUrl || !authSecret) {
      throw new Error('Server configuration error: Missing R2 credentials');
    }

    // Clean up filename
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');

    // Structure: projects/{projectId}/log-sheets/{logSheetId}/{timestamp}_{filename}
    // Fallback to old path if IDs are missing (backward compatibility/safety)
    let key = `log-sheets/${Date.now()}-${sanitizedName}`;

    if (projectId && logSheetId) {
      key = `projects/${projectId}/log-sheets/${logSheetId}/${Date.now()}_${sanitizedName}`;
    }

    const response = await fetch(`${workerUrl}/${key}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authSecret}`,
        'Content-Type': file.type,
      },
      body: buffer,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    // The worker returns the object on GET, so the URL is the worker URL + key
    const url = `${workerUrl}/${key}`;

    return { success: true, url };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}
