'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

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

export async function createWorkReportAction(formData: FormData) {
  try {
    const rawData = {
      projectId: formData.get('projectId'),
      date: formData.get('date'),
      situation: formData.get('situation'),
      workDone: formData.get('workDone'),
      workResult: formData.get('workResult'),
      machineIds: formData.getAll('machineIds'),
    };

    const validated = WorkReportSchema.parse(rawData);
    await service.createWorkReport(validated);

    revalidatePath(`/work-reports/${validated.projectId}`);
    return { success: true };
  } catch (error) {
    console.error('[CPIS-ERROR] WorkReport.Create:', error);
    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0].message };
    }
    return { success: false, message: 'Failed to create work report' };
  }
}

export async function updateWorkReportAction(formData: FormData) {
  try {
    const rawData = {
      id: formData.get('id'),
      projectId: formData.get('projectId'),
      date: formData.get('date'),
      timeStart: formData.get('timeStart'),
      timeEnd: formData.get('timeEnd'),
      zone: formData.get('zone'),
      situation: formData.get('situation'),
      workDone: formData.get('workDone'),
      workResult: formData.get('workResult'),
      machineIds: formData.getAll('machineIds'),
    };

    const validated = UpdateWorkReportSchema.parse(rawData);
    await service.updateWorkReport(validated);

    revalidatePath(`/work-reports/${validated.projectId}`);
    return { success: true };
  } catch (error) {
    console.error('[CPIS-ERROR] WorkReport.Update:', error);
    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0].message };
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
    await service.addWorkReportPhoto(workReportId, url);

    revalidatePath(`/work-reports/${projectId}/${workReportId}`);
    return { success: true, url };
  } catch (error) {
    console.error('[CPIS-ERROR] WorkReport.UploadPhoto:', error);
    return { success: false, message: 'Upload failed' };
  }
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
