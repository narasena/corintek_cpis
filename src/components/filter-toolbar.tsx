'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { FilterSelect } from './filter-controls';
import type { IColumnFilterConfig } from '@/components/data-table';

interface IFilterToolbarProps<TData> {
  filterConfigs: IColumnFilterConfig<TData>[];
  columnFilters: { id: string; value: unknown }[];
  onColumnFiltersChange: (filters: { id: string; value: unknown }[]) => void;
  onClearAll: () => void;
  className?: string;
}

export function FilterToolbar<TData>({
  filterConfigs,
  columnFilters,
  onColumnFiltersChange,
  onClearAll,
  className = '',
}: IFilterToolbarProps<TData>) {
  const handleChange = useCallback(
    (columnId: string, value: unknown | undefined) => {
      if (value === undefined) {
        onColumnFiltersChange(columnFilters.filter(f => f.id !== columnId));
      } else {
        onColumnFiltersChange([
          ...columnFilters.filter(f => f.id !== columnId),
          { id: columnId, value },
        ]);
      }
    },
    [columnFilters, onColumnFiltersChange]
  );

  return (
    <div
      className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 ${className}`}
    >
      {filterConfigs.map(config => {
        const activeFilter = columnFilters.find(f => f.id === config.columnId);
        return (
          <div key={config.columnId} className="w-full sm:w-auto">
            {config.type === 'select' && (
              <FilterSelect<TData>
                config={config}
                value={activeFilter?.value as string | undefined}
                onChange={value => handleChange(config.columnId, value)}
                onClear={() => handleChange(config.columnId, undefined)}
              />
            )}
          </div>
        );
      })}
      {columnFilters.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="ml-auto sm:ml-0"
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          Hapus Semua
        </Button>
      )}
    </div>
  );
}
