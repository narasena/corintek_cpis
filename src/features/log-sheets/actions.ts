'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod/v4';
import * as logSheetService from './service';
import * as projectService from '@/features/projects/service';
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
import { getCurrentUserDetails } from '@/lib/auth-helpers';
import { ensureAccess, RbacResource } from '@/lib/rbac';
import type { IJwtPayload } from '@/@types/auth.type';
import { isLogSheetEntryEmpty } from './utils';

const SaveLogSheetEntriesSchema = z.object({
  logSheetId: z.string().uuid('Log sheet ID tidak valid'),
  adminOverride: z.boolean().optional(),
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
  adminOverride: z.boolean().optional(),
  photos: z.array(LogSheetPhotoSchema),
});

const SaveLogSheetChemicalsSchema = z.object({
  logSheetId: z.string().uuid('Log sheet ID tidak valid'),
  adminOverride: z.boolean().optional(),
  usages: z.array(chemicalUsageSchema),
});

const SaveLogSheetMachinesSchema = z.object({
  logSheetId: z.string().uuid('Log sheet ID tidak valid'),
  adminOverride: z.boolean().optional(),
  machineIds: z.array(z.string().uuid('Machine ID tidak valid')),
});

const SaveLogSheetSignatureSchema = z.object({
  logSheetId: z.string().uuid('Log sheet ID tidak valid'),
  signatureRole: z.enum(['TECHNICIAN', 'CLIENT_PIC']),
  dataUrl: z
    .string()
    .min(1, 'Data tanda tangan wajib diisi')
    .regex(
      /^data:image\/(png|jpeg|jpg|webp);base64,/,
      'Format tanda tangan tidak valid'
    ),
});

async function requireActor(): Promise<IJwtPayload> {
  const user = await getCurrentUserDetails();
  if (!user) throw new Error('Unauthorized');
  return { id: user.id, email: user.email, role: user.role };
}

async function assertCanAccessLogSheet(actor: IJwtPayload, logSheetId: string) {
  const projectId = await logSheetService.getLogSheetProjectId(logSheetId);
  if (!projectId) throw new Error('Log sheet tidak ditemukan');
  await projectService.assertCanAccessProject(actor, projectId);
  return projectId;
}

function revalidateLogSheetPaths(projectId: string, logSheetId?: string): void {
  revalidatePath('/log-sheets');
  revalidatePath(`/log-sheets/${projectId}`);
  revalidatePath('/');
  revalidatePath(`/my-projects/${projectId}`);
  if (logSheetId) {
    revalidatePath(`/log-sheets/${projectId}/${logSheetId}`);
  }
}

export async function getLogSheetsByProjectAction(projectId: string) {
  try {
    const actor = await requireActor();
    ensureAccess(actor.role, RbacResource.LOG_SHEETS, 'read');
    const validatedProjectId = z.string().uuid().parse(projectId);
    await projectService.assertCanAccessProject(actor, validatedProjectId);
    const logSheets =
      await logSheetService.getLogSheetsByProject(validatedProjectId);
    return { success: true, data: logSheets };
  } catch (error) {
    console.error('[CPIS-ERROR] LogSheet.GetByProject:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal mengambil data log sheet',
    };
  }
}

export async function getAllLogSheetsAction() {
  try {
    const actor = await requireActor();
    ensureAccess(actor.role, RbacResource.REPORTS, 'read');

    const projectIds = await projectService.getAccessibleProjectIds(actor);
    const logSheets = await logSheetService.getAllLogSheets(
      projectIds ?? undefined
    );
    return { success: true, data: logSheets };
  } catch (error) {
    console.error('[CPIS-ERROR] LogSheet.GetAll:', error);
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
    const actor = await requireActor();
    ensureAccess(actor.role, RbacResource.LOG_SHEETS, 'create');
    const validatedData = CreateLogSheetSchema.parse(data);
    await projectService.assertCanAccessProject(actor, validatedData.projectId);
    await logSheetService.assertCanCreateLogSheet(
      actor,
      validatedData.projectId
    );
    const logSheet = await logSheetService.createLogSheet(validatedData);

    revalidateLogSheetPaths(validatedData.projectId);
    return { success: true, data: logSheet };
  } catch (error) {
    console.error('[CPIS-ERROR] LogSheet.Create:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal membuat log sheet',
    };
  }
}

export async function updateLogSheetAction(data: unknown) {
  try {
    const actor = await requireActor();
    ensureAccess(actor.role, RbacResource.LOG_SHEETS, 'update');
    const validatedData = UpdateLogSheetSchema.parse(data);
    await assertCanAccessLogSheet(actor, validatedData.id);
    const logSheet = await logSheetService.updateLogSheet(actor, {
      ...validatedData,
      status: undefined,
    });

    revalidateLogSheetPaths(logSheet.projectId);
    return { success: true, data: logSheet };
  } catch (error) {
    console.error('[CPIS-ERROR] LogSheet.Update:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Gagal memperbarui log sheet',
    };
  }
}

