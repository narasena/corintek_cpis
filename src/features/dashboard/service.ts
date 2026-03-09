import { prisma } from '@/lib/prisma';
import type {
  IGetRecentActivitiesInput,
  IGetRecentActivitiesResult,
  IActivity,
  IDashboardConfig,
  TActivityType,
} from './types';
import type { TRbacRole } from '@/lib/rbac';
import type { IProjectAccessServices } from './utils';
import type { IActivityRepository } from './di';
import { Prisma } from '@prisma/client';

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
  const whereLogSheet: Prisma.LogSheetWhereInput = {
    deletedAt: null,
    status: { not: 'DRAFT' },
  };
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

  const grouped = new Map<
    string,
    {
      date: string;
      condenserApproach: number[];
      evaporatorApproach: number[];
      condenserAmpere: number[];
      evaporatorAmpere: number[];
    }
  >();

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

    const group = grouped.get(dateStr)!;
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
  const whereClause: Prisma.LogSheetPhotoWhereInput = { deletedAt: null };
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

/**
 * Get summary statistics for Admin/Director dashboard
 */
export async function getAdminDashboardStats() {
  const [activeProjects, totalProjects, pendingLogSheets, totalClients] =
    await Promise.all([
      prisma.project.count({ where: { status: 'ONGOING', deletedAt: null } }),
      prisma.project.count({ where: { deletedAt: null } }),
      prisma.logSheet.count({
        where: { status: 'SUBMITTED', deletedAt: null },
      }),
      prisma.client.count({ where: { deletedAt: null } }),
    ]);

  return {
    activeProjects,
    totalProjects,
    pendingLogSheets,
    totalClients,
  };
}

// ============================================================================
// Activity Service (New - DB-01)
// ============================================================================

/**
 * Service class for dashboard activity operations
 * Uses constructor injection for dependencies
 */
export class ActivityService {
  constructor(
    private readonly repository: IActivityRepository,
    private readonly projectServices: IProjectAccessServices
  ) {}

  async getRecentActivities(
    input: IGetRecentActivitiesInput
  ): Promise<IGetRecentActivitiesResult> {
    const since = this.getSinceDate(input.timeRange ?? '7d');
    const limit = Math.min(input.limit ?? 15, 50);
    const allowedTypes = input.types;

    const [logSheets, workReports] = await Promise.all([
      this.repository.queryLogSheetActivities(input.projectIds, since, limit),
      this.repository.queryWorkReportActivities(input.projectIds, since, limit),
    ]);

    const activitiesRaw = [...logSheets, ...workReports];
    const activitiesMapped = this.mapToActivities(activitiesRaw, allowedTypes)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);

    return {
      activities: activitiesMapped,
      hasMore: activitiesRaw.length > limit,
      nextCursor: activitiesMapped[activitiesMapped.length - 1]?.id ?? null,
      appliedRange: input.timeRange ?? '7d',
      totalEstimate: activitiesMapped.length,
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
  async queryLogSheetActivities(
    projectIds: string[] | undefined,
    since: Date,
    limit: number
  ) {
    const where: Prisma.LogSheetWhereInput = {
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
            deletedAt: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            deletedAt: true,
          },
        },
        project: { select: { id: true, name: true, deletedAt: true } },
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
  async queryWorkReportActivities(
    projectIds: string[] | undefined,
    since: Date,
    limit: number
  ) {
    const where: Prisma.WorkReportWhereInput = {
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
        project: { select: { id: true, name: true, deletedAt: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  private mapToActivities(
    rows: any[],
    allowedTypes?: TActivityType[]
  ): IActivity[] {
    return rows.flatMap(row =>
      this.extractActivitiesFromRow(row, allowedTypes)
    );
  }

  private extractActivitiesFromRow(
    row: any,
    allowedTypes?: TActivityType[]
  ): IActivity[] {
    const base = this.buildBaseActivity(row);

    const candidates = [
      this.buildLogSheetSubmittedActivity(row, base),
      this.buildLogSheetApprovedActivity(row, base),
      this.buildWorkReportActivity(row, base),
    ].filter(Boolean) as IActivity[];

    return allowedTypes
      ? candidates.filter(a => allowedTypes.includes(a.type))
      : candidates;
  }

  private buildBaseActivity(row: any) {
    const isDeletedProject = row.project?.deletedAt != null;
    return {
      projectId: row.project?.id ?? null,
      projectName: isDeletedProject
        ? 'Proyek Terhapus'
        : (row.project?.name ?? null),
    };
  }

  private buildLogSheetSubmittedActivity(
    row: any,
    base: any
  ): IActivity | null {
    if (!row.submittedAt || !row.submittedBy) return null;
    const user = this.formatUser(row.submittedBy);

    return {
      id: `ls:submit:${row.id}`,
      type: 'LOG_SHEET_SUBMITTED',
      severity: 'INFO',
      title: 'Log Sheet Disubmit',
      message: `${user.userName} mensubmit log sheet`,
      ...base,
      userId: row.submittedBy.id,
      userName: user.userName,
      userAvatarUrl: user.avatarUrl,
      createdAt: row.submittedAt,
      link: `/log-sheets/${row.id}`,
      metadata: { logSheetId: row.id, logSheetDate: row.date.toISOString() },
    };
  }

  private buildLogSheetApprovedActivity(row: any, base: any): IActivity | null {
    if (!row.approvedAt || !row.approvedBy) return null;
    const user = this.formatUser(row.approvedBy);

    return {
      id: `ls:approve:${row.id}`,
      type: 'LOG_SHEET_APPROVED',
      severity: 'SUCCESS',
      title: 'Log Sheet Disetujui',
      message: `${user.userName} menyetujui log sheet`,
      ...base,
      userId: row.approvedBy.id,
      userName: user.userName,
      userAvatarUrl: user.avatarUrl,
      createdAt: row.approvedAt,
      link: `/log-sheets/${row.id}`,
      metadata: { logSheetId: row.id, logSheetDate: row.date.toISOString() },
    };
  }

  private buildWorkReportActivity(row: any, base: any): IActivity | null {
    if (!row.createdAt || row.submittedAt || row.approvedAt) return null;

    return {
      id: `wr:${row.id}`,
      type: 'WORK_REPORT_SUBMITTED',
      severity: 'INFO',
      title: 'Work Report Dibuat',
      message:
        'Work report baru dibuat' + (row.zone ? ` untuk zona ${row.zone}` : ''),
      ...base,
      userId: 'system',
      userName: 'Sistem',
      userAvatarUrl: null,
      createdAt: row.createdAt,
      link: `/work-reports/${row.id}`,
      metadata: { workReportId: row.id, zone: row.zone, machineCount: 0 },
    };
  }

  private formatUser(user: any): {
    userName: string;
    avatarUrl: string | null;
  } {
    const isDeleted = user.deletedAt != null;
    return {
      userName: isDeleted
        ? 'Pengguna Terhapus'
        : `${user.firstName} ${user.lastName ?? ''}`.trim(),
      avatarUrl: isDeleted ? null : user.avatarUrl,
    };
  }
}

/**
 * Factory function for creating service instance
 * Uses default prisma client from lib/prisma
 */
export function createActivityService(
  repository: IActivityRepository,
  projectServices: IProjectAccessServices
): ActivityService {
  return new ActivityService(repository, projectServices);
}
