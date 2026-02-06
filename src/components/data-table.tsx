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

interface IDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  emptyMessage?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  emptyMessage = 'Belum ada data.',
}: IDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div className="space-y-4">
      <div className="hidden md:block rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow
                key={headerGroup.id}
                className="bg-primary hover:bg-primary/90"
              >
                {headerGroup.headers.map(header => {
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
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map(cell => (
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
          table.getRowModel().rows.map(row => {
            const actionCell = row
              .getVisibleCells()
              .find(cell => cell.column.id === 'actions');
            const contentCells = row
              .getVisibleCells()
              .filter(cell => cell.column.id !== 'actions');

            // Try to find a suitable title cell (first non-action cell)
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
                  {/* If we moved the first cell to title, we might want to also show its label? 
                        Usually titles don't need labels. 
                        Let's render remaining cells. */}
                  {otherCells.map(cell => {
                    const header = table
                      .getFlatHeaders()
                      .find(h => h.column.id === cell.column.id);

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