export async function updateLogSheetAdminOverrideAction(data: unknown) {
  try {
    const actor = await requireActor();
    ensureAccess(actor.role, RbacResource.LOG_SHEETS, 'update');
    if (actor.role !== 'ADMIN') throw new Error('Unauthorized');

    const validatedData = UpdateLogSheetSchema.parse(data);
    await assertCanAccessLogSheet(actor, validatedData.id);
    const logSheet = await logSheetService.updateLogSheet(
      actor,
      { ...validatedData, status: undefined },
      { allowAdminOverride: true }
    );

    revalidateLogSheetPaths(logSheet.projectId);
    return { success: true, data: logSheet };
  } catch (error) {
    console.error('[CPIS-ERROR] LogSheet.UpdateAdminOverride:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Gagal memperbarui log sheet',
    };
  }
}

export async function updateLogSheetStatusAction(data: unknown) {
  try {
    const actor = await requireActor();
    ensureAccess(actor.role, RbacResource.LOG_SHEETS, 'update');
    const validatedData = z
      .object({
        id: z.string().uuid(),
        status: LogSheetStatusEnum,
      })
      .parse(data);

    if (validatedData.status === 'SUBMITTED') {
      await logSheetService.validateLogSheetForSubmission(validatedData.id);
    }

    const logSheet = await logSheetService.updateLogSheetStatus(
      actor,
      validatedData.id,
      validatedData.status
    );
    revalidateLogSheetPaths(logSheet.projectId);
    return { success: true, data: logSheet };
  } catch (error) {
    console.error('[CPIS-ERROR] LogSheet.UpdateStatus:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal memperbarui status log sheet',
    };
  }
}

export async function submitLogSheetAction(id: string) {
  return updateLogSheetStatusAction({ id, status: 'SUBMITTED' });
}

export async function approveLogSheetAction(id: string) {
  return updateLogSheetStatusAction({ id, status: 'APPROVED' });
}

export async function deleteLogSheetAction(id: string) {
  try {
    const actor = await requireActor();
    ensureAccess(actor.role, RbacResource.LOG_SHEETS, 'delete');
    const validatedId = z.string().uuid().parse(id);
    await assertCanAccessLogSheet(actor, validatedId);
    const logSheet = await logSheetService.deleteLogSheet(validatedId);

    revalidateLogSheetPaths(logSheet.projectId);
    return { success: true };
  } catch (error) {
    console.error('[CPIS-ERROR] LogSheet.Delete:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Gagal menghapus log sheet',
    };
  }
}

export async function getLogSheetDetailAction(id: string) {
  try {
    const actor = await requireActor();
    ensureAccess(actor.role, RbacResource.LOG_SHEETS, 'read');
    const validatedId = z.string().uuid().parse(id);
    await assertCanAccessLogSheet(actor, validatedId);
    const detail = await logSheetService.getLogSheetDetail(validatedId);
    return { success: true, data: { ...detail, viewerRole: actor.role } };
  } catch (error) {
    console.error('[CPIS-ERROR] LogSheet.GetDetail:', error);
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
    const actor = await requireActor();
    ensureAccess(actor.role, RbacResource.LOG_SHEETS, 'update');
    const validatedData = SaveLogSheetEntriesSchema.parse(data);
    await assertCanAccessLogSheet(actor, validatedData.logSheetId);

    const allowAdminOverride =
      actor.role === 'ADMIN' && validatedData.adminOverride === true;

    for (const entry of validatedData.entries) {
      if (isLogSheetEntryEmpty(entry)) continue;
      CreateLogSheetEntrySchema.parse({
        ...entry,
        logSheetId: validatedData.logSheetId,
      });
    }

    await logSheetService.upsertLogSheetEntries(
      actor,
      validatedData.logSheetId,
      validatedData.entries.map(entry => ({
        ...entry,
        logSheetId: validatedData.logSheetId,
      })),
      { allowAdminOverride }
    );

    const projectId = await logSheetService.getLogSheetProjectId(
      validatedData.logSheetId
    );
    if (projectId) {
      revalidateLogSheetPaths(projectId, validatedData.logSheetId);
    }
    return { success: true };
  } catch (error) {
    console.error('[CPIS-ERROR] LogSheet.SaveEntries:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Gagal menyimpan log sheet',
    };
  }
}

