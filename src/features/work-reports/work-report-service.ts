/**
 * @fileoverview Work Report Service for CG-02 with server-side pagination
 * @module features/work-reports/work-report-service
 * @responsibility Work report business logic with pagination
 */

import { calculateOffset, buildPaginationMeta } from '@/lib/pagination-helpers';
import type { PrismaClient } from '@/generated/prisma/client';
import type { IJwtPayload } from '@/@types/auth.type';
import type { IPaginatedResponse, IListQueryParams } from '@/types/pagination';
import type { IWorkReportService } from '@/lib/di/interfaces';

/**
 * Dependencies for WorkReportService
 * @responsibility Define service dependencies for injection
 */
export interface IWorkReportServiceDependencies {
  readonly prisma: PrismaClient;
}

/**
 * List item type for work reports
 * @responsibility Define return shape for list queries
 */
export interface IWorkReportListItem {
  id: string;
  projectId: string;
  date: Date;
  description: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  machines: {
    id: string;
    name: string;
  }[];
  photoCount: number;
}

/**
 * Service: WorkReportService
 * @responsibility Handle work report CRUD with pagination support
 */
export class WorkReportService implements IWorkReportService {
  constructor(private readonly deps: IWorkReportServiceDependencies) {}

  async getWorkReportsByProject(
    projectId: string,
    pagination: IListQueryParams
  ): Promise<IPaginatedResponse<IWorkReportListItem>> {
    const offset = calculateOffset(pagination.page, pagination.limit);
    const [items, total] = await Promise.all([
      this.deps.prisma.workReport.findMany({
        where: { projectId, deletedAt: null },
        include: { machines: true, photos: { where: { deletedAt: null } } },
        orderBy: { date: 'desc' },
        take: pagination.limit,
        skip: offset,
      }),
      this.deps.prisma.workReport.count({
        where: { projectId, deletedAt: null },
      }),
    ]);

    const mapped = items.map(wr => ({
      ...wr,
      photoCount: wr.photos.length,
      description: (wr as any).workDone,
    }));
    return {
      data: mapped as unknown as IWorkReportListItem[],
      ...buildPaginationMeta(total, pagination.page, pagination.limit),
    };
  }

  /**
   * Count work reports for a project
   * @param projectId - UUID of the project
   * @returns Total count of work reports
   * @pre projectId is valid
   * @post Returns >= 0
   */
  async countWorkReportsByProject(projectId: string): Promise<number> {
    return this.deps.prisma.workReport.count({
      where: { projectId, deletedAt: null },
    });
  }

  private async assertCanAccessProject(
    actor: IJwtPayload,
    projectId: string
  ): Promise<void> {
    // TODO: Implement RBAC check
  }
}
