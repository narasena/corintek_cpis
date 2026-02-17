'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { WorkReportPhotoType } from '@/generated/prisma/client';

import * as service from './service';
import {
  WorkReportSchema,
  WorkReportStatusEnum,
  UpdateWorkReportSchema,
} from './types';
import { getCurrentUserDetails } from '@/lib/auth-helpers';
import { ensureAccess, RbacResource } from '@/lib/rbac';
import * as projectService from '@/features/projects/service';
import type { IJwtPayload } from '@/@types/auth.type';
import { uploadWorkReportFile } from '@/features/work-reports/storage';
import {
  createWorkReportSignatureModule,
  type TWorkReportSignatureRole,
  type WorkReportSignatureModule,
} from './signature';
import { createPrismaWorkReportSignatureRepository } from './work-report-signature-repository-prisma';
import { createPrismaProjectAssignmentRepository } from './project-assignment-repository-prisma';
import { createR2WorkReportSignatureStorage } from './signature-storage-r2';

const SaveWorkReportSignatureSchema = z.object({
  workReportId: z.string().uuid('Work report ID tidak valid'),
  signatureRole: z.enum(['TECHNICIAN', 'CLIENT_PIC']),
  dataUrl: z
    .string()
    .min(1, 'Data tanda tangan wajib diisi')
    .regex(
      /^data:image\/(png|jpeg|jpg|webp);base64,/,
      'Format tanda tangan tidak valid'
    ),
});

type TSaveWorkReportSignatureActionResult =
  | { success: true }
  | { success: false; message: string };

export async function getWorkReportsByProjectAction(projectId: string) {
  try {
    const actorDetails = await getCurrentUserDetails();
    if (!actorDetails) return { success: false, message: 'Unauthorized' };
    const actor: IJwtPayload = {
      id: actorDetails.id,
      email: actorDetails.email,
      role: actorDetails.role,
    };

    ensureAccess(actor.role, RbacResource.WORK_REPORTS, 'read');
    const validatedProjectId = z.string().uuid().parse(projectId);
    await projectService.assertCanAccessProject(actor, validatedProjectId);

    const data = await service.getWorkReportsByProject(validatedProjectId);
    return { success: true, data };
  } catch (error) {
    console.error('[CPIS-ERROR] WorkReport.GetByProject:', error);
    return { success: false, message: 'Failed to fetch work reports' };
  }
}

export async function getWorkReportByIdAction(id: string) {
  try {
    const actorDetails = await getCurrentUserDetails();
    if (!actorDetails) return { success: false, message: 'Unauthorized' };
    const actor: IJwtPayload = {
      id: actorDetails.id,
      email: actorDetails.email,
      role: actorDetails.role,
    };

    ensureAccess(actor.role, RbacResource.WORK_REPORTS, 'read');
    const validatedId = z.string().uuid().parse(id);
    const data = await service.getWorkReportById(validatedId);
    if (!data) return { success: false, message: 'Not found' };

    await projectService.assertCanAccessProject(actor, data.projectId);
    return { success: true, data };
  } catch (error) {
    console.error('[CPIS-ERROR] WorkReport.GetById:', error);
    return { success: false, message: 'Failed to fetch work report' };
  }
}

