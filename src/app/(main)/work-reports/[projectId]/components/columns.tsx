'use client';

import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ActionCell } from '@/components/action-cell';
import { WorkReportRow } from '@/features/work-reports/types';
import { deleteWorkReportAction } from '@/features/work-reports/actions';
import { useRouter } from 'next/navigation';
import { Eye } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

interface GetColumnsProps {
  projectId: string;
  onEdit: (row: WorkReportRow) => void;
}

export const getWorkReportColumns = ({
  projectId,
  onEdit,
}: GetColumnsProps): ColumnDef<WorkReportRow>[] => [
  {
    accessorKey: 'date',
    header: 'Tanggal',
    cell: ({ row }) => {
      const date = new Date(row.getValue('date'));
      return format(date, 'dd MMMM yyyy', { locale: id });
    },
  },
  {
    accessorKey: 'situation',
    header: 'Kondisi / Situasi',
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate" title={row.getValue('situation')}>
        {row.getValue('situation')}
      </div>
    ),
  },
  {
    accessorKey: 'workDone',
    header: 'Pekerjaan',
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate" title={row.getValue('workDone')}>
        {row.getValue('workDone')}
      </div>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useRouter();

      return (
        <ActionCell
          data={row.original}
          entityName="Laporan Kerja"
          getEntityId={data => data.id}
          onEdit={() => onEdit(row.original)}
          onDelete={async id => {
            const formData = new FormData();
            formData.append('id', id);
            formData.append('projectId', projectId);
            return await deleteWorkReportAction(formData);
          }}
        >
          <DropdownMenuItem
            onClick={() =>
              router.push(`/work-reports/${projectId}/${row.original.id}`)
            }
          >
            <Eye className="mr-2 h-4 w-4" />
            Detail
          </DropdownMenuItem>
        </ActionCell>
      );
    },
  },
];
