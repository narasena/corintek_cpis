import { prisma } from '@/lib/prisma';
import type {
  IGetRecentActivitiesInput,
  IGetRecentActivitiesResult,
  IActivity,
  IDashboardConfig,
} from './types';
import type { TRbacRole } from '@/lib/rbac';
import type { IProjectAccessServices } from './utils';

// ============================================================================
// Legacy Exports (Preserved for backward compatibility)
// ============================================================================

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

// ============================================================================
// Activity Service (New - DB-01)
// ============================================================================

/**
 * Service class for dashboard activity operations
 * Uses constructor injection for dependencies
 */
export class ActivityService {
  constructor(private readonly projectServices: IProjectAccessServices) {}

  async getRecentActivities(
    input: IGetRecentActivitiesInput
  ): Promise<IGetRecentActivitiesResult> {
    const since = this.getSinceDate(input.timeRange ?? '7d');
    const limit = Math.min(input.limit ?? 15, 50);

    const [logSheets, workReports] = await Promise.all([
      this.queryLogSheetActivities(input.projectIds, since, limit),
      this.queryWorkReportActivities(input.projectIds, since, limit),
    ]);

    const activities = this.mapToActivities([...logSheets, ...workReports])
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);

    return {
      activities,
      hasMore: logSheets.length + workReports.length > limit,
      nextCursor: activities[activities.length - 1]?.id ?? null,
      appliedRange: input.timeRange ?? '7d',
      totalEstimate: activities.length,
    };
  }

  private getSinceDate(range: '7d' | '30d'): Date {
    const days = range === '30d' ? 30 : 7;
    return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  }

  async getDashboardConfig(role: TRbacRole): Promise<IDashboardConfig> {
    const { getDashboardConfig } = await import('./config');
    return getDashboardConfig(role);
  }

  /**
   * Query log sheet activities from database
   * @param projectIds - Filter by projects
   * @param since - Start date
   * @param limit - Max records
   * @returns Raw log sheet activity data
   */
  private async queryLogSheetActivities(
    projectIds: string[] | undefined,
    since: Date,
    limit: number
  ): Promise<
    Array<{
      id: string;
      date: Date;
      status: string;
      submittedAt: Date | null;
      submittedBy: {
        id: string;
        firstName: string;
        lastName: string | null;
        avatarUrl: string | null;
      } | null;
      approvedAt: Date | null;
      approvedBy: {
        id: string;
        firstName: string;
        lastName: string | null;
        avatarUrl: string | null;
      } | null;
      project: { id: string; name: string };
    }>
  > {
    const where: any = {
      deletedAt: null,
      OR: [{ submittedAt: { gte: since } }, { approvedAt: { gte: since } }],
    };
    if (projectIds?.length) where.projectId = { in: projectIds };

    return prisma.logSheet.findMany({
      where,
      select: {
        id: true,
        date: true,
        status: true,
        submittedAt: true,
        approvedAt: true,
        submittedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        project: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Query work report activities from database
   * @param projectIds - Filter by projects
   * @param since - Start date
   * @param limit - Max records
   * @returns Raw work report activity data
   */
  private async queryWorkReportActivities(
    projectIds: string[] | undefined,
    since: Date,
    limit: number
  ): Promise<
    Array<{
      id: string;
      createdAt: Date;
      zone: string | null;
      project: { id: string; name: string };
    }>
  > {
    const where: any = {
      deletedAt: null,
      status: 'SUBMITTED',
      createdAt: { gte: since },
    };
    if (projectIds?.length) where.projectId = { in: projectIds };

    return prisma.workReport.findMany({
      where,
      select: {
        id: true,
        createdAt: true,
        zone: true,
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Map database rows to IActivity interface
   * @param rows - Raw query results
   * @returns Mapped activity objects
   */
  private mapToActivities(rows: any[]): IActivity[] {
    return rows.flatMap(row => {
      const activities: IActivity[] = [];
      const base = {
        projectId: row.project?.id ?? null,
        projectName: row.project?.name ?? null,
      };

      // Log sheet submitted
      if (row.submittedAt && row.submittedBy) {
        activities.push({
          id: `ls:submit:${row.id}`,
          type: 'LOG_SHEET_SUBMITTED',
          severity: 'INFO',
          title: 'Log Sheet Disubmit',
          message:
            `${row.submittedBy.firstName} ${row.submittedBy.lastName ?? ''}`.trim() +
            ' mensubmit log sheet',
          ...base,
          userId: row.submittedBy.id,
          userName:
            `${row.submittedBy.firstName} ${row.submittedBy.lastName ?? ''}`.trim(),
          userAvatarUrl: row.submittedBy.avatarUrl,
          createdAt: row.submittedAt,
          link: `/log-sheets/${row.id}`,
          metadata: {
            logSheetId: row.id,
            logSheetDate: row.date.toISOString(),
          },
        });
      }

      // Log sheet approved
      if (row.approvedAt && row.approvedBy) {
        activities.push({
          id: `ls:approve:${row.id}`,
          type: 'LOG_SHEET_APPROVED',
          severity: 'SUCCESS',
          title: 'Log Sheet Disetujui',
          message:
            `${row.approvedBy.firstName} ${row.approvedBy.lastName ?? ''}`.trim() +
            ' menyetujui log sheet',
          ...base,
          userId: row.approvedBy.id,
          userName:
            `${row.approvedBy.firstName} ${row.approvedBy.lastName ?? ''}`.trim(),
          userAvatarUrl: row.approvedBy.avatarUrl,
          createdAt: row.approvedAt,
          link: `/log-sheets/${row.id}`,
          metadata: {
            logSheetId: row.id,
            logSheetDate: row.date.toISOString(),
          },
        });
      }

      // Work report submitted
      if (row.createdAt && !row.submittedAt && !row.approvedAt) {
        activities.push({
          id: `wr:${row.id}`,
          type: 'WORK_REPORT_SUBMITTED',
          severity: 'INFO',
          title: 'Work Report Dibuat',
          message:
            'Work report baru dibuat' +
            (row.zone ? ` untuk zona ${row.zone}` : ''),
          ...base,
          userId: 'system',
          userName: 'Sistem',
          userAvatarUrl: null,
          createdAt: row.createdAt,
          link: `/work-reports/${row.id}`,
          metadata: { workReportId: row.id, zone: row.zone, machineCount: 0 },
        });
      }

      return activities;
    });
  }
}

/**
 * Factory function for creating service instance
 * Uses default prisma client from lib/prisma
 */
export function createActivityService(
  projectServices: IProjectAccessServices
): ActivityService {
  return new ActivityService(projectServices);
}
