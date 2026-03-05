/**
 * @fileoverview Service interfaces for DI abstraction
 * @module lib/di/interfaces
 * @responsibility Define contracts for all services
 */

import type { IPaginatedResponse, IListQueryParams } from '@/types/pagination';
import type { IJwtPayload } from '@/@types/auth.type';
import type { TAttendanceListFilters } from '@/features/attendance/types';
import type { TAttendanceAdminRow } from '@/features/attendance/attendance-service';
import type {
  ILogSheetListItem,
  IGlobalLogSheetListItem,
} from '@/features/log-sheets/log-sheet-service';
import type { IWorkReportListItem } from '@/features/work-reports/work-report-service';

/**
 * Interface for Attendance Service
 * @responsibility Contract for attendance operations
 */
export interface IAttendanceService {
  listAttendance(
    actor: IJwtPayload,
    filters: TAttendanceListFilters,
    pagination: IListQueryParams
  ): Promise<IPaginatedResponse<TAttendanceAdminRow>>;

  countAttendance(filters: TAttendanceListFilters): Promise<number>;
}

/**
 * Interface for Log Sheet Service
 * @responsibility Contract for log sheet operations
 */
export interface ILogSheetService {
  getLogSheetsByProject(
    projectId: string,
    pagination: IListQueryParams
  ): Promise<IPaginatedResponse<ILogSheetListItem>>;

  getAllLogSheets(
    actor: IJwtPayload,
    projectIds: string[] | undefined,
    pagination: IListQueryParams
  ): Promise<IPaginatedResponse<IGlobalLogSheetListItem>>;

  countLogSheetsByProject(projectId: string): Promise<number>;
}

/**
 * Interface for Work Report Service
 * @responsibility Contract for work report operations
 */
export interface IWorkReportService {
  getWorkReportsByProject(
    projectId: string,
    pagination: IListQueryParams
  ): Promise<IPaginatedResponse<IWorkReportListItem>>;

  countWorkReportsByProject(projectId: string): Promise<number>;
}
