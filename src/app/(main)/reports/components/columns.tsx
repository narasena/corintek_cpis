'use client';

import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import type { IGlobalLogSheetListItem } from '@/features/log-sheets/service';

const statusMap: Record<
  string,
  {
    label: string;
    variant: 'default' | 'secondary' | 'outline' | 'destructive';
  }
> = {
  DRAFT: { label: 'Draft', variant: 'secondary' },
  SUBMITTED: { label: 'Diajukan', variant: 'default' },
  APPROVED: { label: 'Disetujui', variant: 'outline' },
};

export const columns: ColumnDef<IGlobalLogSheetListItem>[] = [
  {
    accessorKey: 'date',
    header: 'Tanggal',
    cell: ({ row }) => {
      const date = new Date(row.getValue('date'));
      return format(date, 'dd MMM yyyy', { locale: id });
    },
  },
  {
    accessorKey: 'project.client.name',
    header: 'Klien',
    cell: ({ row }) => row.original.project.client?.name ?? '-',
  },
  {
    accessorKey: 'project.name',
    header: 'Proyek',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const meta = statusMap[status] || { label: status, variant: 'secondary' };
      return <Badge variant={meta.variant}>{meta.label}</Badge>;
    },
  },
  {
    id: 'actions',
    enableSorting: false,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center gap-2">
          <Link href={`/log-sheets/${item.projectId}/${item.id}`}>
            <Button variant="ghost" size="icon" title="Lihat Detail">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      );
    },
  },
];
