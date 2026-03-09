/**
 * @fileoverview DI Wiring for Attendance Feature
 * @module features/attendance/di
 */

import { AttendanceService } from './attendance-service';
import { prisma } from '@/lib/prisma';
import type { IAttendanceService } from '@/lib/di/interfaces';

/**
 * Factory: Create AttendanceService with dependencies
 */
export function createAttendanceService(): IAttendanceService {
  return new AttendanceService({ prisma });
}
