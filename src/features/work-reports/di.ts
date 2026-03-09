/**
 * @fileoverview DI Wiring for Work Report Feature
 * @module features/work-reports/di
 */

import { WorkReportService } from './work-report-service';
import { prisma } from '@/lib/prisma';
import type { IWorkReportService } from '@/lib/di/interfaces';

/**
 * Factory: Create WorkReportService with dependencies
 */
export function createWorkReportService(): IWorkReportService {
  return new WorkReportService({ prisma });
}
