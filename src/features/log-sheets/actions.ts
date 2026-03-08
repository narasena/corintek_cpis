'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod/v4';
import { actionFactory } from '@/features/auth/di';
import { TActionResult } from '@/lib/action-helpers';
import { RbacResource } from '@/lib/rbac';
import * as logSheetService from './service';
import { updateLogSheetStatusWithNotifications } from './status-with-notifications';
import {
  notifyLimitBreachesOnSubmission,
  getTechnicianUserIds,
} from './log-sheet-notifications';
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
import type { IJwtPayload } from '@/@types/auth.type';
import { isLogSheetEntryEmpty } from './utils';
import { uploadToR2 } from '@/lib/r2-upload';

const MachineIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F-]{36}$/, 'Machine ID tidak valid');

const SaveLogSheetEntriesSchema = z.object({
  logSheetId: z.string().uuid('Log sheet ID tidak valid'),
  adminOverride: z.boolean().optional(),
  entries: z.array(
    z.object({
      parameterId: z.string().uuid('Parameter ID tidak valid'),
      machineId: z
        .string()
        .regex(
          /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
          'Machine ID tidak valid'
        )
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
  machineIds: z.array(
    z
      .string()
      .regex(
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
        'Machine ID tidak valid'
      )
  ),
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

export const getLogSheetsByProjectAction = actionFactory.protected(
  async ({ input, actor }) => {
    await projectService.assertCanAccessProject(actor, input);
    return logSheetService.getLogSheetsByProject(input);
  },
  {
    schema: z.string().uuid(),
    metadata: { rbac: { resource: RbacResource.LOG_SHEETS, capability: 'read' } },
  }
);

export const getAllLogSheetsAction = actionFactory.protected(
  async ({ actor }) => {
    const projectIds = await projectService.getAccessibleProjectIds(actor);
    return logSheetService.getAllLogSheets(projectIds ?? undefined);
  },
  {
    metadata: { rbac: { resource: RbacResource.REPORTS, capability: 'read' } },
  }
);

export const createLogSheetAction = actionFactory.protected(
  async ({ input, actor }) => {
    await projectService.assertCanAccessProject(actor, input.projectId);
    await logSheetService.assertCanCreateLogSheet(actor, input.projectId);
    const logSheet = await logSheetService.createLogSheet(input);

    revalidateLogSheetPaths(input.projectId);
    return logSheet;
  },
  {
    schema: CreateLogSheetSchema,
    metadata: { rbac: { resource: RbacResource.LOG_SHEETS, capability: 'create' } },
  }
);

export const updateLogSheetAction = actionFactory.protected(
  async ({ input, actor }) => {
    await assertCanAccessLogSheet(actor, input.id);
    const logSheet = await logSheetService.updateLogSheet(actor, {
      ...input,
      status: undefined,
    });

    revalidateLogSheetPaths(logSheet.projectId);
    return logSheet;
  },
  {
    schema: UpdateLogSheetSchema,
    metadata: { rbac: { resource: RbacResource.LOG_SHEETS, capability: 'update' } },
  }
);

export const updateLogSheetAdminOverrideAction = actionFactory.protected(
  async ({ input, actor }) => {
    if (actor.role !== 'ADMIN') throw new Error('Unauthorized');

    await assertCanAccessLogSheet(actor, input.id);
    const logSheet = await logSheetService.updateLogSheet(
      actor,
      { ...input, status: undefined },
      { allowAdminOverride: true }
    );

    revalidateLogSheetPaths(logSheet.projectId);
    return logSheet;
  },
  {
    schema: UpdateLogSheetSchema,
    metadata: { rbac: { resource: RbacResource.LOG_SHEETS, capability: 'update' } },
  }
);

export const updateLogSheetStatusAction = actionFactory.protected(
  async ({ input, actor }) => {
    const logSheet = await updateLogSheetStatusWithNotifications(actor, {
      id: input.id,
      status: input.status,
    });
    revalidateLogSheetPaths(logSheet.projectId);
    return logSheet;
  },
  {
    schema: z.object({
      id: z.string().uuid(),
      status: LogSheetStatusEnum,
    }),
    metadata: { rbac: { resource: RbacResource.LOG_SHEETS, capability: 'update' } },
  }
);

export async function submitLogSheetAction(id: string) {
  return updateLogSheetStatusAction({ id, status: 'SUBMITTED' });
}

export async function approveLogSheetAction(id: string) {
  return updateLogSheetStatusAction({ id, status: 'APPROVED' });
}

export const deleteLogSheetAction = actionFactory.protected(
  async ({ input, actor }) => {
    await assertCanAccessLogSheet(actor, input);
    const logSheet = await logSheetService.deleteLogSheet(input);

    revalidateLogSheetPaths(logSheet.projectId);
    return undefined;
  },
  {
    schema: z.string().uuid(),
    metadata: { rbac: { resource: RbacResource.LOG_SHEETS, capability: 'delete' } },
  }
);

export const getLogSheetDetailAction = actionFactory.protected(
  async ({ input, actor }) => {
    await assertCanAccessLogSheet(actor, input);
    const detail = await logSheetService.getLogSheetDetail(input);
    return { ...detail, viewerRole: actor.role };
  },
  {
    schema: z.string().uuid(),
    metadata: { rbac: { resource: RbacResource.LOG_SHEETS, capability: 'read' } },
  }
);

export const saveLogSheetEntriesAction = actionFactory.protected(
  async ({ input, actor }) => {
    await assertCanAccessLogSheet(actor, input.logSheetId);

    const allowAdminOverride =
      actor.role === 'ADMIN' && input.adminOverride === true;

    for (const entry of input.entries) {
      if (isLogSheetEntryEmpty(entry)) continue;
      CreateLogSheetEntrySchema.parse({
        ...entry,
        logSheetId: input.logSheetId,
      });
    }

    await logSheetService.upsertLogSheetEntries(
      actor,
      input.logSheetId,
      input.entries.map(entry => ({
        ...entry,
        logSheetId: input.logSheetId,
      })),
      { allowAdminOverride }
    );

    // Check for limit breaches and notify
    try {
      console.log('[DEBUG] Checking for limit breaches...');
      const detail = await logSheetService.getLogSheetDetail(input.logSheetId);
      const technicianIds = getTechnicianUserIds(detail);

      await notifyLimitBreachesOnSubmission({
        evaluatorUserId: actor.id,
        technicianUserIds: technicianIds,
        detail,
      });
    } catch (error) {
      console.error('[CPIS-ERROR] LogSheet.SaveEntries.Notify:', error);
    }

    const projectId = await logSheetService.getLogSheetProjectId(input.logSheetId);
    if (projectId) {
      revalidateLogSheetPaths(projectId, input.logSheetId);
    }
    return undefined;
  },
  {
    schema: SaveLogSheetEntriesSchema,
    metadata: { rbac: { resource: RbacResource.LOG_SHEETS, capability: 'update' } },
  }
);

export const saveLogSheetPhotosAction = actionFactory.protected(
  async ({ input, actor }) => {
    await assertCanAccessLogSheet(actor, input.logSheetId);

    const allowAdminOverride =
      actor.role === 'ADMIN' && input.adminOverride === true;
    await logSheetService.upsertLogSheetPhotos(
      actor,
      input.logSheetId,
      input.photos,
      { allowAdminOverride }
    );

    const projectId = await logSheetService.getLogSheetProjectId(input.logSheetId);
    if (projectId) {
      revalidateLogSheetPaths(projectId, input.logSheetId);
    }
    return undefined;
  },
  {
    schema: SaveLogSheetPhotosSchema,
    metadata: { rbac: { resource: RbacResource.LOG_SHEETS, capability: 'update' } },
  }
);

export const saveLogSheetChemicalsAction = actionFactory.protected(
  async ({ input, actor }) => {
    await assertCanAccessLogSheet(actor, input.logSheetId);

    const allowAdminOverride =
      actor.role === 'ADMIN' && input.adminOverride === true;
    await logSheetService.upsertLogSheetChemicalUsages(
      actor,
      input.logSheetId,
      input.usages,
      { allowAdminOverride }
    );

    const projectId = await logSheetService.getLogSheetProjectId(input.logSheetId);
    if (projectId) {
      revalidateLogSheetPaths(projectId, input.logSheetId);
    }
    return undefined;
  },
  {
    schema: SaveLogSheetChemicalsSchema,
    metadata: { rbac: { resource: RbacResource.LOG_SHEETS, capability: 'update' } },
  }
);

export const saveLogSheetMachinesAction = actionFactory.protected(
  async ({ input, actor }) => {
    await assertCanAccessLogSheet(actor, input.logSheetId);

    const allowAdminOverride =
      actor.role === 'ADMIN' && input.adminOverride === true;

    await logSheetService.upsertLogSheetMachines(
      actor,
      input.logSheetId,
      input.machineIds,
      { allowAdminOverride }
    );

    const projectId = await logSheetService.getLogSheetProjectId(input.logSheetId);
    if (projectId) {
      revalidateLogSheetPaths(projectId, input.logSheetId);
    }
    return undefined;
  },
  {
    schema: SaveLogSheetMachinesSchema,
    metadata: { rbac: { resource: RbacResource.LOG_SHEETS, capability: 'update' } },
  }
);

export const saveLogSheetSignatureAction = actionFactory.protected(
  async ({ input, actor }) => {
    const { logSheetId, signatureRole, dataUrl } = input;

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

    const key = `projects/${projectId}/log-sheets/${logSheetId}/signatures/${signatureRole.toLowerCase()}-${Date.now()}.webp`;

    const url = await uploadToR2({ key, body: buffer, contentType: mimeType });

    const updated = await logSheetService.saveLogSheetSignature(
      actor,
      logSheetId,
      signatureRole,
      url
    );

    revalidateLogSheetPaths(projectId, logSheetId);

    return { url, data: updated };
  },
  {
    schema: SaveLogSheetSignatureSchema,
    metadata: { rbac: { resource: RbacResource.LOG_SHEETS, capability: 'update' } },
  }
);

export const uploadLogSheetImageAction = actionFactory.protected(
  async ({ input: formData, actor }) => {
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string;
    const logSheetId = formData.get('logSheetId') as string;

    if (!file) throw new Error('No file uploaded');

    const validatedProjectId = z.string().uuid().parse(projectId);
    const validatedLogSheetId = z.string().uuid().parse(logSheetId);

    await projectService.assertCanAccessProject(actor, validatedProjectId);
    const actualProjectId = await logSheetService.getLogSheetProjectId(validatedLogSheetId);
    if (!actualProjectId || actualProjectId !== validatedProjectId) {
      throw new Error('Unauthorized');
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');

    let key = `log-sheets/${Date.now()}-${sanitizedName}`;

    if (projectId && logSheetId) {
      key = `projects/${projectId}/log-sheets/${logSheetId}/${Date.now()}_${sanitizedName}`;
    }

    const url = await uploadToR2({ key, body: buffer, contentType: file.type });

    return { url };
  },
  {
    metadata: { rbac: { resource: RbacResource.LOG_SHEETS, capability: 'update' } },
  }
) as (formData: FormData) => Promise<TActionResult<{ url: string }>>;
