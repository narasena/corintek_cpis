'use client';

/**
 * @fileoverview Server-side pagination state hook for CG-02
 * @module hooks/use-server-pagination
 * @responsibility Manage pagination state with URL sync
 */

import { useState, useCallback, useMemo } from 'react';
import type { IPaginationParams, IPaginationMeta } from '@/types/pagination';
import { DEFAULT_PAGINATION } from '@/lib/pagination-helpers';

/**
 * Configuration for useServerPagination hook
 * @responsibility Define hook initialization options
 */
export interface IUseServerPaginationConfig {
  /** Initial page number (default: 1) */
  readonly initialPage?: number;
  /** Initial page size (default: 10) */
  readonly initialLimit?: number;
  /** Total items (from server) */
  readonly total?: number;
  /** Enable URL query param sync */
  readonly enableUrlSync?: boolean;
  /** URL param names */
  readonly urlParamNames?: {
    readonly page: string;
    readonly limit: string;
  };
}

/**
 * Return type for useServerPagination hook
 * @responsibility Provide pagination state and controls
 */
export interface IUseServerPaginationReturn {
  /** Current page number */
  readonly page: number;
  /** Current page size */
  readonly limit: number;
  /** Total items (passed from server) */
  readonly total: number;
  /** Total pages calculated from total/limit */
  readonly totalPages: number;
  /** Whether next page is available */
  readonly hasNextPage: boolean;
  /** Whether previous page is available */
  readonly hasPrevPage: boolean;
  /** Set page number (clamped to valid range) */
  readonly setPage: (page: number) => void;
  /** Set page size (resets to page 1) */
  readonly setLimit: (limit: number) => void;
  /** Go to next page if available */
  readonly nextPage: () => void;
  /** Go to previous page if available */
  readonly prevPage: () => void;
  /** Go to first page */
  readonly firstPage: () => void;
  /** Go to last page */
  readonly lastPage: () => void;
  /** Reset to initial state */
  readonly reset: () => void;
  /** Update total from server response */
  readonly setTotal: (total: number) => void;
}

/**
 * Hook: useServerPagination
 * @responsibility Manage client-side pagination state synced with server
 */
export function useServerPagination(
  config: IUseServerPaginationConfig = {}
): IUseServerPaginationReturn {
  const {
    initialPage = DEFAULT_PAGINATION.PAGE,
    initialLimit = DEFAULT_PAGINATION.LIMIT,
    total: initialTotal = 0,
  } = config;

  const [page, setPageState] = useState(initialPage);
  const [limit, setLimitState] = useState(initialLimit);
  const [total, setTotalState] = useState(initialTotal);

  const totalPages = useMemo(
    () => Math.ceil(total / limit) || 1,
    [total, limit]
  );
  const hasNextPage = useMemo(() => page < totalPages, [page, totalPages]);
  const hasPrevPage = useMemo(() => page > 1, [page]);

  const setPage = useCallback(
    (newPage: number) => {
      setPageState(Math.max(1, Math.min(newPage, totalPages || 1)));
    },
    [totalPages]
  );

  const setLimit = useCallback((newLimit: number) => {
    setLimitState(
      Math.max(1, Math.min(newLimit, DEFAULT_PAGINATION.MAX_LIMIT))
    );
    setPageState(1);
  }, []);

  const nextPage = useCallback(() => {
    if (hasNextPage) setPageState(p => p + 1);
  }, [hasNextPage]);

  const prevPage = useCallback(() => {
    if (hasPrevPage) setPageState(p => p - 1);
  }, [hasPrevPage]);

  const firstPage = useCallback(() => setPageState(1), []);
  const lastPage = useCallback(() => setPageState(totalPages), [totalPages]);
  const reset = useCallback(() => {
    setPageState(initialPage);
    setLimitState(initialLimit);
  }, [initialPage, initialLimit]);
  const setTotal = useCallback((newTotal: number) => {
    setTotalState(Math.max(0, newTotal));
  }, []);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    setPage,
    setLimit,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    reset,
    setTotal,
  };
}
