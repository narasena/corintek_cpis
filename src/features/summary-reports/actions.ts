'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod/v4';
import { actionFactory } from '@/lib/action-factory';
import { RbacResource } from '@/lib/rbac';
import * as service from './service';
import * as projectService from '@/features/projects/service';
import { uploadToR2 } from '@/lib/r2-upload';

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

/**
 * Server Action: Update a summary report
 */
export const updateSummaryReportAction = actionFactory.protected(
  async ({ input, actor }) => {
    // If input is FormData, extract object
    const data = input instanceof FormData ? Object.fromEntries(input) : input;
    const validated = updateSchema.parse(data);

    const projectId = await service.getSummaryReportProjectId(validated.id);
    if (!projectId) throw new Error('Not found');
    
    await projectService.assertCanAccessProject(actor, projectId);
    await service.updateSummaryReport(actor, validated);

    revalidatePath('/summary-reports');
    return { success: true };
  },
  {
    metadata: { rbac: { resource: RbacResource.SUMMARY_REPORTS, capability: 'update' } },
  }
);

/**
 * Server Action: Create or update summary report for a period
 */
export const createSummaryReportAction = actionFactory.protected(
  async ({ input, actor }) => {
    const data = input instanceof FormData ? Object.fromEntries(input) : input;
    const validated = createSchema.parse(data);

    await projectService.assertCanAccessProject(actor, validated.projectId);
    
    const existing = await service.getSummaryReportByPeriod(
      validated.projectId,
      validated.period
    );

    if (existing) {
      const updated = await service.updateSummaryReport(actor, {
        id: existing.id,
        notes: validated.notes,
        includeExecutiveSummary: validated.includeExecutiveSummary,
        includeLogSheets: validated.includeLogSheets,
        includeLabAnalysis: validated.includeLabAnalysis,
        includeWorkReports: validated.includeWorkReports,
        includeChemicalReports: validated.includeChemicalReports,
      });
      revalidatePath('/summary-reports');
      return updated;
    }

    const created = await service.createSummaryReport(actor, validated);
    revalidatePath('/summary-reports');
    return created;
  },
  {
    metadata: { rbac: { resource: RbacResource.SUMMARY_REPORTS, capability: 'create' } },
  }
);

/**
 * Server Action: Get summary report by project and period
 */
export const getSummaryReportByPeriodAction = actionFactory.protected(
  async ({ input, actor }) => {
    const validated = getByPeriodSchema.parse({
      projectId: input.projectId,
      period: input.period.toISOString ? input.period.toISOString() : input.period,
    });

    await projectService.assertCanAccessProject(actor, validated.projectId);
    return service.getSummaryReportByPeriod(validated.projectId, validated.period);
  },
  {
    metadata: { rbac: { resource: RbacResource.SUMMARY_REPORTS, capability: 'read' } },
  }
);

/**
 * Server Action: Upload attachments for a summary report
 */
export const uploadSummaryReportAttachmentsAction = actionFactory.protected(
  async ({ input, actor }) => {
    if (!(input instanceof FormData)) {
      throw new Error('FormData required for file upload');
    }

    const data = Object.fromEntries(input);
    const parsed = attachmentSchema.parse(data);
    const periodLabel = input.get('period') as string;

    await projectService.assertCanAccessProject(actor, parsed.projectId);
    const report = await service.ensureSummaryReport(
      actor,
      parsed.projectId,
      parsed.period
    );

    const dataTemuanFile = input.get('dataTemuanFile') as File | null;
    const dataBlowdownFile = input.get('dataBlowdownFile') as File | null;
    const dataSuhuFile = input.get('dataSuhuFile') as File | null;
    const dataSuratJalanFile = input.get('dataSuratJalanFile') as File | null;

    const updates: any = { id: report.id };

    const processFile = async (file: File | null, keyPrefix: string) => {
      if (file?.size) {
        if (!isAllowedAttachmentType(file)) {
          throw new Error(`Tipe file ${keyPrefix} tidak didukung`);
        }
        
        const buffer = Buffer.from(await file.arrayBuffer());
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const key = `projects/${parsed.projectId}/summary-reports/${report.id}/attachments/${Date.now()}_${sanitizedName}`;

        return await uploadToR2({
          key,
          body: buffer,
          contentType: file.type,
        });
      }
      return undefined;
    };

    updates.dataTemuanUrl = await processFile(dataTemuanFile, 'data temuan');
    updates.dataBlowdownUrl = await processFile(dataBlowdownFile, 'data blowdown');
    updates.dataSuhuUrl = await processFile(dataSuhuFile, 'data suhu');
    updates.dataSuratJalanUrl = await processFile(dataSuratJalanFile, 'surat jalan');

    await service.updateSummaryReport(actor, updates);

    revalidatePath('/summary-reports');
    if (periodLabel) {
      revalidatePath(`/summary-reports/${parsed.projectId}/${periodLabel}/print`);
      revalidatePath(`/summary-reports/${parsed.projectId}/${periodLabel}/attachments/print`);
    }
    
    return { success: true };
  },
  {
    metadata: { rbac: { resource: RbacResource.SUMMARY_REPORTS, capability: 'update' } },
  }
);
