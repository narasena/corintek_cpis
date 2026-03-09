'use client';

import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ActionCell } from '@/components/action-cell';
import { Badge } from '@/components/ui/badge';
import { WorkReportRow } from '@/features/work-reports/types';
import {
  approveWorkReportAction,
  deleteWorkReportAction,
  submitWorkReportAction,
} from '@/features/work-reports/actions';
import { useRouter } from 'next/navigation';
import { Eye } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

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
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as WorkReportRow['status'];
      const variant =
        status === 'APPROVED'
          ? 'default'
          : status === 'SUBMITTED'
            ? 'secondary'
            : 'outline';
      return <Badge variant={variant}>{status}</Badge>;
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
            return await deleteWorkReportAction(id);
          }}
        >
          {row.original.status === 'DRAFT' && (
            <DropdownMenuItem
              onClick={async () => {
                const res = await submitWorkReportAction(row.original.id);
                if (!res.success) {
                  toast.error('Gagal mengirim laporan', {
                    description: (res as any).message,
                  });
                  return;
                }
                toast.success('Laporan berhasil dikirim');
                router.refresh();
              }}
            >
              Kirim ke PIC
            </DropdownMenuItem>
          )}
          {row.original.status === 'SUBMITTED' && (
            <DropdownMenuItem
              onClick={async () => {
                const res = await approveWorkReportAction(row.original.id);
                if (!res.success) {
                  toast.error('Gagal menyetujui laporan', {
                    description: (res as any).message,
                  });
                  return;
                }
                toast.success('Laporan disetujui');
                router.refresh();
              }}
            >
              Setujui
            </DropdownMenuItem>
          )}
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
