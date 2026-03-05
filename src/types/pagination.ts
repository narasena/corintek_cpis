/**
 * @fileoverview Core pagination types for CG-02 Server-Side Pagination
 * @module types/pagination
 */

/**
 * Request parameters for paginated queries
 * @responsibility Define contract for pagination requests
 */
export interface IPaginationParams {
  /** Page number (1-based) */
  readonly page: number;
  /** Number of items per page */
  readonly limit: number;
}

/**
 * Sort direction options
 * @responsibility Define valid sort directions
 */
export type TSortOrder = 'asc' | 'desc';

/**
 * Sort parameters for queries
 * @responsibility Define contract for sort requests
 */
export interface ISortParams {
  /** Column/property to sort by */
  readonly sortBy?: string;
  /** Sort direction */
  readonly sortOrder?: TSortOrder;
}

/**
 * Combined query params for list operations
 * @responsibility Merge pagination and sorting params
 */
export interface IListQueryParams extends IPaginationParams, ISortParams {}

/**
 * Paginated response wrapper
 * @responsibility Standardize paginated response shape
 * @template T - Type of data items
 */
export interface IPaginatedResponse<T> {
  /** Array of data items for current page */
  readonly data: readonly T[];
  /** Total count of all matching items */
  readonly total: number;
  /** Current page number */
  readonly page: number;
  /** Items per page */
  readonly limit: number;
  /** Total number of pages */
  readonly totalPages: number;
  /** Whether next page exists */
  readonly hasNextPage: boolean;
  /** Whether previous page exists */
  readonly hasPrevPage: boolean;
}

/**
 * Pagination metadata (without data)
 * @responsibility Lightweight pagination info for UI controls
 */
export interface IPaginationMeta {
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPrevPage: boolean;
}
