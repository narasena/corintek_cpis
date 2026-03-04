import { prisma } from '@/lib/prisma';
import type {
  TWaterQualityRow,
  TCondenserUnitRow,
  TParameterLimitInfo,
  TAnalyticsData,
} from './analytics-types';
import {
  WATER_QUALITY_CONFIG,
  CONDENSER_CONFIG,
  SOURCE_ROLE_MAP,
} from './analytics-types';
import { LogSheetEntryRole } from '@/generated/prisma/client';
import { getProjectReportingScope } from '@/features/projects/reporting-scope';

type TDailyAggregate = {
  sum: number;
  count: number;
};

const DEFAULT_CHILLER_CAPACITY = '250 TR';

export async function getAnalyticsData(
  projectId: string,
  period: Date
): Promise<TAnalyticsData> {
  const daysInMonth = getDaysInMonth(period);

  const [waterQuality, condenserApproach, limits] = await Promise.all([
    getWaterQualityAnalytics(projectId, period, daysInMonth),
    getCondenserApproachAnalytics(projectId, period, daysInMonth),
    getParameterLimitsForAnalytics(projectId),
  ]);

  return {
    waterQuality,
    condenserApproach,
    limits,
    daysInMonth,
  };
}

function getDaysInMonth(period: Date): number {
  const year = period.getUTCFullYear();
  const month = period.getUTCMonth();
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
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

function aggregateEntriesByDay(
  entries: Array<{
    numericValue: number | null;
    logSheet: { date: Date | null } | null;
  }>,
  daysInMonth: number
): (number | null)[] {
  const aggregates: (TDailyAggregate | null)[] = new Array(daysInMonth).fill(
    null
  );

  for (const entry of entries) {
    if (
      entry.numericValue === null ||
      entry.numericValue === undefined ||
      !entry.logSheet?.date
    ) {
      continue;
    }
    const day = new Date(entry.logSheet.date).getUTCDate();
    if (day < 1 || day > daysInMonth) continue;

    const index = day - 1;
    if (aggregates[index] === null) {
      aggregates[index] = { sum: entry.numericValue, count: 1 };
    } else {
      aggregates[index]!.sum += entry.numericValue;
      aggregates[index]!.count += 1;
    }
  }

  return aggregates.map(agg => (agg === null ? null : agg.sum / agg.count));
}

async function getWaterQualityAnalytics(
  projectId: string,
  period: Date,
  daysInMonth: number
): Promise<TWaterQualityRow[]> {
  const { start, end } = getMonthRange(period);
  const scope = await getProjectReportingScope(projectId);
  const projectIds = scope?.projectIds ?? [projectId];

  const variableNames = WATER_QUALITY_CONFIG.map(c => c.variableName);
  const parameters = await fetchParametersByVariableNames(variableNames);
  const entries = await fetchAllWaterQualityEntries(
    projectIds,
    parameters.map(p => p.id),
    start,
    end
  );

  return buildWaterQualityRows(parameters, entries, daysInMonth);
}

async function fetchParametersByVariableNames(
  variableNames: string[]
): Promise<Array<{ id: string; variableName: string }>> {
  try {
    return await prisma.parameter.findMany({
      where: { variableName: { in: variableNames } },
      select: { id: true, variableName: true },
    });
  } catch (error) {
    console.error(
      '[CPIS-ERROR] Analytics.fetchParametersByVariableNames:',
      error
    );
    return [];
  }
}

async function fetchAllWaterQualityEntries(
  projectIds: string[],
  parameterIds: string[],
  start: Date,
  end: Date
): Promise<
  Array<{
    numericValue: number | null;
    role: string;
    parameterId: string;
    logSheet: { date: Date | null } | null;
  }>
> {
  if (parameterIds.length === 0) return [];

  try {
    return await prisma.logSheetEntry.findMany({
      where: {
        parameterId: { in: parameterIds },
        logSheet: {
          projectId:
            projectIds.length === 1 ? projectIds[0] : { in: projectIds },
          date: { gte: start, lt: end },
          deletedAt: null,
        },
        deletedAt: null,
        numericValue: { not: null },
      },
      select: {
        numericValue: true,
        role: true,
        parameterId: true,
        logSheet: { select: { date: true } },
      },
    });
  } catch (error) {
    console.error('[CPIS-ERROR] Analytics.fetchAllWaterQualityEntries:', error);
    return [];
  }
}

function buildWaterQualityRows(
  parameters: Array<{ id: string; variableName: string }>,
  entries: Array<{
    numericValue: number | null;
    role: string;
    parameterId: string;
    logSheet: { date: Date | null } | null;
  }>,
  daysInMonth: number
): TWaterQualityRow[] {
  const paramMap = new Map(parameters.map(p => [p.variableName, p.id]));
  const rows: TWaterQualityRow[] = [];

  for (const config of WATER_QUALITY_CONFIG) {
    const paramId = paramMap.get(config.variableName);
    if (!paramId) continue;

    for (const source of config.sources) {
      const role = SOURCE_ROLE_MAP[source];
      const sourceEntries = entries.filter(
        e => e.parameterId === paramId && e.role === role
      );
      const dailyValues = aggregateEntriesByDay(sourceEntries, daysInMonth);

      rows.push({
        parameter: config.parameter,
        source,
        variableName: config.variableName,
        unit: config.unit,
        dailyValues,
      });
    }
  }

  return rows;
}

async function getParameterByVariableName(variableName: string) {
  try {
    return await prisma.parameter.findUnique({
      where: { variableName },
      select: { id: true, name: true },
    });
  } catch (error) {
    console.error('[CPIS-ERROR] Analytics.getParameterByVariableName:', error);
    return null;
  }
}

async function fetchDailyValues(
  projectIds: string[],
  parameterId: string,
  source: 'MAKE_WATER' | 'COOLING_TOWER',
  start: Date,
  end: Date,
  daysInMonth: number
): Promise<(number | null)[]> {
  const role = SOURCE_ROLE_MAP[source] as LogSheetEntryRole;

  try {
    const entries = await prisma.logSheetEntry.findMany({
      where: {
        parameterId,
        role,
        logSheet: {
          projectId:
            projectIds.length === 1 ? projectIds[0] : { in: projectIds },
          date: { gte: start, lt: end },
          deletedAt: null,
        },
        deletedAt: null,
        numericValue: { not: null },
      },
      select: {
        numericValue: true,
        logSheet: { select: { date: true } },
      },
    });

    return aggregateEntriesByDay(entries, daysInMonth);
  } catch (error) {
    console.error('[CPIS-ERROR] Analytics.fetchDailyValues:', error);
    return new Array(daysInMonth).fill(null);
  }
}

async function getCondenserApproachAnalytics(
  projectId: string,
  period: Date,
  daysInMonth: number
): Promise<TCondenserUnitRow[]> {
  const { start, end } = getMonthRange(period);
  const scope = await getProjectReportingScope(projectId);
  const projectIds = scope?.projectIds ?? [projectId];

  const machines = await getCondenserMachines(projectIds);
  const approachParam = await getParameterByVariableName(
    CONDENSER_CONFIG.approachVariableName
  );
  const loadParam = await getParameterByVariableName(
    CONDENSER_CONFIG.loadVariableName
  );

  if (!approachParam) return [];

  const rows: TCondenserUnitRow[] = [];

  for (const machine of machines) {
    const [dailyApproach, dailyLoad] = await Promise.all([
      fetchMachineDailyValues(
        projectIds,
        machine.id,
        approachParam.id,
        start,
        end,
        daysInMonth
      ),
      loadParam
        ? fetchMachineDailyValues(
            projectIds,
            machine.id,
            loadParam.id,
            start,
            end,
            daysInMonth
          )
        : Promise.resolve(new Array(daysInMonth).fill(null)),
    ]);

    rows.push({
      machineId: machine.id,
      unitName: `Chiller ${machine.unitNumber}`,
      capacity: machine.capacity
        ? String(machine.capacity)
        : DEFAULT_CHILLER_CAPACITY,
      dailyApproach,
      dailyLoad,
    });
  }

  return rows;
}

async function getCondenserMachines(projectIds: string[]) {
  try {
    return await prisma.machine.findMany({
      where: {
        projectId: projectIds.length === 1 ? projectIds[0] : { in: projectIds },
        type: 'CHILLER',
        deletedAt: null,
      },
      select: { id: true, unitNumber: true, capacity: true },
      orderBy: { unitNumber: 'asc' },
    });
  } catch (error) {
    console.error('[CPIS-ERROR] Analytics.getCondenserMachines:', error);
    return [];
  }
}

async function fetchMachineDailyValues(
  projectIds: string[],
  machineId: string,
  parameterId: string,
  start: Date,
  end: Date,
  daysInMonth: number
): Promise<(number | null)[]> {
  try {
    const entries = await prisma.logSheetEntry.findMany({
      where: {
        machineId,
        parameterId,
        role: 'VALUE',
        logSheet: {
          projectId:
            projectIds.length === 1 ? projectIds[0] : { in: projectIds },
          date: { gte: start, lt: end },
          deletedAt: null,
        },
        deletedAt: null,
        numericValue: { not: null },
      },
      select: {
        numericValue: true,
        logSheet: { select: { date: true } },
      },
    });

    return aggregateEntriesByDay(entries, daysInMonth);
  } catch (error) {
    console.error('[CPIS-ERROR] Analytics.fetchMachineDailyValues:', error);
    return new Array(daysInMonth).fill(null);
  }
}

export async function getParameterLimitsForAnalytics(
  projectId: string
): Promise<TParameterLimitInfo[]> {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { parameterLimitProfileId: true },
    });

    if (!project?.parameterLimitProfileId) return [];

    const limits = await prisma.parameterLimit.findMany({
      where: { profileId: project.parameterLimitProfileId },
      include: {
        parameter: { select: { name: true, variableName: true, unit: true } },
      },
    });

    return limits.map(limit => ({
      parameterName: limit.parameter.name,
      variableName: limit.parameter.variableName,
      min: limit.minValue,
      max: limit.maxValue,
      unit: limit.parameter.unit ?? '',
    }));
  } catch (error) {
    console.error(
      '[CPIS-ERROR] Analytics.getParameterLimitsForAnalytics:',
      error
    );
    return [];
  }
}
