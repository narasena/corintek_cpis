'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { WorkReportPhotoType } from '@/generated/prisma/client';

import * as service from './service';
import {
  WorkReportSchema,
  WorkReportSignatureSchema,
  CreateWorkReportInput,
  UpdateWorkReportInput,
} from './types';
import { actionFactory } from '@/features/auth/di';
import { RbacResource } from '@/lib/rbac';
import { z } from 'zod/v4';

// =============================================================================
// Work Report Actions - Server Action Layer
// =============================================================================

/**
 * Server Action: Update an existing work report
 */
export const updateWorkReportAction = actionFactory.protected(
  async ({ input, actor }) => {
    let data: UpdateWorkReportInput;
    if (input instanceof FormData) {
      const id = input.get('id') as string;
      const parsed = parseWorkReportFormData(input);
      data = { id, ...parsed };
    } else {
      data = input as UpdateWorkReportInput;
    }
    const report = await service.updateWorkReport(data);
    if (report) revalidatePath(`/projects/${report.projectId}`);
    return report;
  },
  {
    metadata: {
      rbac: { resource: RbacResource.WORK_REPORTS, capability: 'update' },
    },
  }
);

/**
 * Server Action: Update work report status (submit/approve/reject)
 */
export const updateWorkReportStatusAction = actionFactory.protected(
  async ({ input, actor }) => {
    const report = await service.updateWorkReportStatus(
      actor,
      input.id,
      input.status as any
    );
    if (report) revalidatePath(`/projects/${report.projectId}`);
    return report;
  },
  {
    schema: z.object({
      id: z.string().uuid(),
      status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED']),
    }),
    metadata: {
      rbac: { resource: RbacResource.WORK_REPORTS, capability: 'update' },
    },
  }
);

/**
 * Server Action: Save a signature for a work report
 * Self-authorizes internally — clients can sign despite read-only RBAC.
 */
export const saveWorkReportSignatureAction = actionFactory.protected(
  async ({ input, actor }) => {
    const result = await service.saveWorkReportSignature(input.workReportId, {
      signatureDataUrl: input.dataUrl,
      signedByUserId: actor.id,
      role: input.role,
      actorRole: actor.role,
    });
    if (result?.projectId) {
      revalidatePath(`/projects/${result.projectId}`);
    }
    return result;
  },
  {
    schema: WorkReportSignatureSchema,
  }
);

/**
 * Server Action: Delete a photo from a work report
 */
export const deleteWorkReportPhotoAction = actionFactory.protected(
  async ({ input, actor }) => {
    const data =
      input instanceof FormData
        ? {
            photoId: input.get('photoId') as string,
            workReportId: input.get('workReportId') as string,
            projectId: input.get('projectId') as string,
          }
        : (input as {
            photoId: string;
            workReportId: string;
            projectId: string;
          });

    const photo = await prisma.workReportPhoto.findUnique({
      where: { id: data.photoId },
      select: { workReportId: true },
    });

    if (!photo) {
      return { success: false, error: 'Photo not found' };
    }

    if (photo.workReportId !== data.workReportId) {
      return {
        success: false,
        error: 'Photo does not belong to this work report',
      };
    }

    await service.deleteWorkReportPhoto(data.photoId);
    revalidatePath(`/work-reports/${data.projectId}/${data.workReportId}`);
    revalidatePath(`/work-reports/${data.projectId}`);
    return { success: true };
  },
  {
    metadata: {
      rbac: { resource: RbacResource.WORK_REPORTS, capability: 'update' },
    },
  }
);

/**
 * Server Action: Create a new work report
 */
export const createWorkReportAction = actionFactory.protected(
  async ({ input, actor }) => {
    let reportData: CreateWorkReportInput;
    if (input instanceof FormData) {
      reportData = parseWorkReportFormData(input);
    } else {
      const inp = input as unknown as CreateWorkReportInput;
      reportData = {
        projectId: inp.projectId,
        date: inp.date,
        situation: inp.situation,
        workDone: inp.workDone,
        workResult: inp.workResult,
        timeStart: inp.timeStart,
        timeEnd: inp.timeEnd,
        zone: inp.zone,
        machineIds: inp.machineIds,
        status: inp.status,
      };
    }

    const report = await service.createWorkReport(reportData);
    if (report) revalidatePath(`/projects/${report.projectId}`);
    return report;
  },
  {
    metadata: {
      rbac: { resource: RbacResource.WORK_REPORTS, capability: 'create' },
    },
  }
);

import { uploadToR2 } from '@/lib/r2-upload';
import * as projectService from '@/features/projects/service';
import { TActionResult } from '@/lib/action-helpers';

