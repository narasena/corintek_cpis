/**
 * @fileoverview Service factories for clean instantiation
 * @module lib/di/factories
 * @responsibility Create services with their dependencies
 */

import { prisma } from '@/lib/prisma';
import { AttendanceService } from '@/features/attendance/attendance-service';
import { LogSheetService } from '@/features/log-sheets/log-sheet-service';
import { WorkReportService } from '@/features/work-reports/work-report-service';
import type {
  IAttendanceService,
  ILogSheetService,
  IWorkReportService,
} from './interfaces';

/**
 * Factory: Create AttendanceService with dependencies
 * @responsibility Wire AttendanceService dependencies
 */
export function createAttendanceService(): IAttendanceService {
  return new AttendanceService({ prisma });
}

/**
 * Factory: Create LogSheetService with dependencies
 * @responsibility Wire LogSheetService dependencies
 */
export function createLogSheetService(): ILogSheetService {
  return new LogSheetService({ prisma });
}

/**
 * Factory: Create WorkReportService with dependencies
 * @responsibility Wire WorkReportService dependencies
 */
export function createWorkReportService(): IWorkReportService {
  return new WorkReportService({ prisma });
}
