/**
 * @fileoverview CG-02 Server-Side Pagination - Public API Exports
 * @module features/pagination
 * @responsibility Central export for pagination-related modules
 */

// Core Types
export type {
  IPaginationParams,
  IPaginatedResponse,
  IPaginationMeta,
  IListQueryParams,
  TSortOrder,
  ISortParams,
} from '@/types/pagination';

// Utilities
export {
  calculateOffset,
  calculateTotalPages,
  clampPage,
  buildPaginationMeta,
  validatePaginationParams,
  DEFAULT_PAGINATION,
  PAGE_SIZE_OPTIONS,
} from '@/lib/pagination-helpers';

// Hooks
export {
  useServerPagination,
  type IUseServerPaginationConfig,
  type IUseServerPaginationReturn,
} from '@/hooks/use-server-pagination';

export {
  usePaginatedData,
  type IUsePaginatedDataConfig,
  type IUsePaginatedDataReturn,
} from '@/hooks/use-paginated-data';

// Errors
export {
  PaginationError,
  InvalidPaginationError,
  PageOutOfBoundsError,
  InvalidSortError,
} from '@/lib/errors';

// Component Types
export type { IServerPaginationConfig } from '@/components/data-table';
