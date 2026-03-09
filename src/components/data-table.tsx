'use client';

import React, { useState, useEffect } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  HeaderGroup,
  Row,
  Header,
  Cell,
  OnChangeFn,
  Table as TableType,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from '@/components/ui/card';
import { ArrowUpDown, Search, X, Inbox } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDataTableSearch } from '@/hooks/use-data-table-search';
import { useSearchParam } from '@/hooks/use-search-param';
import { useColumnFilters } from '@/hooks/use-column-filters';
import { FilterToolbar } from './filter-toolbar';
import { filterFns } from '@/lib/filter-utils';

export interface ITableTab<TData> {
  value: string;
  label: string;
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  addNewRow?: React.ReactNode;
  filters?: React.ReactNode;
}

interface IDataTableSearchConfig {
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

interface IDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  emptyMessage?: React.ReactNode;
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

export function DataTable<TData, TValue>({
  columns: cols,
  data,
  emptyMessage = 'Belum ada data.',
  tabs,
  tab,
  onTabChange,
  searchConfig,
  disableSearch = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  highlightMatches = false,
  serverPagination,
  columnFilters: enableColumnFilters = false,
  filterConfigs = [],
  onColumnFiltersChange,
  persistFiltersInUrl = false,
  filterUrlParamName,
}: IDataTableProps<TData, TValue>) {
  const { columnFilters, setColumnFilters } = useColumnFilters<TData>({
    filterConfigs,
    persistInUrl: persistFiltersInUrl,
    urlParamName: filterUrlParamName,
    initialFilters: [],
  });

  // Notify parent of column filter changes
  useEffect(() => {
    if (onColumnFiltersChange) {
      onColumnFiltersChange(columnFilters);
    }
  }, [columnFilters, onColumnFiltersChange]);

  const [sorting, setSorting] = useState<SortingState>([]);

  // URL persistence for search
  const urlSearch = useSearchParam({
    paramName: searchConfig?.urlParamName ?? 'search',
    debounceMs: searchConfig?.debounceMs ?? 300,
  });

  // Search functionality
  const { query, setQuery, clearQuery, filteredData, isSearching } =
    useDataTableSearch({
      data: data as Record<string, unknown>[],
      debounceMs: searchConfig?.debounceMs,
      minQueryLength: searchConfig?.minQueryLength,
      searchKeys: searchConfig?.columnKeys,
      enableFuzzy: searchConfig?.enableFuzzy ?? true,
      fuzzyTolerance: searchConfig?.fuzzyTolerance ?? 2,
    });

  // Sync URL with search state if enabled
  useEffect(() => {
    if (searchConfig?.enableUrlSync && query !== urlSearch.value) {
      urlSearch.setValue(query);
    }
  }, [query]); // Only sync when query changes from user input

  // Initialize from URL on mount only
  useEffect(() => {
    if (searchConfig?.enableUrlSync && urlSearch.value && !query) {
      setQuery(urlSearch.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // If tabs are provided, use the tab's data and columns
  const activeTab = tabs?.find(t => t.value === tab);
  const columns = activeTab ? activeTab.columns : cols;
  const tableData = (activeTab ? activeTab.data : filteredData) as TData[];

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    filterFns: filterFns,
    state: {
      sorting,
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
  });

  // Filter toolbar
  const filterToolbar =
    enableColumnFilters && filterConfigs?.length ? (
      <FilterToolbar
        filterConfigs={filterConfigs}
        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}
        onClearAll={() => setColumnFilters([])}
      />
    ) : null;

  const searchInput = !disableSearch && (
    <div className="relative w-full sm:w-80">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
      <Input
        placeholder={searchConfig?.placeholder ?? 'Cari data...'}
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="pl-9 pr-9 h-10 w-full rounded-full bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary/30 transition-all shadow-sm"
      />
      {query && (
        <button
          onClick={clearQuery}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-muted/50 transition-colors"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      )}
    </div>
  );

  // If tabs are provided, render with tabs
  if (tabs && tabs.length > 0) {
    return (
      <Tabs value={tab} onValueChange={onTabChange} className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <TabsList>
            {tabs.map(t => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center">
            <div className="flex-1 sm:flex-none">{filterToolbar}</div>
            <div className="flex gap-2 justify-end">
              {searchInput}
              {activeTab?.addNewRow}
            </div>
          </div>
        </div>

        {activeTab?.filters && <div className="mb-4">{activeTab.filters}</div>}

        {tabs.map(t => (
          <TabsContent key={t.value} value={t.value} className="mt-0">
            <TabContentTable
              tab={t}
              activeTabValue={tab}
              filteredData={filteredData}
              isSearching={isSearching}
              query={query}
              emptyMessage={emptyMessage}
              sorting={sorting}
              onSortingChange={setSorting}
            />
          </TabsContent>
        ))}
      </Tabs>
    );
  }

  // Combined toolbar: filters left, search right, stacked on mobile
  const toolbar = (filterToolbar || searchInput) && (
    <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center bg-card/50 p-3 rounded-2xl border border-border/50 backdrop-blur-sm shadow-sm">
      <div className="flex-1 sm:flex-none w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
        {filterToolbar}
      </div>
      {searchInput && (
        <div className="flex justify-end w-full sm:w-auto">{searchInput}</div>
      )}
    </div>
  );

  // No tabs - render simple table with search
  return (
    <div className="space-y-4">
      {toolbar}
      <DataTableInner
        columns={columns}
        data={tableData}
        emptyMessage={
          isSearching
            ? `Tidak ada data yang cocok dengan '${query}'`
            : emptyMessage
        }
        table={table}
      />
      {/* Server or client pagination */}
      {serverPagination?.enabled ? (
        <ServerPaginationControls
          total={serverPagination.total}
          page={serverPagination.page}
          limit={serverPagination.limit}
          pageSizeOptions={serverPagination.pageSizeOptions}
          onPageChange={serverPagination.onPageChange}
          onLimitChange={serverPagination.onLimitChange}
          isLoading={serverPagination.isLoading}
        />
      ) : (
        <ClientPaginationControls table={table} />
      )}
    </div>
  );
}

interface ITabContentTableProps<TData> {
  tab: ITableTab<TData>;
  activeTabValue?: string;
  filteredData: Record<string, unknown>[];
  isSearching: boolean;
  query: string;
  emptyMessage?: React.ReactNode;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
}

function TabContentTable<TData>({
  tab,
  activeTabValue,
  filteredData,
  isSearching,
  query,
  emptyMessage,
  sorting,
  onSortingChange,
}: ITabContentTableProps<TData>) {
  const isActive = tab.value === activeTabValue;
  const tabData = (isActive ? filteredData : tab.data) as TData[];

  const table = useReactTable({
    data: tabData,
    columns: tab.columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange,
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
  });

  return (
    <DataTableInner
      columns={tab.columns}
      data={tabData}
      emptyMessage={
        isActive && isSearching
          ? `Tidak ada data yang cocok dengan '${query}'`
          : emptyMessage
      }
      table={table}
    />
  );
}

function DataTableInner<TData, TValue>({
  columns,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  data,
  emptyMessage,
  table,
}: {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  emptyMessage?: React.ReactNode;
  table: TableType<TData>;
}) {
  return (
    <div className="space-y-4">
      <div className="hidden md:block rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup: HeaderGroup<TData>) => (
              <TableRow
                key={headerGroup.id}
                className="bg-primary hover:bg-primary/90"
              >
                {headerGroup.headers.map((header: Header<TData, unknown>) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="text-primary-foreground font-semibold"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? 'flex items-center cursor-pointer select-none'
                              : ''
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row: Row<TData>) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="hover:bg-muted/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell: Cell<TData, unknown>) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Inbox className="h-10 w-10 mb-2 opacity-50" />
                    <span>{emptyMessage}</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row: Row<TData>) => {
            const actionCell = row
              .getVisibleCells()
              .find(
                (cell: Cell<TData, unknown>) => cell.column.id === 'actions'
              );
            const contentCells = row
              .getVisibleCells()
              .filter(
                (cell: Cell<TData, unknown>) => cell.column.id !== 'actions'
              );

            const titleCell = contentCells[0];
            const otherCells = contentCells.slice(1);

            return (
              <Card key={row.id}>
                <CardHeader>
                  <CardTitle className="overflow-hidden text-ellipsis whitespace-nowrap pr-8">
                    {titleCell && (
                      <span>
                        {flexRender(
                          titleCell.column.columnDef.cell,
                          titleCell.getContext()
                        )}
                      </span>
                    )}
                  </CardTitle>
                  {actionCell && (
                    <CardAction>
                      {flexRender(
                        actionCell.column.columnDef.cell,
                        actionCell.getContext()
                      )}
                    </CardAction>
                  )}
                </CardHeader>
                <CardContent className="grid gap-2">
                  {otherCells.map((cell: Cell<TData, unknown>) => {
                    const header = table
                      .getFlatHeaders()
                      .find(
                        (h: Header<TData, unknown>) =>
                          h.column.id === cell.column.id
                      );

                    return (
                      <div
                        key={cell.id}
                        className="flex justify-between items-center py-1 border-b last:border-0 border-border/50"
                      >
                        <span className="font-medium text-muted-foreground text-sm">
                          {header
                            ? flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )
                            : null}
                        </span>
                        <div className="text-sm text-right pl-4">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="bg-muted/20 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Inbox className="h-10 w-10 mb-2 opacity-50" />
              <span>{emptyMessage}</span>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

/**
 * Server-side pagination controls component
 * @responsibility Render pagination UI for server-managed data
 */
interface IServerPaginationControlsProps {
  total: number;
  page: number;
  limit: number;
  pageSizeOptions?: readonly number[];
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  isLoading?: boolean;
}

function ClientPaginationControls<TData>({
  table,
}: {
  table: TableType<TData>;
}) {
  const pagination = table.getState().pagination;
  const pageIndex = pagination.pageIndex + 1;
  const pageSize = pagination.pageSize;
  const totalRows = table.getFilteredRowModel().rows.length;

  if (totalRows === 0) return null;

  const start = (pageIndex - 1) * pageSize + 1;
  const end = Math.min(pageIndex * pageSize, totalRows);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2">
      <div className="text-sm text-muted-foreground font-medium bg-muted/40 px-3 py-1.5 rounded-full border border-border/20">
        Menampilkan{' '}
        <span className="text-foreground">
          {start}-{end}
        </span>{' '}
        dari <span className="text-foreground">{totalRows}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="rounded-full shadow-sm"
        >
          Seb
        </Button>
        <div className="text-sm font-medium px-2">Hal {pageIndex}</div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="rounded-full shadow-sm"
        >
          Selanjutnya
        </Button>
      </div>
    </div>
  );
}

interface IServerPaginationControlsProps {
  total: number;
  page: number;
  limit: number;
  pageSizeOptions?: readonly number[];
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  isLoading?: boolean;
}

function ServerPaginationControls({
  total,
  page,
  limit,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onLimitChange,
  isLoading = false,
}: IServerPaginationControlsProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2">
      <div className="text-sm text-muted-foreground font-medium bg-muted/40 px-3 py-1.5 rounded-full border border-border/20">
        Menampilkan{' '}
        <span className="text-foreground">
          {start}-{end}
        </span>{' '}
        dari <span className="text-foreground">{total}</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage || isLoading}
          className="rounded-full shadow-sm"
        >
          Seb
        </Button>
        <span className="text-sm font-medium px-2">
          Hal {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage || isLoading}
          className="rounded-full shadow-sm"
        >
          Selanjutnya
        </Button>
        <select
          value={limit}
          onChange={e => onLimitChange(Number(e.target.value))}
          disabled={isLoading}
          className="h-9 rounded-full border border-input bg-background/50 px-3 text-sm font-medium shadow-sm outline-none focus:ring-1 focus:ring-primary ml-2"
        >
          {pageSizeOptions.map(opt => (
            <option key={opt} value={opt}>
              {opt} / hal
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
