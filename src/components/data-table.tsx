'use client';

import { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  HeaderGroup,
  Row,
  Cell,
  Header,
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from '@/components/ui/card';
import { ArrowUpDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface ITableTab<TData> {
  value: string;
  label: string;
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  addNewRow?: React.ReactNode;
  filters?: React.ReactNode;
}

interface IDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  emptyMessage?: string;
  tabs?: ITableTab<TData>[];
  tab?: string;
  onTabChange?: (value: string) => void;
}

export function DataTable<TData, TValue>({
  columns: cols,
  data,
  emptyMessage = 'Belum ada data.',
  tabs,
  tab,
  onTabChange,
}: IDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  // If tabs are provided, use the tab's data and columns
  const activeTab = tabs?.find(t => t.value === tab);
  const columns = activeTab ? activeTab.columns : cols;
  const tableData = activeTab ? activeTab.data : data;

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

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
          {activeTab?.addNewRow}
        </div>

        {activeTab?.filters && <div className="mb-4">{activeTab.filters}</div>}

        {tabs.map(t => (
          <TabsContent key={t.value} value={t.value} className="mt-0">
            <DataTableInner
              columns={t.columns}
              data={t.data}
              emptyMessage={emptyMessage}
              table={useReactTable({
                data: t.data,
                columns: t.columns,
                getCoreRowModel: getCoreRowModel(),
                getPaginationRowModel: getPaginationRowModel(),
                onSortingChange: setSorting,
                getSortedRowModel: getSortedRowModel(),
                state: { sorting },
              })}
            />
          </TabsContent>
        ))}
      </Tabs>
    );
  }

  // No tabs - render simple table
  return (
    <DataTableInner
      columns={columns}
      data={tableData}
      emptyMessage={emptyMessage}
      table={table}
    />
  );
}

function DataTableInner<TData, TValue>({
  columns,
  data,
  emptyMessage,
  table,
}: {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  emptyMessage?: string;
  table: any;
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
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {emptyMessage}
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
          <div className="text-center p-8 border rounded-md text-muted-foreground bg-muted/20">
            {emptyMessage}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Sebelumnya
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Selanjutnya
        </Button>
      </div>
    </div>
  );
}
