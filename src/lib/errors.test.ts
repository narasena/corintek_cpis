/**
 * @fileoverview Unit tests for error classes
 * @module lib/errors.test
 */

import { describe, it, expect } from 'vitest';
import {
  PaginationError,
  InvalidPaginationError,
  PageOutOfBoundsError,
  InvalidSortError,
  AuthorizationError,
} from './errors';

describe('InvalidPaginationError', () => {
  it('should create error with correct properties', () => {
    const error = new InvalidPaginationError('Page too low', 'page');
    expect(error.message).toBe('Page too low');
    expect(error.field).toBe('page');
    expect(error.code).toBe('INVALID_PAGINATION');
    expect(error.name).toBe('InvalidPaginationError');
  });

  it('should be instanceof PaginationError', () => {
    const error = new InvalidPaginationError('Test', 'limit');
    expect(error).toBeInstanceOf(PaginationError);
    expect(error).toBeInstanceOf(Error);
  });

  it('should capture stack trace', () => {
    const error = new InvalidPaginationError('Test', 'page');
    expect(error.stack).toBeDefined();
  });
});

describe('PageOutOfBoundsError', () => {
  it('should create error with correct properties', () => {
    const error = new PageOutOfBoundsError('Page too high', 99, 10);
    expect(error.message).toBe('Page too high');
    expect(error.requestedPage).toBe(99);
    expect(error.totalPages).toBe(10);
    expect(error.code).toBe('PAGE_OUT_OF_BOUNDS');
  });

  it('should be instanceof PaginationError', () => {
    const error = new PageOutOfBoundsError('Test', 5, 5);
    expect(error).toBeInstanceOf(PaginationError);
  });
});

describe('InvalidSortError', () => {
  it('should create error with correct properties', () => {
    const error = new InvalidSortError('Invalid column', 'hacked');
    expect(error.message).toBe('Invalid column');
    expect(error.sortBy).toBe('hacked');
    expect(error.code).toBe('INVALID_SORT');
  });
});

describe('AuthorizationError', () => {
  it('should create error with default message', () => {
    const error = new AuthorizationError();
    expect(error.message).toBe('Unauthorized');
    expect(error.code).toBe('UNAUTHORIZED');
  });

  it('should create error with custom message', () => {
    const error = new AuthorizationError('Access denied');
    expect(error.message).toBe('Access denied');
  });

  it('should be instanceof Error', () => {
    const error = new AuthorizationError();
    expect(error).toBeInstanceOf(Error);
  });
});
