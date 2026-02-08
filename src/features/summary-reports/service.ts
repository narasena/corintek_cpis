import { prisma } from '@/lib/prisma';
import type {
  CreateSummaryReportInput,
  UpdateSummaryReportInput,
} from './types';
import { SummaryReport } from '@prisma/client';

export async function getSummaryReports(projectId: string) {
  return await prisma.summaryReport.findMany({
    where: { projectId },
    orderBy: { period: 'desc' },
  });
}

export async function getSummaryReportByPeriod(
  projectId: string,
  period: Date
) {
  return await prisma.summaryReport.findUnique({
    where: {
      projectId_period: {
        projectId,
        period,
      },
    },
  });
}

export async function createSummaryReport(data: CreateSummaryReportInput) {
  const { projectId, period, ...rest } = data;
  return await prisma.summaryReport.create({
    data: {
      projectId,
      period,
      ...rest,
    },
  });
}

export async function updateSummaryReport(data: UpdateSummaryReportInput) {
  const { id, ...rest } = data;
  return await prisma.summaryReport.update({
    where: { id },
    data: rest,
  });
}

// Ensure a report exists for the period (upsert logic basically)
export async function ensureSummaryReport(projectId: string, period: Date) {
  const existing = await getSummaryReportByPeriod(projectId, period);
  if (existing) return existing;

  return await createSummaryReport({ projectId, period });
}

function getMonthRange(period: Date) {
  const start = new Date(
    Date.UTC(period.getUTCFullYear(), period.getUTCMonth(), 1)
  );
  const end = new Date(
    Date.UTC(period.getUTCFullYear(), period.getUTCMonth() + 1, 1)
  );
  return { start, end };
}

export async function getMonthlyLogSheets(projectId: string, period: Date) {
  const { start, end } = getMonthRange(period);
  return prisma.logSheet.findMany({
    where: {
      projectId,
      date: { gte: start, lt: end },
      deletedAt: null,
    },
    include: {
      project: { include: { client: true } },
      photos: true,
      chemicalUsages: { include: { chemical: true } },
    },
    orderBy: { date: 'asc' },
  });
}

export async function getMonthlyWorkReports(projectId: string, period: Date) {
  const { start, end } = getMonthRange(period);
  return prisma.workReport.findMany({
    where: {
      projectId,
      date: { gte: start, lt: end },
      deletedAt: null,
    },
    include: {
      machines: true,
      photos: true,
      project: true,
    },
    orderBy: { date: 'asc' },
  });
}

export async function getMonthlyLabAnalyses(projectId: string, period: Date) {
  const { start, end } = getMonthRange(period);
  return prisma.labAnalysis.findMany({
    where: {
      projectId,
      date: { gte: start, lt: end },
      deletedAt: null,
    },
    include: {
      project: { include: { client: true, parameterOverrides: true } },
      columns: { where: { deletedAt: null } },
      entries: {
        where: { deletedAt: null },
        include: { parameter: true, column: true },
      },
    },
    orderBy: { date: 'asc' },
  });
}

export async function getMonthlyChemicalUsageSummary(
  projectId: string,
  period: Date
) {
  const logs = await getMonthlyLogSheets(projectId, period);
  const summary = new Map<
    string,
    { chemicalId: string; name: string; unit: string; total: number }
  >();

  for (const ls of logs) {
    for (const usage of ls.chemicalUsages) {
      const key = usage.chemicalId;
      const existing = summary.get(key);
      const amt = usage.amount ?? 0;
      if (existing) {
        existing.total += amt;
      } else {
        summary.set(key, {
          chemicalId: usage.chemicalId,
          name: usage.chemical.name,
          unit: usage.chemical.unit || '',
          total: amt,
        });
      }
    }
  }

  return [...summary.values()].sort((a, b) => a.name.localeCompare(b.name));
}
