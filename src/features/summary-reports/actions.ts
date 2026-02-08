'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth-helpers';
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
  const user = await getCurrentUser();
  if (!user) return { error: 'Unauthorized' };

  const data = Object.fromEntries(formData);
  const parsed = updateSchema.safeParse(data);

  if (!parsed.success) {
    return {
      error: 'Validation failed',
      fields: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await service.updateSummaryReport(parsed.data);
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

export async function createSummaryReportAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Unauthorized' };

  const data = Object.fromEntries(formData);
  const parsed = createSchema.safeParse(data);

  if (!parsed.success) {
    return {
      error: 'Validation failed',
      fields: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const existing = await service.getSummaryReportByPeriod(
      parsed.data.projectId,
      parsed.data.period
    );

    if (existing) {
      const updated = await service.updateSummaryReport({
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

    const created = await service.createSummaryReport(parsed.data);
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
  const user = await getCurrentUser();
  if (!user) return { error: 'Unauthorized' };

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
