'use client';

import { flexRender, Row, Cell, Header } from '@tanstack/react-table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from '@/components/ui/card';
import { IDataTableViewProps } from './types';

export function MobileView<TData, TValue>({
  table,
  emptyMessage,
}: IDataTableViewProps<TData, TValue>) {
  return (
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
  );
}
