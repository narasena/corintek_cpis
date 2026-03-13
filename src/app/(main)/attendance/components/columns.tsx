'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import { Badge } from '@/components/ui/badge';

export type TAttendanceTechnicianRow = {
  id: string;
  dateLocal: string;
  clockInAt: string | Date;
  clockOutAt: string | Date | null;
  totalHours: number | null;
  status: 'OPEN' | 'CLOSED';
};

const statusMap: Record<
  TAttendanceTechnicianRow['status'],
  {
    label: string;
    variant: 'default' | 'secondary' | 'outline' | 'destructive';
  }
> = {
  OPEN: { label: 'OPEN', variant: 'secondary' },
  CLOSED: { label: 'CLOSED', variant: 'outline' },
};

function formatClock(value: string | Date | null) {
  if (!value) return '-';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return format(d, 'HH:mm', { locale: id });
}

export const columns: ColumnDef<TAttendanceTechnicianRow>[] = [
  {
    accessorKey: 'dateLocal',
    header: 'Tanggal',
    cell: ({ row }) => row.getValue('dateLocal') as string,
  },
  {
    accessorKey: 'clockInAt',
    header: 'Masuk',
    cell: ({ row }) => formatClock(row.original.clockInAt),
  },
  {
    accessorKey: 'clockOutAt',
    header: 'Pulang',
    cell: ({ row }) => formatClock(row.original.clockOutAt),
  },
  {
    accessorKey: 'totalHours',
    header: 'Total Jam',
    cell: ({ row }) => row.original.totalHours ?? '-',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue(
        'status'
      ) as TAttendanceTechnicianRow['status'];
      const meta = statusMap[status] || { label: status, variant: 'secondary' };
      return <Badge variant={meta.variant}>{meta.label}</Badge>;
    },
  },
];
