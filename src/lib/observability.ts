/**
 * @fileoverview Observability helpers for pagination operations
 * @module lib/observability
 * @responsibility Structured logging and metrics for pagination
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface ILogEntry {
  level: string;
  service: string;
  method: string;
  duration: number;
  total?: number;
  page?: number;
  limit?: number;
  error?: string;
}

interface IPaginationMeta {
  total?: number;
  page?: number;
  limit?: number;
}

const CURRENT_LOG_LEVEL = LogLevel.INFO;

/**
 * Log pagination operation with level
 * @responsibility Structured logging with configurable levels
 */
export function logPagination(
  level: LogLevel,
  service: string,
  method: string,
  startTime: number,
  meta?: IPaginationMeta & { error?: string }
): void {
  if (level < CURRENT_LOG_LEVEL) return;

  const entry: ILogEntry = {
    level: LogLevel[level],
    service,
    method,
    duration: Date.now() - startTime,
    ...meta,
  };

  const output = level >= LogLevel.ERROR ? console.error : console.log;
  output('[PAGINATION]', JSON.stringify(entry));
}

/**
 * Log pagination error
 * @responsibility Error logging with context
 */
export function logPaginationError(
  service: string,
  method: string,
  startTime: number,
  error: Error
): void {
  logPagination(LogLevel.ERROR, service, method, startTime, {
    error: error.message,
  });
}
