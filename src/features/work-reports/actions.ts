'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { WorkReportPhotoType } from '@/generated/prisma/client';

import * as service from './service';
import { WorkReportSchema, UpdateWorkReportSchema } from './types';

export async function getWorkReportsByProjectAction(projectId: string) {
  try {
    const data = await service.getWorkReportsByProject(projectId);
    return { success: true, data };
  } catch (error) {
    console.error('[CPIS-ERROR] WorkReport.GetByProject:', error);
    return { success: false, message: 'Failed to fetch work reports' };
  }
}

export async function getWorkReportByIdAction(id: string) {
  try {
    const data = await service.getWorkReportById(id);
    if (!data) return { success: false, message: 'Not found' };
    return { success: true, data };
  } catch (error) {
    console.error('[CPIS-ERROR] WorkReport.GetById:', error);
    return { success: false, message: 'Failed to fetch work report' };
  }
}

// Helper to upload file to R2
async function uploadToR2(
  file: File,
  projectId: string,
  workReportId: string
): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const workerUrl = process.env.R2_WORKER_URL;
  const authSecret = process.env.R2_AUTH_SECRET;

  if (!workerUrl || !authSecret) {
    throw new Error('Server configuration error: Missing R2 credentials');
  }

  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = projectId
    ? `projects/${projectId}/work-reports/${workReportId}/${Date.now()}_${sanitizedName}`
    : `work-reports/${workReportId}/${Date.now()}_${sanitizedName}`;

  console.log('[WorkReport.Upload] Uploading to R2:', {
    key,
    size: file.size,
    type: file.type,
    workerUrl: workerUrl ? 'SET' : 'MISSING',
  });

  const response = await fetch(`${workerUrl}/${key}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${authSecret}`,
      'Content-Type': file.type,
    },
    body: buffer,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[WorkReport.Upload] Worker Error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    });
    throw new Error(
      `Upload failed: ${response.statusText} (${response.status})`
    );
  }

  return `${workerUrl}/${key}`;
}

export async function createWorkReportAction(formData: FormData) {
  let createdReportId: string | null = null;
  try {
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
    };

    const validated = WorkReportSchema.parse(rawData);
    const report = await service.createWorkReport(validated);
    createdReportId = report.id;

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

          const url = await uploadToR2(file, validated.projectId, report.id);
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
    return { success: true, data: { id: report.id } };
  } catch (error) {
    console.error('[CPIS-ERROR] WorkReport.Create:', error);
    if (error instanceof z.ZodError) {
      const firstError = error.errors?.[0];
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
    };

    const validated = UpdateWorkReportSchema.parse(rawData);
    const result = await service.updateWorkReport(validated);

    // Handle New Photos (Optional for Update)
    // For update, we treat photos as additive and non-transactional (legacy behavior)
    // or we can make it transactional too.
    // User only asked for "work report should be reverted back" which implies Creation.
    // For Update, reverting is harder (need to restore old state).
    // So we'll keep Update as is, but we CAN allow adding photos here too for convenience.

    revalidatePath(`/work-reports/${validated.projectId}`);
    return { success: true, data: { id: result.id } };
  } catch (error) {
    console.error('[CPIS-ERROR] WorkReport.Update:', error);
    if (error instanceof z.ZodError) {
      const firstError = error.errors?.[0];
      return {
        success: false,
        message: firstError?.message || 'Validation error',
      };
    }
    return { success: false, message: 'Failed to update work report' };
  }
}

export async function deleteWorkReportAction(formData: FormData) {
  const id = formData.get('id') as string;
  const projectId = formData.get('projectId') as string;

  if (!id) return { success: false, message: 'Missing ID' };

  try {
    await service.deleteWorkReport(id);
    revalidatePath(`/work-reports/${projectId}`);
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

    const buffer = Buffer.from(await file.arrayBuffer());
    const workerUrl = process.env.R2_WORKER_URL;
    const authSecret = process.env.R2_AUTH_SECRET;

    if (!workerUrl || !authSecret) {
      throw new Error('Server configuration error: Missing R2 credentials');
    }

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = projectId
      ? `projects/${projectId}/work-reports/${workReportId}/${Date.now()}_${sanitizedName}`
      : `work-reports/${workReportId}/${Date.now()}_${sanitizedName}`;

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

    const url = `${workerUrl}/${key}`;

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
