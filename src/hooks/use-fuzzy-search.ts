'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDebouncedValue } from './use-debounced-value';
import { SearchFilterService } from '@/lib/search-filter-service';

/**
 * Fuzzy search configuration
 */
interface IUseFuzzySearchConfig<TData> {
  /** Source data array */
  data: TData[];
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Maximum edit distance for fuzzy matching */
  tolerance?: number;
  /** Column keys to search */
  searchKeys?: string[];
  /** Minimum query length */
  minQueryLength?: number;
  /** Maximum number of results */
  maxResults?: number;
}

/**
 * Fuzzy search result item
 */
interface IFuzzySearchResult<TData> {
  /** Original data item */
  item: TData;
  /** Best matching field value */
  matchedValue: string;
  /** Edit distance (0 = exact match) */
  distance: number;
}

/**
 * Hook return type
 */
interface IUseFuzzySearchReturn<TData> {
  /** Current search query */
  query: string;
  /** Set search query */
  setQuery: (query: string) => void;
  /** Clear search query */
  clearQuery: () => void;
  /** Filtered and ranked results */
  results: IFuzzySearchResult<TData>[];
  /** Whether search is active */
  isSearching: boolean;
  /** Whether fuzzy calculation is pending */
  isPending: boolean;
}

/**
 * Hook: useFuzzySearch
 * Responsibility: Debounced fuzzy search with tolerance-based matching
 * Pattern: Hook wrapping SearchFilterService with caching
 */
export function useFuzzySearch<TData extends Record<string, unknown>>(
  config: IUseFuzzySearchConfig<TData>
): IUseFuzzySearchReturn<TData> {
  const {
    data,
    debounceMs = 150,
    tolerance = 2,
    searchKeys,
    minQueryLength = 2,
    maxResults = 50,
  } = config;

  const [query, setQueryState] = useState<string>('');

  const { debouncedValue: debouncedQuery, isPending } = useDebouncedValue({
    value: query,
    delay: debounceMs,
  });

  const searchService = useMemo(() => new SearchFilterService({}), []);

  const setQuery = useCallback((newQuery: string) => {
    if (typeof newQuery !== 'string') return;
    setQueryState(newQuery);
  }, []);

  const clearQuery = useCallback(() => {
    setQueryState('');
  }, []);

  const results = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < minQueryLength) {
      return [];
    }

    const matches: IFuzzySearchResult<TData>[] = [];

    for (const item of data) {
      const values = searchService.extractSearchableValues(item, searchKeys);
      let bestDistance = Infinity;
      let bestValue = '';

      for (const value of values) {
        const strValue = String(value).toLowerCase();
        const normalizedQuery = debouncedQuery.toLowerCase();

        // Exact match
        if (strValue === normalizedQuery) {
          bestDistance = 0;
          bestValue = String(value);
          break;
        }

        // Substring match
        if (strValue.includes(normalizedQuery)) {
          bestDistance = 0;
          bestValue = String(value);
          break;
        }

        // Fuzzy match using fuzzyMatch to leverage caching
        if (searchService.fuzzyMatch(strValue, normalizedQuery, tolerance)) {
          // Calculate approximate distance for ranking
          const lenDiff = Math.abs(strValue.length - normalizedQuery.length);
          if (lenDiff < bestDistance) {
            bestDistance = lenDiff;
            bestValue = String(value);
          }
        }
      }

      if (bestDistance <= tolerance) {
        matches.push({
          item,
          matchedValue: bestValue,
          distance: bestDistance,
        });
      }
    }

    return matches.sort((a, b) => a.distance - b.distance).slice(0, maxResults);
  }, [
    data,
    debouncedQuery,
    tolerance,
    searchKeys,
    minQueryLength,
    maxResults,
    searchService,
  ]);

  const isSearching = debouncedQuery.length >= minQueryLength;

  return {
    query,
    setQuery,
    clearQuery,
    results,
    isSearching,
    isPending,
  };
}
