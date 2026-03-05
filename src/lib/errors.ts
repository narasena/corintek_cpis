/**
 * @fileoverview Custom error classes for CG-02 pagination
 * @module lib/errors
 * @responsibility Define pagination-specific error types
 */

/**
 * Base error for pagination-related failures
 * @responsibility Parent class for all pagination errors
 */
export abstract class PaginationError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = 'PaginationError';
    Object.setPrototypeOf(this, PaginationError.prototype);
  }
}

/**
 * Error thrown when pagination parameters are invalid
 */
export class InvalidPaginationError extends PaginationError {
  readonly code = 'INVALID_PAGINATION';
  constructor(
    message: string,
    public readonly field: 'page' | 'limit'
  ) {
    super(message);
    this.name = 'InvalidPaginationError';
    Object.setPrototypeOf(this, InvalidPaginationError.prototype);
  }
}

/**
 * Error thrown when requested page is out of bounds
 */
export class PageOutOfBoundsError extends PaginationError {
  readonly code = 'PAGE_OUT_OF_BOUNDS';
  constructor(
    message: string,
    public readonly requestedPage: number,
    public readonly totalPages: number
  ) {
    super(message);
    this.name = 'PageOutOfBoundsError';
    Object.setPrototypeOf(this, PageOutOfBoundsError.prototype);
  }
}

/**
 * Error thrown when sort column is invalid
 */
export class InvalidSortError extends PaginationError {
  readonly code = 'INVALID_SORT';
  constructor(
    message: string,
    public readonly sortBy: string
  ) {
    super(message);
    this.name = 'InvalidSortError';
    Object.setPrototypeOf(this, InvalidSortError.prototype);
  }
}

/**
 * Error thrown when user is not authorized
 */
export class AuthorizationError extends Error {
  readonly code = 'UNAUTHORIZED';
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'AuthorizationError';
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}