export async function createWorkReportAction(formData: FormData) {
  try {
    const actorDetails = await getCurrentUserDetails();
    if (!actorDetails) return { success: false, message: 'Unauthorized' };
    const actor: IJwtPayload = {
      id: actorDetails.id,
      email: actorDetails.email,
      role: actorDetails.role,
    };
    ensureAccess(actor.role, RbacResource.WORK_REPORTS, 'create');

    const rawData = {
      projectId: formData.get('projectId'),
      date: new Date(formData.get('date') as string),
      situation: formData.get('situation'),
      workDone: formData.get('workDone'),
      workResult: formData.get('workResult'),
      machineIds: formData.getAll('machineIds'),
      timeStart: formData.get('timeStart')?.toString() || undefined,
      timeEnd: formData.get('timeEnd')?.toString() || undefined,
      zone: formData.get('zone')?.toString() || undefined,
      status: formData.get('status')?.toString() || undefined,
    };

    const validated = WorkReportSchema.parse(rawData);
    await projectService.assertCanAccessProject(actor, validated.projectId);

    const status = validated.status ?? 'DRAFT';
    if (status === 'APPROVED') {
      throw new Error('Unauthorized');
    }

    const report = await service.createWorkReport(validated);

    // Handle Photos Transactionally (Compensating Transaction Pattern)
    const photosBefore = formData.getAll('photos_BEFORE') as File[];
    const photosAfter = formData.getAll('photos_AFTER') as File[];
    const photosGeneral = formData.getAll('photos') as File[];

    const allPhotos = [
      ...photosBefore.map(f => ({
        file: f,
        type: 'BEFORE' as WorkReportPhotoType,
      })),
      ...photosAfter.map(f => ({
        file: f,
        type: 'AFTER' as WorkReportPhotoType,
      })),
      ...photosGeneral.map(f => ({
        file: f,
        type: 'GENERAL' as WorkReportPhotoType,
      })),
    ];

    console.log(`[WorkReport.Create] Processing ${allPhotos.length} photos`);

    if (allPhotos.length > 0) {
      try {
        const uploadPromises = allPhotos.map(async ({ file, type }) => {
          // Skip invalid files (e.g. empty inputs)
          if (file.size === 0 || file.name === 'undefined') return;

          const url = await uploadWorkReportFile({
            file,
            projectId: validated.projectId,
            workReportId: report.id,
          });
          await service.addWorkReportPhoto(report.id, url, undefined, type);
        });

        await Promise.all(uploadPromises);
      } catch (uploadError) {
        // Rollback: Delete the report if photo upload fails
        console.error(
          '[CPIS-ERROR] WorkReport.Create (Photo Upload Failed - Rolling Back):',
          uploadError
        );
        // Soft delete (or hard delete if preferred for immediate rollback)
        await service.deleteWorkReport(report.id);

        // Throw a specific error to be caught by the outer block
        throw new Error('Gagal mengupload foto. Laporan dibatalkan otomatis.');
      }
    }

    revalidatePath(`/work-reports/${validated.projectId}`);
    revalidatePath(`/my-projects/${validated.projectId}`);
    revalidatePath(`/`);
    return { success: true, data: { id: report.id } };
  } catch (error) {
    console.error('[CPIS-ERROR] WorkReport.Create:', error);
    if (error instanceof z.ZodError) {
      const firstError = (error as any).errors?.[0];
      return {
        success: false,
        message: firstError?.message || 'Validation error',
      };
    }
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Failed to create work report',
    };
  }
}

