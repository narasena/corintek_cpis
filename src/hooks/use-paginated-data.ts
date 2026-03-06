'use client';

/**
 * @fileoverview Combined pagination and data fetching hook for CG-02
 * @module hooks/use-paginated-data
 * @responsibility Manage paginated data fetching with state
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  IPaginationParams,
  IPaginatedResponse,
  IListQueryParams,
} from '@/types/pagination';
import {
  useServerPagination,
  type IUseServerPaginationConfig,
} from './use-server-pagination';

/**
 * Configuration for usePaginatedData hook
 * @responsibility Define fetch behavior and initial state
 * @template T - Data item type
 * @template F - Filter type
 */
export interface IUsePaginatedDataConfig<T, F> {
  /** Async fetch function returning paginated response */
  readonly fetchFn: (
    filters: F,
    pagination: IPaginationParams
  ) => Promise<IPaginatedResponse<T>>;
  /** Initial filter values */
  readonly initialFilters: F;
  /** Pagination configuration */
  readonly paginationConfig?: IUseServerPaginationConfig;
  /** Auto-fetch on mount */
  readonly autoFetch?: boolean;
  /** Debounce delay for filter changes (ms) */
  readonly filterDebounceMs?: number;
}

/**
 * Return type for usePaginatedData hook
 * @responsibility Provide data, loading state, and controls
 * @template T - Data item type
 * @template F - Filter type
 */
export interface IUsePaginatedDataReturn<T, F> {
  /** Current data items */
  readonly data: readonly T[];
  /** Whether data is loading */
  readonly isLoading: boolean;
  /** Error if fetch failed */
  readonly error: Error | null;
  /** Current filters */
  readonly filters: F;
  /** Update filters (triggers refetch, resets to page 1) */
  readonly setFilters: (filters: F) => void;
  /** Refresh current page */
  readonly refresh: () => Promise<void>;
  /** Pagination state and controls */
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly totalPages: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
    readonly setPage: (page: number) => void;
    readonly setLimit: (limit: number) => void;
    readonly nextPage: () => void;
    readonly prevPage: () => void;
  };
}

/**
 * Hook: usePaginatedData
 * @responsibility Combine data fetching with pagination state management
 */
export function usePaginatedData<T, F>(
  config: IUsePaginatedDataConfig<T, F>
): IUsePaginatedDataReturn<T, F> {
  const {
    fetchFn,
    initialFilters,
    paginationConfig,
    autoFetch = true,
  } = config;
  const [data, setData] = useState<readonly T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFiltersState] = useState<F>(initialFilters);
  const pagination = useServerPagination(paginationConfig);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const cancelPending = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const fetchData = useCallback(async () => {
    cancelPending();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    if (!isMountedRef.current) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchFn(filters, {
        page: pagination.page,
        limit: pagination.limit,
      });
      if (isMountedRef.current && !controller.signal.aborted) {
        setData(response.data);
        pagination.setTotal(response.total);
      }
    } catch (err) {
      if (isMountedRef.current && !controller.signal.aborted) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      if (isMountedRef.current && !controller.signal.aborted)
        setIsLoading(false);
    }
  }, [fetchFn, filters, pagination.page, pagination.limit]);

  const setFilters = useCallback(
    (newFilters: F) => {
      cancelPending();
      setFiltersState(newFilters);
      pagination.setPage(1);
    },
    [pagination]
  );

  const refresh = useCallback(() => fetchData(), [fetchData]);

  useEffect(() => {
    isMountedRef.current = true;
    if (autoFetch) fetchData();
    return () => {
      isMountedRef.current = false;
      cancelPending();
    };
  }, [fetchData, autoFetch]);

  return {
    data,
    isLoading,
    error,
    filters,
    setFilters,
    refresh,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: pagination.totalPages,
      hasNextPage: pagination.hasNextPage,
      hasPrevPage: pagination.hasPrevPage,
      setPage: pagination.setPage,
      setLimit: pagination.setLimit,
      nextPage: pagination.nextPage,
      prevPage: pagination.prevPage,
    },
  };
}
