'use client';

import { useState, useEffect } from 'react';
import {
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
} from '@tanstack/react-table';

import { Search, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { IDataTableProps, IDataTableInnerProps, ITableTab } from './data-table/types';
import { DataTableView } from './data-table/data-table-view';
import { ServerPaginationControls } from './data-table/pagination-controls';
import { useDataTableSearch } from '@/hooks/use-data-table-search';
import { useSearchParam } from '@/hooks/use-search-param';
import { useColumnFilters } from '@/hooks/use-column-filters';
import { FilterToolbar } from './filter-toolbar';
import { filterFns } from '@/lib/filter-utils';

export type { ITableTab } from './data-table/types';

/**
 * Main DataTable Orchestrator
 * Handles Tabs, Global Sorting State, Search, Filtering, and Pagination.
 */
export function DataTable<TData, TValue>(
  props: IDataTableProps<TData, TValue>
) {
  const {
    columns: cols,
    data,
    emptyMessage = 'Belum ada data.',
    tabs,
    tab,
    onTabChange,
    searchConfig,
    disableSearch = false,
    serverPagination,
    columnFilters: enableColumnFilters = false,
    filterConfigs = [],
    onColumnFiltersChange,
    persistFiltersInUrl = false,
    filterUrlParamName,
  } = props;

  const [sorting, setSorting] = useState<SortingState>([]);

  // 1. Column Filters State
  const { columnFilters, setColumnFilters } = useColumnFilters<TData>({
    filterConfigs,
    persistInUrl: persistFiltersInUrl,
    urlParamName: filterUrlParamName,
    initialFilters: [],
  });

  useEffect(() => {
    if (onColumnFiltersChange) {
      onColumnFiltersChange(columnFilters);
    }
  }, [columnFilters, onColumnFiltersChange]);

  // 2. Search Logic
  const urlSearch = useSearchParam({
    paramName: searchConfig?.urlParamName ?? 'search',
    debounceMs: searchConfig?.debounceMs ?? 300,
  });

  const { query, setQuery, clearQuery, filteredData, isSearching } =
    useDataTableSearch({
      data: data as Record<string, unknown>[],
      debounceMs: searchConfig?.debounceMs,
      minQueryLength: searchConfig?.minQueryLength,
      searchKeys: searchConfig?.columnKeys,
      enableFuzzy: searchConfig?.enableFuzzy ?? true,
      fuzzyTolerance: searchConfig?.fuzzyTolerance ?? 2,
    });

  useEffect(() => {
    if (searchConfig?.enableUrlSync && query !== urlSearch.value) {
      urlSearch.setValue(query);
    }
  }, [query, searchConfig?.enableUrlSync, urlSearch]);

  useEffect(() => {
    if (searchConfig?.enableUrlSync && urlSearch.value && !query) {
      setQuery(urlSearch.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 3. Sub-Component Rendering Helpers
  const renderToolbar = () => (
    <DataTableToolbar
      enableColumnFilters={enableColumnFilters}
      filterConfigs={filterConfigs}
      columnFilters={columnFilters}
      setColumnFilters={setColumnFilters}
      disableSearch={disableSearch}
      searchConfig={searchConfig}
      query={query}
      setQuery={setQuery}
      clearQuery={clearQuery}
    />
  );

  const renderPagination = () =>
    serverPagination?.enabled ? (
      <ServerPaginationControls
        total={serverPagination.total}
        page={serverPagination.page}
        limit={serverPagination.limit}
        pageSizeOptions={serverPagination.pageSizeOptions}
        onPageChange={serverPagination.onPageChange}
        onLimitChange={serverPagination.onLimitChange}
        isLoading={serverPagination.isLoading}
      />
    ) : null;

  // 4. Orchestrate Layout
  if (tabs && tabs.length > 0) {
    const activeTab = tabs.find(t => t.value === tab);

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
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {renderToolbar()}
            {activeTab?.addNewRow}
          </div>
        </div>

        {activeTab?.filters && <div className="mb-4">{activeTab.filters}</div>}

        {tabs.map(t => (
          <TabsContent key={t.value} value={t.value} className="mt-0" forceMount>
            <TabContentTable
              tab={t}
              isActive={tab === t.value}
              filteredData={filteredData as any[]}
              isSearching={isSearching}
              query={query}
              emptyMessage={emptyMessage}
              sorting={sorting}
              onSortingChange={setSorting}
              columnFilters={columnFilters}
              onColumnFiltersChange={setColumnFilters}
            />
          </TabsContent>
        ))}
        {renderPagination()}
      </Tabs>
    );
  }

  // Simple Mode (No Tabs)
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {renderToolbar()}
      </div>

      <DataTableInnerWrapper
        columns={cols}
        data={filteredData as TData[]}
        emptyMessage={
          isSearching
            ? `Tidak ada data yang cocok dengan '${query}'`
            : emptyMessage
        }
        sorting={sorting}
        onSortingChange={setSorting}
        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}
      />

      {!serverPagination?.enabled && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button variant="outline" size="sm" className="hidden">
            Previous
          </Button>
        </div>
      )}
      {renderPagination()}
    </div>
  );
}

/**
 * Shared Toolbar for both Simple and Tabbed modes
 */
function DataTableToolbar({
  enableColumnFilters,
  filterConfigs,
  columnFilters,
  setColumnFilters,
  disableSearch,
  searchConfig,
  query,
  setQuery,
  clearQuery,
}: {
  enableColumnFilters: boolean;
  filterConfigs: any[];
  columnFilters: any[];
  setColumnFilters: any;
  disableSearch: boolean;
  searchConfig: any;
  query: string;
  setQuery: any;
  clearQuery: any;
}) {
  return (
    <>
      {enableColumnFilters && filterConfigs?.length > 0 && (
        <FilterToolbar
          filterConfigs={filterConfigs}
          columnFilters={columnFilters}
          onColumnFiltersChange={setColumnFilters}
          onClearAll={() => setColumnFilters([])}
        />
      )}

      {!disableSearch && (
        <div className="ml-auto relative w-full sm:w-72">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchConfig?.placeholder ?? 'Cari...'}
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-8 pr-8"
          />
          {query && (
            <button
              onClick={clearQuery}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
      )}
    </>
  );
}

interface ITabContentTableProps<TData> {
  tab: ITableTab<TData>;
  isActive: boolean;
  filteredData: TData[];
  isSearching: boolean;
  query: string;
  emptyMessage?: string;
  sorting: SortingState;
  onSortingChange: any;
  columnFilters: any;
  onColumnFiltersChange: any;
}

function TabContentTable<TData>({
  tab,
  isActive,
  filteredData,
  isSearching,
  query,
  emptyMessage,
  sorting,
  onSortingChange,
  columnFilters,
  onColumnFiltersChange,
}: ITabContentTableProps<TData>) {
  const tabData = isActive ? filteredData : tab.data;

  return (
    <DataTableInnerWrapper
      columns={tab.columns as any}
      data={tabData}
      emptyMessage={
        isActive && isSearching
          ? `Tidak ada data yang cocok dengan '${query}'`
          : emptyMessage
      }
      sorting={sorting}
      onSortingChange={onSortingChange}
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
    />
  );
}

function DataTableInnerWrapper<TData, TValue>({
  columns,
  data,
  emptyMessage = 'Belum ada data.',
  sorting,
  onSortingChange,
  columnFilters,
  onColumnFiltersChange,
}: {
  columns: any;
  data: TData[];
  emptyMessage?: string;
  sorting: SortingState;
  onSortingChange: any;
  columnFilters: any;
  onColumnFiltersChange: any;
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    filterFns: filterFns,
    state: {
      sorting,
      columnFilters,
    },
    onColumnFiltersChange: onColumnFiltersChange,
  });

  return (
    <DataTableView
      table={table}
      columns={columns}
      emptyMessage={emptyMessage}
    />
  );
}
