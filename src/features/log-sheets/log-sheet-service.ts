/**
 * @fileoverview Log Sheet Service for CG-02 with server-side pagination
 * @module features/log-sheets/log-sheet-service
 * @responsibility Log sheet business logic with pagination
 */

import { calculateOffset, buildPaginationMeta } from '@/lib/pagination-helpers';
import type { PrismaClient } from '@/generated/prisma/client';
import type { IJwtPayload } from '@/@types/auth.type';
import type { IPaginatedResponse, IListQueryParams } from '@/types/pagination';
import type { ILogSheet } from './types';
import type { ILogSheetService } from '@/lib/di/interfaces';

/**
 * Dependencies for LogSheetService
 * @responsibility Define service dependencies for injection
 */
export interface ILogSheetServiceDependencies {
  readonly prisma: PrismaClient;
}

/**
 * List item type for log sheets
 * @responsibility Define return shape for list queries
 */
export interface ILogSheetListItem {
  id: string;
  projectId: string;
  date: Date;
  notes: string | null;
  status: ILogSheet['status'];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Extended list item with project info for global queries
 * @responsibility Define shape for cross-project queries
 */
export interface IGlobalLogSheetListItem extends ILogSheetListItem {
  project: {
    name: string;
    client: {
      name: string;
    } | null;
  };
}

/**
 * Service: LogSheetService
 * @responsibility Handle log sheet CRUD with pagination support
 */
export class LogSheetService implements ILogSheetService {
  constructor(private readonly deps: ILogSheetServiceDependencies) {}

  async getLogSheetsByProject(
    projectId: string,
    pagination: IListQueryParams
  ): Promise<IPaginatedResponse<ILogSheetListItem>> {
    const offset = calculateOffset(pagination.page, pagination.limit);
    const [items, total] = await Promise.all([
      this.deps.prisma.logSheet.findMany({
        where: { projectId, deletedAt: null },
        select: {
          id: true,
          projectId: true,
          date: true,
          notes: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        take: pagination.limit,
        skip: offset,
      }),
      this.deps.prisma.logSheet.count({
        where: { projectId, deletedAt: null },
      }),
    ]);
    const mapped = items.map(ls => ({
      ...ls,
      status: ls.status as ILogSheet['status'],
    }));
    return {
      data: mapped,
      ...buildPaginationMeta(total, pagination.page, pagination.limit),
    };
  }

  async getAllLogSheets(
    actor: IJwtPayload,
    projectIds: string[] | undefined,
    pagination: IListQueryParams
  ): Promise<IPaginatedResponse<IGlobalLogSheetListItem>> {
    const offset = calculateOffset(pagination.page, pagination.limit);
    const where = {
      deletedAt: null,
      ...(projectIds ? { projectId: { in: projectIds } } : {}),
    };
    const [items, total] = await Promise.all([
      this.deps.prisma.logSheet.findMany({
        where,
        select: {
          id: true,
          projectId: true,
          date: true,
          notes: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          project: {
            select: { name: true, client: { select: { name: true } } },
          },
        },
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        take: pagination.limit,
        skip: offset,
      }),
      this.deps.prisma.logSheet.count({ where }),
    ]);
    const mapped = items.map(ls => ({
      ...ls,
      status: ls.status as ILogSheet['status'],
    }));
    return {
      data: mapped as IGlobalLogSheetListItem[],
      ...buildPaginationMeta(total, pagination.page, pagination.limit),
    };
  }

  async countLogSheetsByProject(projectId: string): Promise<number> {
    return this.deps.prisma.logSheet.count({
      where: { projectId, deletedAt: null },
    });
  }

  private async assertCanAccessProject(
    actor: IJwtPayload,
    projectId: string
  ): Promise<void> {
    // TODO: Implement RBAC check
  }

  private async canAccessAllProjects(
    actor: IJwtPayload,
    projectIds: string[]
  ): Promise<boolean> {
    // TODO: Implement RBAC check
    return true;
  }
}
