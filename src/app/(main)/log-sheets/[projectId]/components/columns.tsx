'use client';

import { ColumnDef } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import { ActionCell } from '@/components/action-cell';
import type { TLogSheetStatus } from '@/features/log-sheets/types';
import { formatDate } from '../[logSheetId]/utils';

export type TLogSheetRow = {
  id: string;
  projectId: string;
  date: Date | string;
  notes: string | null;
  status: TLogSheetStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
};

interface IColumnsProps {
  onOpen: (logSheetId: string) => void;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const statusVariant = (status: TLogSheetStatus) => {
  if (status === 'APPROVED') return 'default';
  if (status === 'SUBMITTED') return 'secondary';
  return 'outline';
};

export const getLogSheetColumns = ({
  onOpen,
  onDelete,
}: IColumnsProps): ColumnDef<TLogSheetRow>[] => [
  {
    accessorKey: 'date',
    header: 'Tanggal',
    cell: ({ row }) => formatDate(row.original.date),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={statusVariant(row.original.status)}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'notes',
    header: 'Catatan',
    cell: ({ row }) => row.original.notes ?? '-',
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <ActionCell
        data={row.original}
        entityName="Log Sheet"
        getDisplayName={d => formatDate(d.date)}
        getEntityId={d => d.id}
        onEdit={() => onOpen(row.original.id)}
        onDelete={onDelete}
      />
    ),
  },
];
