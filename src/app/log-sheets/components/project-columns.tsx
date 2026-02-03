'use client';

import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import type { IProject } from '@/features/projects/types';

export const getLogSheetProjectColumns = (): ColumnDef<IProject>[] => [
  {
    accessorKey: 'name',
    header: 'Proyek',
  },
  {
    accessorKey: 'client',
    header: 'Klien',
    cell: ({ row }) => row.original.client?.name ?? '-',
  },
  {
    id: 'actions',
    header: 'Aksi',
    cell: ({ row }) => (
      <Button asChild size="sm" variant="outline">
        <Link href={`/log-sheets/${row.original.id}`}>Buka</Link>
      </Button>
    ),
  },
];