export async function saveLogSheetPhotosAction(data: unknown) {
  try {
    const actor = await requireActor();
    ensureAccess(actor.role, RbacResource.LOG_SHEETS, 'update');
    const validatedData = SaveLogSheetPhotosSchema.parse(data);
    await assertCanAccessLogSheet(actor, validatedData.logSheetId);

    const allowAdminOverride =
      actor.role === 'ADMIN' && validatedData.adminOverride === true;
    await logSheetService.upsertLogSheetPhotos(
      actor,
      validatedData.logSheetId,
      validatedData.photos,
      { allowAdminOverride }
    );

    const projectId = await logSheetService.getLogSheetProjectId(
      validatedData.logSheetId
    );
    if (projectId) {
      revalidateLogSheetPaths(projectId, validatedData.logSheetId);
    }
    return { success: true };
  } catch (error) {
    console.error('[CPIS-ERROR] LogSheet.SavePhotos:', error);
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
    const actor = await requireActor();
    ensureAccess(actor.role, RbacResource.LOG_SHEETS, 'update');
    const validatedData = SaveLogSheetChemicalsSchema.parse(data);
    await assertCanAccessLogSheet(actor, validatedData.logSheetId);

    const allowAdminOverride =
      actor.role === 'ADMIN' && validatedData.adminOverride === true;
    await logSheetService.upsertLogSheetChemicalUsages(
      actor,
      validatedData.logSheetId,
      validatedData.usages,
      { allowAdminOverride }
    );

    const projectId = await logSheetService.getLogSheetProjectId(
      validatedData.logSheetId
    );
    if (projectId) {
      revalidateLogSheetPaths(projectId, validatedData.logSheetId);
    }
    return { success: true };
  } catch (error) {
    console.error('[CPIS-ERROR] LogSheet.SaveChemicals:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal menyimpan penggunaan chemical',
    };
  }
}

export async function saveLogSheetMachinesAction(data: unknown) {
  try {
    const actor = await requireActor();
    ensureAccess(actor.role, RbacResource.LOG_SHEETS, 'update');
    const validatedData = SaveLogSheetMachinesSchema.parse(data);
    await assertCanAccessLogSheet(actor, validatedData.logSheetId);

    const allowAdminOverride =
      actor.role === 'ADMIN' && validatedData.adminOverride === true;

    await logSheetService.upsertLogSheetMachines(
      actor,
      validatedData.logSheetId,
      validatedData.machineIds,
      { allowAdminOverride }
    );

    const projectId = await logSheetService.getLogSheetProjectId(
      validatedData.logSheetId
    );
    if (projectId) {
      revalidateLogSheetPaths(projectId, validatedData.logSheetId);
    }
    return { success: true };
  } catch (error) {
    console.error('[CPIS-ERROR] LogSheet.SaveMachines:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Gagal menyimpan pilihan unit',
    };
  }
}

export async function saveLogSheetSignatureAction(data: unknown) {
  try {
    const actor = await requireActor();
    ensureAccess(actor.role, RbacResource.LOG_SHEETS, 'update');

    const validated = SaveLogSheetSignatureSchema.parse(data);
    const { logSheetId, signatureRole, dataUrl } = validated;

    const projectId = await logSheetService.getLogSheetProjectId(logSheetId);
    if (!projectId) {
      throw new Error('Log sheet tidak ditemukan');
    }

    const matches = dataUrl.match(
      /^data:(image\/(png|jpeg|jpg|webp));base64,(.+)$/
    );
    if (!matches) {
      throw new Error('Format tanda tangan tidak valid');
    }

    const mimeType = matches[1];
    const base64 = matches[3];
    const buffer = Buffer.from(base64, 'base64');

    const workerUrl = process.env.R2_WORKER_URL;
    const authSecret = process.env.R2_AUTH_SECRET;

    if (!workerUrl || !authSecret) {
      throw new Error('Server configuration error: Missing R2 credentials');
    }

    const key = `projects/${projectId}/log-sheets/${logSheetId}/signatures/${signatureRole.toLowerCase()}-${Date.now()}.webp`;

    const response = await fetch(`${workerUrl}/${key}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authSecret}`,
        'Content-Type': mimeType,
      },
      body: buffer,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const url = `${workerUrl}/${key}`;

    const updated = await logSheetService.saveLogSheetSignature(
      actor,
      logSheetId,
      signatureRole,
      url
    );

    revalidateLogSheetPaths(projectId, logSheetId);

    return { success: true, url, data: updated };
  } catch (error) {
    console.error('[CPIS-ERROR] LogSheet.Signature:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Gagal menyimpan tanda tangan',
    };
  }
}

export async function uploadLogSheetImageAction(formData: FormData) {
  try {
    const actor = await requireActor();
    ensureAccess(actor.role, RbacResource.LOG_SHEETS, 'update');

    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string;
    const logSheetId = formData.get('logSheetId') as string;

    if (!file) throw new Error('No file uploaded');

    const validatedProjectId = z.string().uuid().parse(projectId);
    const validatedLogSheetId = z.string().uuid().parse(logSheetId);

    await projectService.assertCanAccessProject(actor, validatedProjectId);
    const actualProjectId =
      await logSheetService.getLogSheetProjectId(validatedLogSheetId);
    if (!actualProjectId || actualProjectId !== validatedProjectId) {
      throw new Error('Unauthorized');
    }

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
    console.error('[CPIS-ERROR] LogSheet.UploadImage:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}
