/**
 * @fileoverview Unit tests for pagination-helpers
 * @module lib/pagination-helpers.test
 */

import { describe, it, expect } from 'vitest';
import {
  calculateOffset,
  calculateTotalPages,
  clampPage,
  buildPaginationMeta,
  validatePaginationParams,
  DEFAULT_PAGINATION,
} from './pagination-helpers';
import { InvalidPaginationError } from './errors';

describe('calculateOffset', () => {
  it('should calculate correct offset for page 1', () => {
    expect(calculateOffset(1, 10)).toBe(0);
  });

  it('should calculate correct offset for page 2', () => {
    expect(calculateOffset(2, 10)).toBe(10);
  });

  it('should calculate correct offset for page 5 with limit 25', () => {
    expect(calculateOffset(5, 25)).toBe(100);
  });

  it('should handle edge case: page 0 (should return -10, but used with validation)', () => {
    // This is an edge case that would be caught by validatePaginationParams
    expect(calculateOffset(0, 10)).toBe(-10);
  });
});

describe('calculateTotalPages', () => {
  it('should calculate exact pages', () => {
    expect(calculateTotalPages(100, 10)).toBe(10);
  });

  it('should round up for partial pages', () => {
    expect(calculateTotalPages(101, 10)).toBe(11);
  });

  it('should return 0 for empty total', () => {
    expect(calculateTotalPages(0, 10)).toBe(0);
  });

  it('should handle limit larger than total', () => {
    expect(calculateTotalPages(5, 10)).toBe(1);
  });

  it('should handle single item', () => {
    expect(calculateTotalPages(1, 10)).toBe(1);
  });
});

describe('clampPage', () => {
  it('should return page when within range', () => {
    expect(clampPage(5, 10)).toBe(5);
  });

  it('should clamp to 1 when page < 1', () => {
    expect(clampPage(0, 10)).toBe(1);
    expect(clampPage(-5, 10)).toBe(1);
  });

  it('should clamp to totalPages when page > totalPages', () => {
    expect(clampPage(15, 10)).toBe(10);
  });

  it('should handle totalPages = 0', () => {
    // Edge case: when totalPages is 0, page 1 stays as 1 (since 0 > 0 check fails)
    expect(clampPage(1, 0)).toBe(1);
  });

  it('should handle negative totalPages (edge case)', () => {
    expect(clampPage(5, -1)).toBe(5); // Returns page as-is when totalPages < 1
  });
});

describe('buildPaginationMeta', () => {
  it('should build correct meta for first page', () => {
    const meta = buildPaginationMeta(100, 1, 10);
    expect(meta).toEqual({
      total: 100,
      page: 1,
      limit: 10,
      totalPages: 10,
      hasNextPage: true,
      hasPrevPage: false,
    });
  });

  it('should build correct meta for last page', () => {
    const meta = buildPaginationMeta(100, 10, 10);
    expect(meta).toEqual({
      total: 100,
      page: 10,
      limit: 10,
      totalPages: 10,
      hasNextPage: false,
      hasPrevPage: true,
    });
  });

  it('should build correct meta for middle page', () => {
    const meta = buildPaginationMeta(100, 5, 10);
    expect(meta.hasNextPage).toBe(true);
    expect(meta.hasPrevPage).toBe(true);
  });

  it('should handle empty result set', () => {
    const meta = buildPaginationMeta(0, 1, 10);
    expect(meta.totalPages).toBe(0);
    expect(meta.hasNextPage).toBe(false);
    expect(meta.hasPrevPage).toBe(false);
  });

  it('should handle partial last page', () => {
    const meta = buildPaginationMeta(95, 10, 10);
    expect(meta.totalPages).toBe(10);
    expect(meta.hasNextPage).toBe(false);
  });
});

describe('validatePaginationParams', () => {
  it('should not throw for valid params', () => {
    expect(() =>
      validatePaginationParams({ page: 1, limit: 10 })
    ).not.toThrow();
    expect(() =>
      validatePaginationParams({ page: 100, limit: 100 })
    ).not.toThrow();
  });

  it('should throw InvalidPaginationError for page < 1', () => {
    expect(() => validatePaginationParams({ page: 0, limit: 10 })).toThrow(
      InvalidPaginationError
    );
    expect(() => validatePaginationParams({ page: 0, limit: 10 })).toThrow(
      'Page must be at least 1'
    );
  });

  it('should throw InvalidPaginationError for limit < 1', () => {
    expect(() => validatePaginationParams({ page: 1, limit: 0 })).toThrow(
      InvalidPaginationError
    );
    expect(() => validatePaginationParams({ page: 1, limit: 0 })).toThrow(
      'Limit must be between 1 and 100'
    );
  });

  it('should throw InvalidPaginationError for limit > 100', () => {
    expect(() => validatePaginationParams({ page: 1, limit: 101 })).toThrow(
      InvalidPaginationError
    );
    expect(() => validatePaginationParams({ page: 1, limit: 500 })).toThrow(
      'Limit must be between 1 and 100'
    );
  });

  it('should set correct error field', () => {
    try {
      validatePaginationParams({ page: 0, limit: 10 });
    } catch (e) {
      expect((e as InvalidPaginationError).field).toBe('page');
    }

    try {
      validatePaginationParams({ page: 1, limit: 0 });
    } catch (e) {
      expect((e as InvalidPaginationError).field).toBe('limit');
    }
  });

  it('should use DEFAULT_PAGINATION.MAX_LIMIT', () => {
    expect(DEFAULT_PAGINATION.MAX_LIMIT).toBe(100);
    expect(() =>
      validatePaginationParams({ page: 1, limit: 100 })
    ).not.toThrow();
  });
});