export async function updateWorkReportAction(formData: FormData) {
  try {
    const actorDetails = await getCurrentUserDetails();
    if (!actorDetails) return { success: false, message: 'Unauthorized' };
    const actor: IJwtPayload = {
      id: actorDetails.id,
      email: actorDetails.email,
      role: actorDetails.role,
    };
    ensureAccess(actor.role, RbacResource.WORK_REPORTS, 'update');

    const rawData = {
      id: formData.get('id'),
      projectId: formData.get('projectId'),
      date: new Date(formData.get('date') as string),
      timeStart: formData.get('timeStart')?.toString() || undefined,
      timeEnd: formData.get('timeEnd')?.toString() || undefined,
      zone: formData.get('zone')?.toString() || undefined,
      situation: formData.get('situation'),
      workDone: formData.get('workDone'),
      workResult: formData.get('workResult'),
      machineIds: formData.getAll('machineIds'),
      status: formData.get('status')?.toString() || undefined,
    };

    const validated = UpdateWorkReportSchema.parse(rawData);
    const existing = await service.getWorkReportById(validated.id);
    if (!existing) return { success: false, message: 'Not found' };

    await projectService.assertCanAccessProject(actor, existing.projectId);

    const existingStatus = (existing as any).status as
      | 'DRAFT'
      | 'SUBMITTED'
      | 'APPROVED';
    const desiredStatus = (validated.status ?? existingStatus) as
      | 'DRAFT'
      | 'SUBMITTED'
      | 'APPROVED';

    if (existingStatus === 'APPROVED' || desiredStatus === 'APPROVED') {
      throw new Error('Laporan sudah disetujui');
    }
    if (existingStatus !== 'DRAFT') {
      throw new Error('Laporan sudah dikirim dan tidak bisa diubah');
    }
    if (desiredStatus === 'DRAFT' || desiredStatus === 'SUBMITTED') {
      // allowed
    } else {
      throw new Error('Status tidak valid');
    }

    const result = await service.updateWorkReport({
      ...validated,
      projectId: existing.projectId,
    });

    // Handle New Photos (Optional for Update)
    // For update, we treat photos as additive and non-transactional (legacy behavior)
    // or we can make it transactional too.
    // User only asked for "work report should be reverted back" which implies Creation.
    // For Update, reverting is harder (need to restore old state).
    // So we'll keep Update as is, but we CAN allow adding photos here too for convenience.

    revalidatePath(`/work-reports/${validated.projectId}`);
    revalidatePath(`/my-projects/${validated.projectId}`);
    revalidatePath(`/`);
    return { success: true, data: { id: result.id } };
  } catch (error) {
    console.error('[CPIS-ERROR] WorkReport.Update:', error);
    if (error instanceof z.ZodError) {
      const firstError = (error as any).errors?.[0];
      return {
        success: false,
        message: firstError?.message || 'Validation error',
      };
    }
    return { success: false, message: 'Failed to update work report' };
  }
}

export async function updateWorkReportStatusAction(data: unknown) {
  try {
    const actorDetails = await getCurrentUserDetails();
    if (!actorDetails) return { success: false, message: 'Unauthorized' };
    const actor: IJwtPayload = {
      id: actorDetails.id,
      email: actorDetails.email,
      role: actorDetails.role,
    };

    ensureAccess(actor.role, RbacResource.WORK_REPORTS, 'update');
    const validated = z
      .object({
        id: z.string().uuid(),
        status: WorkReportStatusEnum,
      })
      .parse(data);

    const report = await service.updateWorkReportStatus(
      actor,
      validated.id,
      validated.status
    );

    if (!report) return { success: false, message: 'Not found' };

    revalidatePath(`/work-reports/${report.projectId}`);
    revalidatePath(`/my-projects/${report.projectId}`);
    revalidatePath(`/`);
    return {
      success: true,
      data: { id: report.id, status: (report as any).status },
    };
  } catch (error) {
    console.error('[CPIS-ERROR] WorkReport.UpdateStatus:', error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Failed to update work report',
    };
  }
}

export async function submitWorkReportAction(id: string) {
  return updateWorkReportStatusAction({ id, status: 'SUBMITTED' });
}

export async function approveWorkReportAction(id: string) {
  return updateWorkReportStatusAction({ id, status: 'APPROVED' });
}

export async function deleteWorkReportAction(formData: FormData) {
  const id = formData.get('id') as string;

  if (!id) return { success: false, message: 'Missing ID' };

  try {
    const actorDetails = await getCurrentUserDetails();
    if (!actorDetails) return { success: false, message: 'Unauthorized' };
    const actor: IJwtPayload = {
      id: actorDetails.id,
      email: actorDetails.email,
      role: actorDetails.role,
    };
    ensureAccess(actor.role, RbacResource.WORK_REPORTS, 'delete');

    const validatedId = z.string().uuid().parse(id);
    const existing = await service.getWorkReportById(validatedId);
    if (!existing) return { success: false, message: 'Not found' };

    await projectService.assertCanAccessProject(actor, existing.projectId);

    await service.deleteWorkReport(validatedId);
    revalidatePath(`/work-reports/${existing.projectId}`);
    revalidatePath(`/my-projects/${existing.projectId}`);
    revalidatePath(`/`);
    return { success: true };
  } catch (error) {
    console.error('[CPIS-ERROR] WorkReport.Delete:', error);
    return { success: false, message: 'Failed to delete work report' };
  }
}

