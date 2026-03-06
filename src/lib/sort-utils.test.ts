/**
 * @fileoverview Unit tests for sort utilities
 * @module lib/sort-utils.test
 */

import { describe, it, expect, vi } from 'vitest';
import { buildOrderBy, validateSortColumn } from './sort-utils';
import { InvalidSortError } from './errors';

describe('buildOrderBy', () => {
  it('should build orderBy with provided sort params', () => {
    const result = buildOrderBy('name', 'asc', { id: 'desc' });
    expect(result).toEqual([{ name: 'asc' }]);
  });

  it('should use default sort when sortBy not provided', () => {
    const result = buildOrderBy(undefined, undefined, { createdAt: 'desc' });
    expect(result).toEqual([{ createdAt: 'desc' }]);
  });

  it('should default sortOrder to asc when not provided', () => {
    const result = buildOrderBy('name', undefined, { id: 'desc' });
    expect(result).toEqual([{ name: 'asc' }]);
  });

  it('should handle desc order', () => {
    const result = buildOrderBy('date', 'desc', { id: 'asc' });
    expect(result).toEqual([{ date: 'desc' }]);
  });
});

describe('validateSortColumn', () => {
  it('should not throw for allowed column', () => {
    expect(() =>
      validateSortColumn('name', ['name', 'date', 'status'])
    ).not.toThrow();
  });

  it('should not throw when sortBy is undefined', () => {
    expect(() => validateSortColumn(undefined, ['name', 'date'])).not.toThrow();
  });

  it('should throw InvalidSortError for disallowed column', () => {
    expect(() => validateSortColumn('hacked_column', ['name', 'date'])).toThrow(
      InvalidSortError
    );
  });

  it('should include allowed columns in error message', () => {
    try {
      validateSortColumn('invalid', ['name', 'date']);
    } catch (e) {
      expect((e as InvalidSortError).message).toContain('name, date');
      expect((e as InvalidSortError).sortBy).toBe('invalid');
    }
  });

  it('should throw for SQL injection attempt', () => {
    expect(() =>
      validateSortColumn('name; DROP TABLE users;', ['name', 'date'])
    ).toThrow(InvalidSortError);
  });
});
