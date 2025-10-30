import { defaultColumns } from '@/components/default-columns';
import { ILogSheet } from '@/types/log-sheet.type';
import { ColumnDef } from '@tanstack/react-table';

export const logSheetsColumns = (): ColumnDef<ILogSheet>[] => {
  const { select, actions } = defaultColumns<ILogSheet>();
  return [
    select,
    {
      id: 'date',
      header: 'Tanggal',
      cell: ({ row }) =>
        new Date(row.original.date).toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      enableHiding: false,
    },
    {
      accessorKey: 'logSheetHistories.status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.logSheetHistories[
          row.original.logSheetHistories.length - 1
        ].status as string;
        return status;
      },
    },
    actions(),
  ];
};