export async function uploadWorkReportPhotoAction(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    const workReportId = formData.get('workReportId') as string;
    const projectId = formData.get('projectId') as string;
    const skipRevalidate = formData.get('skipRevalidate') === 'true';
    const type = (formData.get('type') as WorkReportPhotoType) || 'GENERAL';

    if (!file || !workReportId) throw new Error('Missing file or ID');

    const url = await uploadWorkReportFile({
      file,
      projectId: projectId || null,
      workReportId,
    });

    // Save to DB
    const photo = await service.addWorkReportPhoto(
      workReportId,
      url,
      undefined,
      type
    );

    if (!skipRevalidate) {
      revalidatePath(`/work-reports/${projectId}/${workReportId}`);
    }
    return { success: true, url, id: photo.id };
  } catch (error) {
    console.error('[CPIS-ERROR] WorkReport.UploadPhoto:', error);
    return {
      success: false,
      message:
        'Upload failed: ' +
        (error instanceof Error ? error.message : 'Unknown error'),
    };
  }
}

export async function revalidateWorkReportPathAction(
  projectId: string,
  workReportId?: string
) {
  revalidatePath(`/work-reports/${projectId}`);
  if (workReportId) {
    revalidatePath(`/work-reports/${projectId}/${workReportId}`);
  }
  revalidatePath(`/my-projects/${projectId}`);
  revalidatePath(`/`);
  return { success: true };
}

export async function deleteWorkReportPhotoAction(formData: FormData) {
  const photoId = formData.get('photoId') as string;
  const workReportId = formData.get('workReportId') as string;
  const projectId = formData.get('projectId') as string;

  if (!photoId) return { success: false, message: 'Missing Photo ID' };

  try {
    await service.deleteWorkReportPhoto(photoId);
  } catch (error) {
    console.error('[CPIS-ERROR] WorkReport.DeletePhoto:', error);
    return { success: false, message: 'Failed to delete photo' };
  }

  if (projectId && workReportId) {
    revalidatePath(`/work-reports/${projectId}/${workReportId}`);
  }
  return { success: true };
}

let cachedWorkReportSignatureModule: WorkReportSignatureModule | null = null;

function getWorkReportSignatureModule() {
  if (!cachedWorkReportSignatureModule) {
    const workReportRepository = createPrismaWorkReportSignatureRepository();
    const projectAssignmentRepository =
      createPrismaProjectAssignmentRepository();
    const signatureStorage = createR2WorkReportSignatureStorage();

    cachedWorkReportSignatureModule = createWorkReportSignatureModule({
      workReportRepository,
      projectAssignmentRepository,
      signatureStorage,
    });
  }

  return cachedWorkReportSignatureModule;
}

function mapActorToAuthContext(actor: IJwtPayload) {
  return {
    userId: actor.id,
    role: actor.role,
    email: actor.email,
  };
}

export async function saveWorkReportSignatureAction(
  data: unknown
): Promise<TSaveWorkReportSignatureActionResult> {
  try {
    const actorDetails = await getCurrentUserDetails();
    if (!actorDetails) return { success: false, message: 'Unauthorized' };
    const actor: IJwtPayload = {
      id: actorDetails.id,
      email: actorDetails.email,
      role: actorDetails.role,
    };

    ensureAccess(actor.role, RbacResource.WORK_REPORTS, 'update');
    const validated = SaveWorkReportSignatureSchema.parse(data);

    const module = getWorkReportSignatureModule();
    const result = await module.signatureService.signWorkReport({
      actor: mapActorToAuthContext(actor),
      workReportId: validated.workReportId,
      role: validated.signatureRole as TWorkReportSignatureRole,
      dataUrl: validated.dataUrl,
    });

    const projectId = result.report.projectId;
    revalidatePath(`/work-reports/${projectId}`);
    revalidatePath(`/work-reports/${projectId}/${validated.workReportId}`);
    revalidatePath(`/my-projects/${projectId}`);
    revalidatePath(`/`);

    return { success: true };
  } catch (error) {
    console.error('[CPIS-ERROR] WorkReport.Signature:', error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Failed to save work report signature',
    };
  }
}
