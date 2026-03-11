'use client';

import { ColumnDef } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  onOpen: (logSheetId: string, mode: 'input' | 'preview') => void;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
  canEdit: boolean;
  canDelete: boolean;
}

const statusVariant = (status: TLogSheetStatus) => {
  if (status === 'APPROVED') return 'default';
  if (status === 'SUBMITTED') return 'secondary';
  return 'outline';
};

export const getLogSheetColumns = ({
  onOpen,
  onDelete,
  canEdit,
  canDelete,
}: IColumnsProps): ColumnDef<TLogSheetRow>[] => [
  {
    accessorKey: 'date',
    header: 'Tanggal',
    cell: ({ row }) => (
      <Button
        variant="ghost"
        className="h-auto p-0 text-primary hover:text-primary/80 font-medium"
        onClick={() => onOpen(row.original.id, 'preview')}
      >
        {formatDate(row.original.date)}
      </Button>
    ),
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
        onEdit={() => onOpen(row.original.id, 'input')}
        onDelete={onDelete}
        canEdit={canEdit}
        canDelete={canDelete}
      />
    ),
  },
];
