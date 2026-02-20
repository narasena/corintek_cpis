import { prisma } from '@/lib/prisma';

export interface IDashboardMetric {
  date: string;
  condenserApproach: number | null;
  evaporatorApproach: number | null;
  condenserAmpere: number | null;
  evaporatorAmpere: number | null;
}

export async function getDashboardMetrics(
  projectIds?: string[],
  range?: { start: Date; end: Date }
): Promise<IDashboardMetric[]> {
  const whereLogSheet: any = { deletedAt: null, status: { not: 'DRAFT' } };
  if (projectIds && projectIds.length > 0) {
    whereLogSheet.projectId = { in: projectIds };
  }
  if (range) {
    whereLogSheet.date = { gte: range.start, lte: range.end };
  }

  const logSheets = await prisma.logSheet.findMany({
    where: whereLogSheet,
    select: {
      date: true,
      entries: {
        where: { deletedAt: null, valueType: 'NUMBER' },
        select: {
          numericValue: true,
          parameter: { select: { variableName: true } },
        },
      },
    },
    orderBy: { date: 'asc' },
  });

  const grouped = new Map<string, any>();

  for (const ls of logSheets) {
    const dateStr = ls.date.toISOString().split('T')[0];
    if (!grouped.has(dateStr)) {
      grouped.set(dateStr, {
        date: dateStr,
        condenserApproach: [],
        evaporatorApproach: [],
        condenserAmpere: [],
        evaporatorAmpere: [],
      });
    }

    const group = grouped.get(dateStr);
    for (const entry of ls.entries) {
      if (entry.numericValue === null) continue;
      const vName = entry.parameter.variableName;
      if (vName === 'approach_cond')
        group.condenserApproach.push(entry.numericValue);
      if (vName === 'approach_evap')
        group.evaporatorApproach.push(entry.numericValue);
      if (vName === 'ampere_cond')
        group.condenserAmpere.push(entry.numericValue);
      if (vName === 'ampere_evap')
        group.evaporatorAmpere.push(entry.numericValue);
    }
  }

  const avg = (arr: number[]) =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

  return Array.from(grouped.values()).map(g => ({
    date: g.date,
    condenserApproach: avg(g.condenserApproach),
    evaporatorApproach: avg(g.evaporatorApproach),
    condenserAmpere: avg(g.condenserAmpere),
    evaporatorAmpere: avg(g.evaporatorAmpere),
  }));
}

export async function getRecentLogSheetPhotos(
  projectIds?: string[],
  limit: number = 50
) {
  const whereClause: any = { deletedAt: null };
  if (projectIds && projectIds.length > 0) {
    whereClause.logSheet = { projectId: { in: projectIds } };
  }

  return prisma.logSheetPhoto.findMany({
    where: whereClause,
    include: {
      logSheet: { select: { date: true, project: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}
