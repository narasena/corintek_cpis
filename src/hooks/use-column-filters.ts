'use client';

import { useState, useEffect, useCallback } from 'react';
import { ColumnFiltersState } from '@tanstack/react-table';
import { useSearchParams } from 'next/navigation';
import { IColumnFilterConfig } from '@/components/data-table';
import { deserializeFilters, serializeFilters } from '@/lib/filter-utils';

export function useColumnFilters<TData>({
  persistInUrl = false,
  urlParamName = 'filters',
  initialFilters = [],
}: {
  filterConfigs: IColumnFilterConfig<TData>[];
  persistInUrl?: boolean;
  urlParamName?: string;
  initialFilters?: ColumnFiltersState;
}) {
  const searchParams = useSearchParams();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() => {
    if (persistInUrl && typeof window !== 'undefined') {
      const urlFilters = searchParams.get(urlParamName);
      if (urlFilters) {
        try {
          return deserializeFilters(urlFilters);
        } catch {
          return initialFilters;
        }
      }
    }
    return initialFilters;
  });

  useEffect(() => {
    if (!persistInUrl || typeof window === 'undefined') return;

    const timeout = setTimeout(() => {
      try {
        const serialized = serializeFilters(columnFilters);
        const url = new URL(window.location.href);
        if (columnFilters.length > 0) {
          url.searchParams.set(urlParamName, serialized);
        } else {
          url.searchParams.delete(urlParamName);
        }
        window.history.replaceState({}, '', url.toString());
      } catch {
        // Silently fail - URL sync is best effort
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [columnFilters, persistInUrl, urlParamName]);

  const setFilterValue = useCallback(
    (columnId: string, value: unknown | undefined) => {
      setColumnFilters(prev => {
        if (value === undefined) {
          return prev.filter(f => f.id !== columnId);
        }
        return [
          ...prev.filter(f => f.id !== columnId),
          { id: columnId, value },
        ];
      });
    },
    []
  );

  const clearAllFilters = useCallback(() => {
    setColumnFilters([]);
  }, []);

  const isFilterActive = useCallback(
    (columnId: string) => {
      return columnFilters.some(f => f.id === columnId);
    },
    [columnFilters]
  );

  const getFilterValue = useCallback(
    (columnId: string) => {
      return columnFilters.find(f => f.id === columnId)?.value;
    },
    [columnFilters]
  );

  return {
    columnFilters,
    setColumnFilters,
    clearAllFilters,
    setFilterValue,
    isFilterActive,
    getFilterValue,
  };
}
