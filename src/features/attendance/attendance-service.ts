/**
 * @fileoverview Attendance Service for CG-02 with server-side pagination
 * @module features/attendance/attendance-service
 * @responsibility Attendance business logic with pagination, caching, observability
 */

import { AuthorizationError } from '@/lib/errors';
import { calculateOffset, buildPaginationMeta } from '@/lib/pagination-helpers';
import { EnhancedCountCache } from '@/lib/enhanced-count-cache';
import { withRetry } from '@/lib/retry';
import {
  LogLevel,
  logPagination,
  logPaginationError,
} from '@/lib/observability';
import type { PrismaClient } from '@/generated/prisma/client';
import type { IJwtPayload } from '@/@types/auth.type';
import type { IPaginatedResponse, IListQueryParams } from '@/types/pagination';
import type { TAttendanceListFilters } from './types';
import type { IAttendanceService } from '@/lib/di/interfaces';

/**
 * Dependencies for AttendanceService
 */
export interface IAttendanceServiceDependencies {
  readonly prisma: PrismaClient;
}

/**
 * Row type for attendance admin list
 * @responsibility Define return shape for list queries
 */
export interface TAttendanceAdminRow {
  id: string;
  userId: string;
  dateLocal: string;
  clockInAt: Date;
  clockOutAt: Date | null;
  clockInPhotoUrl: string | null;
  clockOutPhotoUrl: string | null;
  totalHours: number | null;
  status: string;
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string;
  };
}

/**
 * Service: AttendanceService
 * @responsibility Handle attendance CRUD with pagination support
 */
export class AttendanceService implements IAttendanceService {
  private countCache = new EnhancedCountCache<number>({
    ttlMs: 5000,
    maxSize: 100,
  });

  constructor(private readonly deps: IAttendanceServiceDependencies) {}

  async listAttendance(
    actor: IJwtPayload,
    filters: TAttendanceListFilters,
    pagination: IListQueryParams
  ): Promise<IPaginatedResponse<TAttendanceAdminRow>> {
    const start = Date.now();
    try {
      this.ensureAdminOrSupervisor(actor);
      const offset = calculateOffset(pagination.page, pagination.limit);
      const where = this.buildWhereClause(filters);

      const [items, total] = await Promise.all([
        withRetry(() =>
          this.deps.prisma.attendance.findMany({
            where,
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
            orderBy: [{ dateLocal: 'desc' }, { clockInAt: 'desc' }],
            take: pagination.limit,
            skip: offset,
          })
        ),
        this.getCachedCount(filters, where),
      ]);

      logPagination(
        LogLevel.INFO,
        'AttendanceService',
        'listAttendance',
        start,
        {
          total,
          page: pagination.page,
          limit: pagination.limit,
        }
      );

      return {
        data: items as TAttendanceAdminRow[],
        ...buildPaginationMeta(total, pagination.page, pagination.limit),
      };
    } catch (error) {
      logPaginationError(
        'AttendanceService',
        'listAttendance',
        start,
        error as Error
      );
      throw error;
    }
  }

  private buildWhereClause(filters: TAttendanceListFilters) {
    return {
      deletedAt: null,
      dateLocal: { gte: filters.dateFrom, lte: filters.dateTo },
      ...(filters.userId ? { userId: filters.userId } : {}),
    };
  }

  private getCacheKey(filters: TAttendanceListFilters): string {
    return JSON.stringify(filters);
  }

  private getCachedCount(
    filters: TAttendanceListFilters,
    where: object
  ): Promise<number> {
    return this.countCache.getOrCompute(this.getCacheKey(filters), () =>
      withRetry(() => this.deps.prisma.attendance.count({ where }))
    );
  }

  async countAttendance(filters: TAttendanceListFilters): Promise<number> {
    return this.countCache.getOrCompute(this.getCacheKey(filters), () =>
      withRetry(() =>
        this.deps.prisma.attendance.count({
          where: this.buildWhereClause(filters),
        })
      )
    );
  }

  private ensureAdminOrSupervisor(actor: IJwtPayload): void {
    if (actor.role !== 'ADMIN' && actor.role !== 'SUPERVISOR') {
      throw new AuthorizationError(
        'Only ADMIN or SUPERVISOR can access attendance data'
      );
    }
  }
}
