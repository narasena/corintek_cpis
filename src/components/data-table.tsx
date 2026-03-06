'use client';

import { useState } from 'react';
import {
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IDataTableProps } from './data-table/types';
import { DataTableView } from './data-table/data-table-view';

export type { ITableTab } from './data-table/types';

/**
 * Main DataTable Orchestrator
 * Handles Tabs, Global Sorting State, and responsive view switching.
 */
export function DataTable<TData, TValue>({
  columns: cols,
  data,
  emptyMessage = 'Belum ada data.',
  tabs,
  tab,
  onTabChange,
}: IDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  // 1. Tabbed Mode
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
          {activeTab?.addNewRow}
        </div>

        {activeTab?.filters && <div className="mb-4">{activeTab.filters}</div>}

        {tabs.map(t => (
          <TabsContent key={t.value} value={t.value} className="mt-0">
            <DataTableTable
              columns={t.columns}
              data={t.data}
              emptyMessage={emptyMessage}
              sorting={sorting}
              onSortingChange={setSorting}
            />
          </TabsContent>
        ))}
      </Tabs>
    );
  }

  // 2. Simple Mode (No Tabs)
  return (
    <DataTableTable
      columns={cols}
      data={data}
      emptyMessage={emptyMessage}
      sorting={sorting}
      onSortingChange={setSorting}
    />
  );
}

/**
 * Internal component to isolate useReactTable hook
 */
function DataTableTable<TData, TValue>({
  columns,
  data,
  emptyMessage,
  sorting,
  onSortingChange,
}: {
  columns: any;
  data: TData[];
  emptyMessage: string;
  sorting: SortingState;
  onSortingChange: any;
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <DataTableView
      table={table}
      columns={columns}
      emptyMessage={emptyMessage}
    />
  );
}
