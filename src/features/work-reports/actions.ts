'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { WorkReportPhotoType } from '@/generated/prisma/client';
import { signR2Url, signR2UrlOrNull } from '@/lib/r2-sign';

import * as service from './service';
import {
  WorkReportSignatureSchema,
  CreateWorkReportInput,
  UpdateWorkReportInput,
} from './types';
import { actionFactory } from '@/features/auth/di';
import { RbacResource } from '@/lib/rbac';
import { z } from 'zod/v4';
import { assertEditableWorkReportStatus } from './status-policy';

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

    // Resolve the target project from server state, never from client input.
    const existing = await service.getWorkReportById(data.id);
    if (!existing) throw new Error('Work report tidak ditemukan');
    await projectService.assertCanAccessProject(actor, existing.projectId);

    const report = await service.updateWorkReport({
      ...data,
      projectId: existing.projectId,
    });
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
          }
        : (input as {
            photoId: string;
            workReportId: string;
          });

    const photo = await prisma.workReportPhoto.findUnique({
      where: { id: data.photoId },
      select: { workReportId: true },
    });

    // Authorize against the photo's own report before revealing whether the
    // photo exists, so lookups cannot be used as a cross-tenant oracle.
    if (!photo) return { success: false, error: 'Photo not found' };

    const workReport = await service.getWorkReportById(photo.workReportId);
    if (!workReport) throw new Error('Work report tidak ditemukan');
    await projectService.assertCanAccessProject(actor, workReport.projectId);

    if (photo.workReportId !== data.workReportId) {
      return {
        success: false,
        error: 'Photo does not belong to this work report',
      };
    }

    await service.deleteWorkReportPhoto(data.photoId);
    revalidatePath(
      `/work-reports/${workReport.projectId}/${data.workReportId}`
    );
    revalidatePath(`/work-reports/${workReport.projectId}`);
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

    await projectService.assertCanAccessProject(actor, reportData.projectId);

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
  // Only editable statuses are accepted from client-controlled FormData;
  // APPROVED is reserved for the dedicated approval workflow.
  assertEditableWorkReportStatus(
    typeof statusRaw === 'string' ? statusRaw : undefined
  );
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

    // Signed for immediate browser rendering; the stored value is unsigned.
    return { url: await signR2Url(url), id: photo.id };
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

    await projectService.assertCanAccessProject(actor, report.projectId);

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
    await projectService.assertCanAccessProject(actor, input);
    const reports = await service.getWorkReportsByProject(input);

    // Sign media URLs only after project access has been asserted.
    return Promise.all(
      reports.map(async report => ({
        ...report,
        photos: await Promise.all(
          (report.photos ?? []).map(async photo => ({
            ...photo,
            url: await signR2Url(photo.url),
          }))
        ),
        technicianSignatureUrl: await signR2UrlOrNull(
          report.technicianSignatureUrl
        ),
        clientPicSignatureUrl: await signR2UrlOrNull(
          report.clientPicSignatureUrl
        ),
      }))
    );
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
    const report = await service.getWorkReportById(input);
    if (!report) return null;

    await projectService.assertCanAccessProject(actor, report.projectId);

    // Sign media URLs only after project access has been asserted.
    return {
      ...report,
      photos: await Promise.all(
        (report.photos ?? []).map(async photo => ({
          ...photo,
          url: await signR2Url(photo.url),
        }))
      ),
      technicianSignatureUrl: await signR2UrlOrNull(
        report.technicianSignatureUrl
      ),
      clientPicSignatureUrl: await signR2UrlOrNull(
        report.clientPicSignatureUrl
      ),
    };
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
