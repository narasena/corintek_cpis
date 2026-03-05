/**
 * @fileoverview DI Barrel Export
 * @module lib/di/index
 * @responsibility Single entry point for all DI-related exports
 */

// Core DI
export { container } from './container';
export { DI_TOKENS } from './tokens';
export type { DIToken } from './tokens';
export { initializeContainer, resetContainer } from './composition-root';

// Interfaces (abstractions)
export type {
  IAttendanceService,
  ILogSheetService,
  IWorkReportService,
} from './interfaces';

// Service Provider (use this in actions/components)
export {
  getAttendanceService,
  getLogSheetService,
  getWorkReportService,
} from './service-provider';