function parseWorkReportFormData(formData: FormData) {
  const projectId = formData.get('projectId');
  if (typeof projectId !== 'string') throw new Error('Invalid projectId');

  const dateStr = formData.get('date');
  if (typeof dateStr !== 'string') throw new Error('Invalid date');

  const timeStart = formData.get('timeStart');
  const timeEnd = formData.get('timeEnd');
  const zone = formData.get('zone');
  const situation = formData.get('situation');
  if (typeof situation !== 'string') throw new Error('Invalid situation');

  const workDone = formData.get('workDone');
  if (typeof workDone !== 'string') throw new Error('Invalid workDone');

  const workResult = formData.get('workResult');
  if (typeof workResult !== 'string') throw new Error('Invalid workResult');

  const statusRaw = formData.get('status');
  const status = (typeof statusRaw === 'string' ? statusRaw : 'DRAFT') as
    | 'DRAFT'
    | 'SUBMITTED';

  const machineIds = formData.getAll('machineIds') as string[];

  return {
    projectId,
    date: new Date(dateStr),
    timeStart: typeof timeStart === 'string' ? timeStart : undefined,
    timeEnd: typeof timeEnd === 'string' ? timeEnd : undefined,
    zone: typeof zone === 'string' ? zone : undefined,
    situation,
    workDone,
    workResult,
    status: status as 'DRAFT' | 'SUBMITTED',
    machineIds: machineIds.length > 0 ? machineIds : [],
  };
}

/**
 * Server Action: Upload a photo for a work report
 */
export const uploadWorkReportPhotoAction = actionFactory.protected(
  async ({ input: formData, actor }) => {
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string;
    const workReportId = formData.get('workReportId') as string;

    if (!file) throw new Error('No file uploaded');

    const validatedProjectId = z.string().uuid().parse(projectId);
    const validatedWorkReportId = z.string().uuid().parse(workReportId);

    await projectService.assertCanAccessProject(actor, validatedProjectId);

    // BUG-041: Verify work report belongs to the specified project (IDOR prevention)
    const workReport = await service.getWorkReportById(validatedWorkReportId);
    if (!workReport) {
      throw new Error('Work report not found');
    }
    if (workReport.projectId !== validatedProjectId) {
      throw new Error('Work report does not belong to the specified project');
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');

    const key = `projects/${projectId}/work-reports/${workReportId}/${Date.now()}_${sanitizedName}`;

    const url = await uploadToR2({ key, body: buffer, contentType: file.type });

    const caption = formData.get('caption') as string | null;
    const type = (formData.get('type') as string) || 'GENERAL';
    const photo = await service.addWorkReportPhoto(
      validatedWorkReportId,
      url,
      caption || undefined,
      type as WorkReportPhotoType
    );

    return { url, id: photo.id };
  },
  {
    metadata: {
      rbac: { resource: RbacResource.WORK_REPORTS, capability: 'update' },
    },
  }
) as (formData: FormData) => Promise<TActionResult<{ url: string }>>;

// Aliases for convenience
export const submitWorkReportAction = async (id: string) => {
  return updateWorkReportStatusAction({ id, status: 'SUBMITTED' });
};

export const approveWorkReportAction = async (id: string) => {
  return updateWorkReportStatusAction({ id, status: 'APPROVED' });
};

export const rejectWorkReportAction = async (id: string) => {
  return updateWorkReportStatusAction({ id, status: 'REJECTED' });
};

/**
 * Server Action: Delete a work report
 */
export const deleteWorkReportAction = actionFactory.protected(
  async ({ input, actor }) => {
    const report = await service.getWorkReportById(input);
    if (!report) throw new Error('Work report tidak ditemukan');

    await service.deleteWorkReport(input);
    revalidatePath(`/projects/${report.projectId}`);
    return { success: true };
  },
  {
    schema: z.string().uuid(),
    metadata: {
      rbac: { resource: RbacResource.WORK_REPORTS, capability: 'delete' },
    },
  }
);

/**
 * Server Action: Get work reports by project
 */
export const getWorkReportsByProjectAction = actionFactory.protected(
  async ({ input, actor }) => {
    return service.getWorkReportsByProject(input);
  },
  {
    schema: z.string().uuid(),
    metadata: {
      rbac: { resource: RbacResource.WORK_REPORTS, capability: 'read' },
    },
  }
);

/**
 * Server Action: Get work report by ID
 */
export const getWorkReportByIdAction = actionFactory.protected(
  async ({ input, actor }) => {
    return service.getWorkReportById(input);
  },
  {
    schema: z.string().uuid(),
    metadata: {
      rbac: { resource: RbacResource.WORK_REPORTS, capability: 'read' },
    },
  }
);

export const revalidateWorkReportPathAction = async (
  projectId: string,
  workReportId?: string
) => {
  revalidatePath(`/work-reports/${projectId}`);
  if (workReportId) {
    revalidatePath(`/work-reports/${projectId}/${workReportId}`);
  }
  return { success: true };
};
