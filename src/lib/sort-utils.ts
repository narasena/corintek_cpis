/**
 * @fileoverview Sort utilities for database queries
 * @module lib/sort-utils
 * @responsibility Build Prisma orderBy clauses
 */

import { InvalidSortError } from './errors';

/**
 * Build Prisma orderBy from sort parameters
 * @responsibility Convert sort params to Prisma format
 */
export function buildOrderBy(
  sortBy: string | undefined,
  sortOrder: 'asc' | 'desc' | undefined,
  defaultSort: Record<string, 'asc' | 'desc'>
): Record<string, 'asc' | 'desc'>[] {
  if (!sortBy) return [defaultSort];
  return [{ [sortBy]: sortOrder || 'asc' }];
}

/**
 * Validate sort column against allowed columns
 * @responsibility Prevent SQL injection via sort
 * @throws {InvalidSortError} If column not allowed
 */
export function validateSortColumn(
  sortBy: string | undefined,
  allowedColumns: string[]
): void {
  if (!sortBy) return;

  if (!allowedColumns.includes(sortBy)) {
    throw new InvalidSortError(
      `Invalid sort column: ${sortBy}. Allowed: ${allowedColumns.join(', ')}`,
      sortBy
    );
  }
}
