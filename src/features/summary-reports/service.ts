import { prisma } from '@/lib/prisma';
import type { IJwtPayload } from '@/@types/auth.type';
import type {
  CreateSummaryReportInput,
  UpdateSummaryReportInput,
} from './types';
import { ParameterCategory } from '@/generated/prisma/client';
import { ensureAccess, RbacResource } from '@/lib/rbac';
import { applyProjectOverridesToParameters } from '@/features/parameters/limits-utils';
import { getProjectReportingScope } from '@/features/projects/reporting-scope';

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

export async function getSummaryReportProjectId(
  id: string
): Promise<string | null> {
  const row = await prisma.summaryReport.findUnique({
    where: { id },
    select: { projectId: true },
  });

  return row?.projectId ?? null;
}

export async function createSummaryReport(
  actor: IJwtPayload,
  data: CreateSummaryReportInput
) {
  ensureAccess(actor.role, RbacResource.SUMMARY_REPORTS, 'create');
  const { projectId, period, ...rest } = data;
  return await prisma.summaryReport.create({
    data: {
      projectId,
      period,
      ...rest,
    },
  });
}

export async function updateSummaryReport(
  actor: IJwtPayload,
  data: UpdateSummaryReportInput
) {
  ensureAccess(actor.role, RbacResource.SUMMARY_REPORTS, 'update');

  if (
    data.status === 'FINAL' &&
    actor.role !== 'REPORTING' &&
    actor.role !== 'ADMIN'
  ) {
    throw new Error('Unauthorized');
  }

  const { id, ...rest } = data;
  return await prisma.summaryReport.update({
    where: { id },
    data: rest,
  });
}

// Ensure a report exists for the period (upsert logic basically)
export async function ensureSummaryReport(
  actor: IJwtPayload,
  projectId: string,
  period: Date
) {
  ensureAccess(actor.role, RbacResource.SUMMARY_REPORTS, 'create');
  const existing = await getSummaryReportByPeriod(projectId, period);
  if (existing) return existing;

  return await createSummaryReport(actor, { projectId, period });
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
  const scope = await getProjectReportingScope(projectId);
  const projectIds = scope?.projectIds ?? [projectId];
  return prisma.logSheet.findMany({
    where: {
      projectId:
        projectIds.length === 1 ? projectIds[0] : { in: projectIds },
      date: { gte: start, lt: end },
      deletedAt: null,
    },
    include: {
      project: { include: { client: true } },
      photos: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'asc' },
      },
      chemicalUsages: {
        where: { deletedAt: null },
        include: { chemical: true },
        orderBy: { chemical: { name: 'asc' } },
      },
      entries: {
        where: { deletedAt: null },
        include: { parameter: true, machine: true },
        orderBy: { createdAt: 'asc' },
      },
      replacedBy: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { date: 'asc' },
  });
}

export async function getProjectLogSheetConfig(projectId: string) {
  const { machines, parameters, labParameters, overrides } =
    await loadProjectLogSheetConfigData(projectId);

  const mapParameters = (params: typeof parameters) =>
    applyProjectOverridesToParameters(params as any, overrides as any);

  return {
    machines: groupMachinesByType(machines),
    parameters: mapParameters(parameters),
    labParameters: mapParameters(labParameters),
  };
}

async function loadProjectLogSheetConfigData(projectId: string) {
  try {
    const [machines, parameters, labParameters, project] = await Promise.all([
      prisma.machine.findMany({
        where: { projectId, deletedAt: null },
        select: { id: true, unitNumber: true, type: true },
        orderBy: [{ type: 'asc' }, { unitNumber: 'asc' }],
      }),
      prisma.parameter.findMany({
        where: {
          deletedAt: null,
          isActive: true,
          category: {
            not: ParameterCategory.LAB_ANALYSIS,
          },
        },
        select: {
          id: true,
          name: true,
          variableName: true,
          category: true,
          valueType: true,
          unit: true,
          minValue: true,
          maxValue: true,
          rawWaterMinValue: true,
          rawWaterMaxValue: true,
          displayOrder: true,
        },
        orderBy: [
          { category: 'asc' },
          { displayOrder: 'asc' },
          { createdAt: 'asc' },
        ],
      }),
      prisma.parameter.findMany({
        where: {
          deletedAt: null,
          isActive: true,
          category: ParameterCategory.LAB_ANALYSIS,
        },
        select: {
          id: true,
          name: true,
          variableName: true,
          category: true,
          valueType: true,
          unit: true,
          minValue: true,
          maxValue: true,
          rawWaterMinValue: true,
          rawWaterMaxValue: true,
          displayOrder: true,
        },
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
      }),
      prisma.project.findUnique({
        where: { id: projectId },
        include: { parameterOverrides: true },
      }),
    ]);

    return {
      machines,
      parameters,
      labParameters,
      overrides: project?.parameterOverrides || [],
    };
  } catch (error) {
    console.error(
      '[CPIS-ERROR] SummaryReport.ProjectLogSheetConfig.LoadData:',
      error
    );
    throw error;
  }
}

function groupMachinesByType(
  machines: Array<{ type: string; unitNumber: number; id: string }>
) {
  return {
    chillers: machines.filter(m => m.type === 'CHILLER'),
    coolingTowers: machines.filter(m => m.type === 'COOLING_TOWER'),
  };
}

export async function getMonthlyWorkReports(projectId: string, period: Date) {
  const { start, end } = getMonthRange(period);
  const scope = await getProjectReportingScope(projectId);
  const projectIds = scope?.projectIds ?? [projectId];
  return prisma.workReport.findMany({
    where: {
      projectId:
        projectIds.length === 1 ? projectIds[0] : { in: projectIds },
      date: { gte: start, lt: end },
      deletedAt: null,
    },
    include: {
      machines: true,
      photos: {
        where: { deletedAt: null },
      },
      project: true,
    },
    orderBy: { date: 'asc' },
  });
}

export async function getMonthlyLabAnalyses(projectId: string, period: Date) {
  const { start, end } = getMonthRange(period);
  const scope = await getProjectReportingScope(projectId);
  const projectIds = scope?.projectIds ?? [projectId];
  return prisma.labAnalysis.findMany({
    where: {
      projectId:
        projectIds.length === 1 ? projectIds[0] : { in: projectIds },
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
