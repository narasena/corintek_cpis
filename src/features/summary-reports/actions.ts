'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth-helpers';
import { ensureAccess, RbacResource } from '@/lib/rbac';
import * as service from './service';

const booleanField = z.preprocess(value => {
  if (value === 'true' || value === 'on') return true;
  if (value === 'false') return false;
  return value;
}, z.boolean());

const updateSchema = z.object({
  id: z.string().uuid(),
  dataTemuanUrl: z.string().optional(),
  dataBlowdownUrl: z.string().optional(),
  dataSuhuUrl: z.string().optional(),
  dataSuratJalanUrl: z.string().optional(),
  notes: z.string().optional(),
  includeExecutiveSummary: booleanField.optional(),
  includeLogSheets: booleanField.optional(),
  includeLabAnalysis: booleanField.optional(),
  includeWorkReports: booleanField.optional(),
  includeChemicalReports: booleanField.optional(),
  status: z.enum(['DRAFT', 'FINAL']).optional(),
});

export async function updateSummaryReportAction(formData: FormData) {
  const actor = await getCurrentUser();
  if (!actor) return { error: 'Unauthorized' };

  const data = Object.fromEntries(formData);
  const parsed = updateSchema.safeParse(data);

  if (!parsed.success) {
    return {
      error: 'Validation failed',
      fields: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await service.updateSummaryReport(actor, parsed.data);
  } catch (error) {
    console.error('[CPIS-ERROR] SummaryReport.Update:', error);
    return { error: 'Failed to update report' };
  }

  revalidatePath('/summary-reports');
  return { success: true };
}

const createSchema = z.object({
  projectId: z.string().uuid(),
  period: z
    .string()
    .transform(value => {
      const d = new Date(value);
      return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
    })
    .refine(date => !isNaN(date.getTime()), { message: 'Invalid date' }),
  notes: z.string().optional(),
  includeExecutiveSummary: booleanField.optional(),
  includeLogSheets: booleanField.optional(),
  includeLabAnalysis: booleanField.optional(),
  includeWorkReports: booleanField.optional(),
  includeChemicalReports: booleanField.optional(),
});

const getByPeriodSchema = z.object({
  projectId: z.string().uuid(),
  period: z
    .string()
    .transform(value => {
      const d = new Date(value);
      return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
    })
    .refine(date => !isNaN(date.getTime()), { message: 'Invalid date' }),
});

const attachmentSchema = z.object({
  projectId: z.string().uuid(),
  period: z
    .string()
    .transform(value => {
      const d = new Date(value);
      return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
    })
    .refine(date => !isNaN(date.getTime()), { message: 'Invalid date' }),
});

function isAllowedAttachmentType(file: File) {
  return file.type === 'application/pdf' || file.type.startsWith('image/');
}

async function uploadSummaryReportAttachment(
  file: File,
  projectId: string,
  reportId: string
) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const workerUrl = process.env.R2_WORKER_URL;
  const authSecret = process.env.R2_AUTH_SECRET;

  if (!workerUrl || !authSecret) {
    throw new Error('Server configuration error: Missing R2 credentials');
  }

  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `projects/${projectId}/summary-reports/${reportId}/attachments/${Date.now()}_${sanitizedName}`;

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
    console.error('[CPIS-ERROR] SummaryReport.AttachmentUpload:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    });
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return `${workerUrl}/${key}`;
}

export async function createSummaryReportAction(formData: FormData) {
  const actor = await getCurrentUser();
  if (!actor) return { error: 'Unauthorized' };

  const data = Object.fromEntries(formData);
  const parsed = createSchema.safeParse(data);

  if (!parsed.success) {
    return {
      error: 'Validation failed',
      fields: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    ensureAccess(actor.role, RbacResource.SUMMARY_REPORTS, 'create');
    const existing = await service.getSummaryReportByPeriod(
      parsed.data.projectId,
      parsed.data.period
    );

    if (existing) {
      const updated = await service.updateSummaryReport(actor, {
        id: existing.id,
        notes: parsed.data.notes,
        includeExecutiveSummary: parsed.data.includeExecutiveSummary,
        includeLogSheets: parsed.data.includeLogSheets,
        includeLabAnalysis: parsed.data.includeLabAnalysis,
        includeWorkReports: parsed.data.includeWorkReports,
        includeChemicalReports: parsed.data.includeChemicalReports,
      });
      revalidatePath('/summary-reports');
      return { success: true, data: updated };
    }

    const created = await service.createSummaryReport(actor, parsed.data);
    revalidatePath('/summary-reports');
    return { success: true, data: created };
  } catch (error) {
    console.error('[CPIS-ERROR] SummaryReport.Create:', error);
    return { error: 'Failed to create report' };
  }
}

export async function getSummaryReportByPeriodAction(
  projectId: string,
  period: Date
) {
  const actor = await getCurrentUser();
  if (!actor) return { error: 'Unauthorized' };

  const parsed = getByPeriodSchema.safeParse({
    projectId,
    period: period.toISOString(),
  });

  if (!parsed.success) {
    return {
      error: 'Validation failed',
      fields: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    ensureAccess(actor.role, RbacResource.SUMMARY_REPORTS, 'read');
    const result = await service.getSummaryReportByPeriod(
      parsed.data.projectId,
      parsed.data.period
    );
    return { success: true, data: result };
  } catch (error) {
    console.error('[CPIS-ERROR] SummaryReport.GetByPeriod:', error);
    return { error: 'Failed to fetch report' };
  }
}

export async function uploadSummaryReportAttachmentsAction(formData: FormData) {
  const actor = await getCurrentUser();
  if (!actor) return { error: 'Unauthorized' };

  const data = Object.fromEntries(formData);
  const parsed = attachmentSchema.safeParse(data);

  if (!parsed.success) {
    return {
      error: 'Validation failed',
      fields: parsed.error.flatten().fieldErrors,
    };
  }

  const periodLabel = formData.get('period') as string;

  try {
    const report = await service.ensureSummaryReport(
      actor,
      parsed.data.projectId,
      parsed.data.period
    );

    const dataTemuanFile = formData.get('dataTemuanFile') as File | null;
    const dataBlowdownFile = formData.get('dataBlowdownFile') as File | null;
    const dataSuhuFile = formData.get('dataSuhuFile') as File | null;
    const dataSuratJalanFile = formData.get(
      'dataSuratJalanFile'
    ) as File | null;

    const updates: {
      id: string;
      dataTemuanUrl?: string;
      dataBlowdownUrl?: string;
      dataSuhuUrl?: string;
      dataSuratJalanUrl?: string;
    } = { id: report.id };

    if (dataTemuanFile?.size) {
      if (!isAllowedAttachmentType(dataTemuanFile)) {
        return { error: 'Tipe file data temuan tidak didukung' };
      }
      updates.dataTemuanUrl = await uploadSummaryReportAttachment(
        dataTemuanFile,
        parsed.data.projectId,
        report.id
      );
    }

    if (dataBlowdownFile?.size) {
      if (!isAllowedAttachmentType(dataBlowdownFile)) {
        return { error: 'Tipe file data blowdown tidak didukung' };
      }
      updates.dataBlowdownUrl = await uploadSummaryReportAttachment(
        dataBlowdownFile,
        parsed.data.projectId,
        report.id
      );
    }

    if (dataSuhuFile?.size) {
      if (!isAllowedAttachmentType(dataSuhuFile)) {
        return { error: 'Tipe file data suhu tidak didukung' };
      }
      updates.dataSuhuUrl = await uploadSummaryReportAttachment(
        dataSuhuFile,
        parsed.data.projectId,
        report.id
      );
    }

    if (dataSuratJalanFile?.size) {
      if (!isAllowedAttachmentType(dataSuratJalanFile)) {
        return { error: 'Tipe file surat jalan tidak didukung' };
      }
      updates.dataSuratJalanUrl = await uploadSummaryReportAttachment(
        dataSuratJalanFile,
        parsed.data.projectId,
        report.id
      );
    }

    await service.updateSummaryReport(actor, updates);

    revalidatePath('/summary-reports');
    if (periodLabel) {
      revalidatePath(
        `/summary-reports/${parsed.data.projectId}/${periodLabel}/print`
      );
      revalidatePath(
        `/summary-reports/${parsed.data.projectId}/${periodLabel}/attachments/print`
      );
    }
    return { success: true };
  } catch (error) {
    console.error('[CPIS-ERROR] SummaryReport.UploadAttachments:', error);
    return { error: 'Gagal mengupload lampiran' };
  }
}
