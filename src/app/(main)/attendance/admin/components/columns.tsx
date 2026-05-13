import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import { Badge } from '@/components/ui/badge';

export type TAttendanceAdminRow = {
  id: string;
  dateLocal: string;
  clockInAt: string | Date;
  clockOutAt: string | Date | null;
  totalHours: number | null;
  status: 'OPEN' | 'CLOSED';
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string;
  };
};

const statusMap: Record<
  TAttendanceAdminRow['status'],
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

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return format(d, 'dd MMMM yyyy', { locale: id });
}

export const columns: ColumnDef<TAttendanceAdminRow>[] = [
  {
    accessorKey: 'dateLocal',
    header: 'Tanggal',
    cell: ({ row }) => formatDate(row.getValue('dateLocal') as string),
  },
  {
    id: 'technician',
    header: 'Teknisi',
    cell: ({ row }) =>
      [row.original.user.firstName, row.original.user.lastName]
        .filter(Boolean)
        .join(' '),
  },
  {
    accessorKey: 'user.email',
    header: 'Email',
    cell: ({ row }) => row.original.user.email,
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
      const status = row.getValue('status') as TAttendanceAdminRow['status'];
      const meta = statusMap[status] || { label: status, variant: 'secondary' };
      return <Badge variant={meta.variant}>{meta.label}</Badge>;
    },
  },
];
