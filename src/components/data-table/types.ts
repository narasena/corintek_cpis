import {
  ColumnDef,
  Table,
  OnChangeFn,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';

export interface ITableTab<TData> {
  value: string;
  label: string;
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  addNewRow?: React.ReactNode;
  filters?: React.ReactNode;
}

export interface IDataTableSearchConfig {
  placeholder?: string;
  debounceMs?: number;
  minQueryLength?: number;
  columnKeys?: string[];
  /** Enable URL persistence for search query */
  enableUrlSync?: boolean;
  /** URL param name for search */
  urlParamName?: string;
  /** Enable fuzzy matching (e.g., "Mrt" matches "Morat") */
  enableFuzzy?: boolean;
  /** Max edit distance for fuzzy matching (default: 2) */
  fuzzyTolerance?: number;
}

/**
 * Server-side pagination configuration
 * @responsibility Define props for server-managed pagination
 */
export interface IServerPaginationConfig {
  /** Enable server-side pagination */
  readonly enabled: true;
  /** Total items from server */
  readonly total: number;
  /** Current page (1-based) */
  readonly page: number;
  /** Items per page */
  readonly limit: number;
  /** Available page size options */
  readonly pageSizeOptions?: readonly number[];
  /** Page change handler */
  readonly onPageChange: (page: number) => void;
  /** Page size change handler */
  readonly onLimitChange: (limit: number) => void;
  /** Loading state */
  readonly isLoading?: boolean;
}

/**
 * Column filter configuration
 * @responsibility Define filter UI and behavior per column
 */
export interface IColumnFilterConfig<TData = unknown> {
  /** Column identifier (must match accessorKey or id) */
  columnId: string;
  /** Filter UI type */
  type: 'select' | 'text' | 'date';
  /** Label for filter control */
  label?: string;
  /** Options for select type filters */
  options?: Array<{ label: string; value: string }>;
  /** Placeholder for text/date input */
  placeholder?: string;
  /** Custom filter function name (uses TanStack built-in if omitted) */
  filterFn?: string;
  /** Default filter value */
  defaultValue?: unknown;
}

export interface IDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  emptyMessage?: string;
  tabs?: ITableTab<TData>[];
  tab?: string;
  onTabChange?: (value: string) => void;
  searchConfig?: IDataTableSearchConfig;
  disableSearch?: boolean;
  /** Enable highlighting of search matches in cells */
  highlightMatches?: boolean;
  /** Server-side pagination configuration (replaces client-side when provided) */
  serverPagination?: IServerPaginationConfig;
  /** Enable column filters UI */
  columnFilters?: boolean;
  /** Global filter configurations */
  filterConfigs?: IColumnFilterConfig<TData>[];
  /** Callback when column filters change */
  onColumnFiltersChange?: (filters: { id: string; value: unknown }[]) => void;
  /** Persist filter state in URL */
  persistFiltersInUrl?: boolean;
  /** URL param name for filters */
  filterUrlParamName?: string;
}

export interface IDataTableViewProps<TData, TValue> {
  table: Table<TData>;
  columns: ColumnDef<TData, TValue>[];
  emptyMessage: string;
}

export interface IDataTableInnerProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  emptyMessage?: string;
  table: Table<TData>;
}
