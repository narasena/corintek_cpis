/**
 * @fileoverview Composition Root - Application DI Wiring
 * @module lib/di/composition-root
 * @responsibility Wire all dependencies at application startup
 *
 * This is the ONLY place where concrete implementations are referenced.
 * All other modules depend only on interfaces (abstractions).
 */

import { container } from './container';
import { DI_TOKENS } from './tokens';
import { prisma } from '@/lib/prisma';
import { createAttendanceService } from '@/features/attendance/di';
import { createLogSheetService } from '@/features/log-sheets/di';
import { createWorkReportService } from '@/features/work-reports/di';

/**
 * Initialize DI container with all services
 * @responsibility Register all services with their lifetimes
 *
 * Call this once at application startup (in layout.tsx or middleware)
 *
 * Wiring Rules:
 * - Prisma: Singleton (one DB connection pool)
 * - Services: Singleton (stateless, can share)
 * - Use factories for complex dependency graphs
 */
export function initializeContainer(): void {
  // Already initialized check (Next.js HMR safety)
  if (container.isRegistered(DI_TOKENS.PRISMA)) {
    return;
  }

  // Infrastructure - Singleton
  container.registerInstance(DI_TOKENS.PRISMA, prisma);

  // Services - Singleton (thread-safe, stateless)
  container.registerSingleton(
    DI_TOKENS.ATTENDANCE_SERVICE,
    createAttendanceService
  );
  container.registerSingleton(
    DI_TOKENS.LOG_SHEET_SERVICE,
    createLogSheetService
  );
  container.registerSingleton(
    DI_TOKENS.WORK_REPORT_SERVICE,
    createWorkReportService
  );
}

/**
 * Reset container (for testing only)
 */
export function resetContainer(): void {
  // Internal map clear - not exported to prevent misuse
  // Implementation in container.ts if needed
}
