'use client';

import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { MoreHorizontal, Pencil, Printer } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LabAnalysisRow } from '@/features/lab-analyses/types';

function LabAnalysisActions({
  projectId,
  labAnalysisId,
}: {
  projectId: string;
  labAnalysisId: string;
}) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Buka menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() =>
            router.push(`/lab-analyses/${projectId}/${labAnalysisId}/edit`)
          }
        >
          <Pencil className="mr-2 h-4 w-4" /> Ubah
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            router.push(`/lab-analyses/${projectId}/${labAnalysisId}/print`)
          }
        >
          <Printer className="mr-2 h-4 w-4" /> Print
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const getLabAnalysisColumns = ({
  projectId,
}: {
  projectId: string;
}): ColumnDef<LabAnalysisRow>[] => [
  {
    accessorKey: 'date',
    header: 'Tanggal',
    cell: ({ row }) => {
      const date = new Date(row.getValue('date'));
      return format(date, 'dd MMMM yyyy', { locale: id });
    },
  },
  {
    accessorKey: 'reportNumber',
    header: 'No',
    cell: ({ row }) => row.getValue('reportNumber') || '-',
  },
  {
    accessorKey: 'customer',
    header: 'Customer',
    cell: ({ row }) => (
      <div className="max-w-[240px] truncate" title={row.getValue('customer')}>
        {row.getValue('customer') || '-'}
      </div>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <LabAnalysisActions
        projectId={projectId}
        labAnalysisId={row.original.id}
      />
    ),
  },
];

