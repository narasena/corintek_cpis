/**
 * @fileoverview Service provider hooks for components/actions
 * @module lib/di/service-provider
 * @responsibility Clean interface to resolve services from container
 */

import { container } from './container';
import { DI_TOKENS } from './tokens';
import type {
  IAttendanceService,
  ILogSheetService,
  IWorkReportService,
} from './interfaces';

/**
 * Resolve AttendanceService from container
 * @responsibility Abstract service resolution
 */
export function getAttendanceService(): IAttendanceService {
  return container.resolve<IAttendanceService>(DI_TOKENS.ATTENDANCE_SERVICE);
}

/**
 * Resolve LogSheetService from container
 * @responsibility Abstract service resolution
 */
export function getLogSheetService(): ILogSheetService {
  return container.resolve<ILogSheetService>(DI_TOKENS.LOG_SHEET_SERVICE);
}

/**
 * Resolve WorkReportService from container
 * @responsibility Abstract service resolution
 */
export function getWorkReportService(): IWorkReportService {
  return container.resolve<IWorkReportService>(DI_TOKENS.WORK_REPORT_SERVICE);
}
