'use client';

import { Button } from '@/components/ui/button';
import { IDataTableViewProps } from './types';
import { DesktopView } from './desktop-view';
import { MobileView } from './mobile-view';

export function DataTableView<TData, TValue>(
  props: IDataTableViewProps<TData, TValue>
) {
  const { table } = props;

  return (
    <div className="space-y-4">
      <DesktopView {...props} />
      <MobileView {...props} />

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
