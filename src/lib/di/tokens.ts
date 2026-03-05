/**
 * @fileoverview Service token identifiers for DI container
 * @module lib/di/tokens
 * @responsibility Define unique tokens for service registration
 */

/**
 * Service tokens for type-safe DI registration
 * Uses Symbol to ensure uniqueness
 */
export const DI_TOKENS = {
  PRISMA: Symbol('prisma'),
  ATTENDANCE_SERVICE: Symbol('attendanceService'),
  LOG_SHEET_SERVICE: Symbol('logSheetService'),
  WORK_REPORT_SERVICE: Symbol('workReportService'),
} as const;

/**
 * Type-safe token type
 */
export type DIToken = (typeof DI_TOKENS)[keyof typeof DI_TOKENS];
