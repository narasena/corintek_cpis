/**
 * @fileoverview Pagination utility functions for CG-02
 * @module lib/pagination-helpers
 * @responsibility Pure functions for pagination calculations
 */

import type { IPaginationParams, IPaginationMeta } from '@/types/pagination';

/**
 * Calculate database offset from page and limit
 * @responsibility Convert 1-based page to 0-based offset
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Calculate total pages from total items and limit
 * @responsibility Compute ceiling of total/limit
 */
export function calculateTotalPages(total: number, limit: number): number {
  return Math.ceil(total / limit);
}

/**
 * Clamp page number to valid range
 * @responsibility Ensure page is within [1, totalPages]
 */
export function clampPage(page: number, totalPages: number): number {
  if (page < 1) return 1;
  if (totalPages > 0 && page > totalPages) return totalPages;
  return page;
}

/**
 * Build pagination metadata from data
 * @responsibility Create metadata object for responses
 */
export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
): IPaginationMeta {
  const totalPages = calculateTotalPages(total, limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

import { InvalidPaginationError } from './errors';

/**
 * Validate pagination parameters
 * @responsibility Check if page/limit are within allowed bounds
 * @throws {InvalidPaginationError} If validation fails
 */
export function validatePaginationParams(params: IPaginationParams): void {
  if (params.page < 1) {
    throw new InvalidPaginationError('Page must be at least 1', 'page');
  }
  if (params.limit < 1 || params.limit > DEFAULT_PAGINATION.MAX_LIMIT) {
    throw new InvalidPaginationError(
      `Limit must be between 1 and ${DEFAULT_PAGINATION.MAX_LIMIT}`,
      'limit'
    );
  }
}

/**
 * Default pagination values
 * @responsibility Provide sensible defaults
 */
export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

/**
 * Common page size options for UI
 * @responsibility Standard page size choices
 */
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
