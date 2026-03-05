'use server';

import { revalidatePath } from 'next/cache';
import { WorkReportPhotoType } from '@/generated/prisma/client';

import * as service from './service';
import {
  WorkReportSchema,
  WorkReportSignatureSchema,
} from './types';
import { actionFactory } from '@/lib/action-factory';
import { RbacResource } from '@/lib/rbac';
import { z } from 'zod/v4';

// =============================================================================
// Work Report Actions - Server Action Layer
// =============================================================================

/**
 * Server Action: Create a new work report
 */
export const createWorkReportAction = actionFactory.protected(
  async ({ input, actor }) => {
    const report = await service.createWorkReport(actor, input);
    revalidatePath(`/projects/${report.projectId}`);
    return report;
  },
  {
    schema: WorkReportSchema,
    metadata: {
      rbac: { resource: RbacResource.WORK_REPORTS, capability: 'create' },
    },
  }
);

/**
 * Server Action: Update an existing work report
 */
export const updateWorkReportAction = actionFactory.protected(
  async ({ input, actor }) => {
    const report = await service.updateWorkReport(actor, input.id, input.data);
    revalidatePath(`/projects/${report.projectId}`);
    return report;
  },
  {
    schema: z.object({
      id: z.string().uuid(),
      data: WorkReportSchema.partial(),
    }),
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
      input.status
    );
    revalidatePath(`/projects/${report.projectId}`);
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
 */
export const saveWorkReportSignatureAction = actionFactory.protected(
  async ({ input, actor }) => {
    const result = await service.saveWorkReportSignature(actor, input);
    if (result?.projectId) {
      revalidatePath(`/projects/${result.projectId}`);
    }
    return result;
  },
  {
    schema: WorkReportSignatureSchema,
    metadata: {
      rbac: { resource: RbacResource.WORK_REPORTS, capability: 'update' },
    },
  }
);

/**
 * Server Action: Delete a photo from a work report
 */
export const deleteWorkReportPhotoAction = actionFactory.protected(
  async ({ input, actor }) => {
    await service.deleteWorkReportPhoto(actor, input.photoId);
    revalidatePath(`/projects/${input.projectId}`);
    return { success: true };
  },
  {
    schema: z.object({
      photoId: z.string().uuid(),
      projectId: z.string().uuid(),
    }),
    metadata: {
      rbac: { resource: RbacResource.WORK_REPORTS, capability: 'delete' },
    },
  }
);

/**
 * Server Action: Delete a work report
 */
export const deleteWorkReportAction = actionFactory.protected(
  async ({ input, actor }) => {
    const report = await service.getWorkReportById(actor, input);
    if (!report) throw new Error('Work report tidak ditemukan');

    await service.deleteWorkReport(actor, input);
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
