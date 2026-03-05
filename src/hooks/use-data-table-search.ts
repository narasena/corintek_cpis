'use client';

import { useState, useCallback, useMemo } from 'react';
import { useDebouncedValue } from './use-debounced-value';
import { SearchFilterService } from '@/lib/search-filter-service';

/**
 * Search configuration for DataTable
 */
interface IUseDataTableSearchConfig<TData> {
  /** Source data array */
  data: TData[];
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Minimum query length before filtering */
  minQueryLength?: number;
  /** Column keys to include in search */
  searchKeys?: string[];
  /** Keys to exclude from search */
  excludedKeys?: string[];
}

/**
 * Hook return type
 */
interface IUseDataTableSearchReturn<TData> {
  /** Current search query */
  query: string;
  /** Set search query */
  setQuery: (query: string) => void;
  /** Clear search query */
  clearQuery: () => void;
  /** Debounced query value */
  debouncedQuery: string;
  /** Filtered data based on search */
  filteredData: TData[];
  /** Whether search is active (query has content) */
  isSearching: boolean;
  /** Whether search is pending (debouncing) */
  isPending: boolean;
  /** Result count information */
  resultInfo: {
    filtered: number;
    total: number;
  };
}

/**
 * Hook: useDataTableSearch
 * Responsibility: Manage DataTable search state and filtering
 *
 * @param config - Hook configuration
 * @returns Search state and filtered data
 */
export function useDataTableSearch<TData extends Record<string, unknown>>(
  config: IUseDataTableSearchConfig<TData>
): IUseDataTableSearchReturn<TData> {
  const {
    data,
    debounceMs = 300,
    minQueryLength = 1,
    searchKeys,
    // excludedKeys - reserved for future use
  } = config;

  const searchService = useMemo(
    () =>
      new SearchFilterService({
        defaultDebounceMs: debounceMs,
        defaultMinQueryLength: minQueryLength,
      }),
    [debounceMs, minQueryLength]
  );

  const [query, setQueryState] = useState<string>('');

  const { debouncedValue: debouncedQuery, isPending } = useDebouncedValue({
    value: query,
    delay: debounceMs,
  });

  const setQuery = useCallback((newQuery: string) => {
    if (typeof newQuery !== 'string') return;
    setQueryState(newQuery);
  }, []);

  const clearQuery = useCallback(() => {
    setQueryState('');
  }, []);

  const filteredData = useMemo(() => {
    const result = searchService.applyGlobalFilter(data, {
      query: debouncedQuery,
      columnKeys: searchKeys,
      minQueryLength,
    });
    return result.filteredData;
  }, [data, debouncedQuery, searchService, searchKeys, minQueryLength]);

  const isSearching = debouncedQuery.length >= minQueryLength;

  return {
    query,
    setQuery,
    clearQuery,
    debouncedQuery,
    filteredData,
    isSearching,
    isPending,
    resultInfo: {
      filtered: filteredData.length,
      total: data.length,
    },
  };
}
