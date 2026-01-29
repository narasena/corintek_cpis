import { defaultColumns } from '@/components/default-columns';
import { ILogSheet } from '@/types/log-sheet.type';
import { ColumnDef } from '@tanstack/react-table';
import LogSheetData from './log-sheet-data';

export const logSheetsColumns = (): ColumnDef<ILogSheet>[] => {
  const { select, actions } = defaultColumns<ILogSheet>();
  return [
    select,
    {
      id: 'date',
      header: 'Tanggal',
      cell: ({ row }) => {
        const date = row.original.date as string;
        return (
          <LogSheetData
            date={date}
            projectName={row.original.project.name}
            clientName="Test"
            approverName="Test"
            data={row.original.details}
          />
        );
      },
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
