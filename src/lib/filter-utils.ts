/**
 * filter-utils.ts
 * Responsibility: Pure utility functions for column filtering
 */

import { ColumnFiltersState } from '@tanstack/react-table';
import { FilterFn } from '@tanstack/react-table';
import { format } from 'date-fns';

export const filterFns: Record<string, FilterFn<unknown>> = {
  equalsString: (row, id, filterValue) => {
    const rowValue = row.getValue(id);
    return String(rowValue ?? '') === String(filterValue);
  },

  equalsDate: (row, id, filterValue) => {
    const rowValue = row.getValue(id) as string | Date | null | undefined;
    if (!rowValue) return false;
    const dateStr =
      rowValue instanceof Date
        ? format(rowValue, 'yyyy-MM-dd')
        : String(rowValue);
    return dateStr === filterValue;
  },

  dateBetween: (row, id, filterValue) => {
    const [start, end] = filterValue as [Date | null, Date | null];
    const rowValue = row.getValue(id) as string | Date | null | undefined;
    if (!rowValue) return false;
    const date = rowValue instanceof Date ? rowValue : new Date(rowValue);
    if (start && date < start) return false;
    if (end && date > end) return false;
    return true;
  },
};

export function serializeFilters(filters: ColumnFiltersState): string {
  try {
    return encodeURIComponent(JSON.stringify(filters));
  } catch {
    return '';
  }
}

export function deserializeFilters(encoded: string): ColumnFiltersState {
  try {
    const parsed = JSON.parse(decodeURIComponent(encoded));
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (f): f is { id: string; value: unknown } => typeof f?.id === 'string'
      );
    }
    return [];
  } catch {
    return [];
  }
}

export function buildSelectOptionsFromData<TData>(
  data: TData[],
  accessor: keyof TData | ((row: TData) => string)
): Array<{ label: string; value: string }> {
  const values = new Set<string>();
  data.forEach(row => {
    const val =
      typeof accessor === 'function'
        ? accessor(row)
        : String(row[accessor] ?? '');
    if (val) values.add(val);
  });
  return Array.from(values)
    .sort((a, b) => a.localeCompare(b, 'id'))
    .map(v => ({ label: v, value: v }));
}
