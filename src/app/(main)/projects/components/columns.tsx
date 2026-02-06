'use client';

import { ColumnDef } from '@tanstack/react-table';
import { IProject, TProjectStatus } from '@/features/projects/types';
import { ProjectParameterOverridesDialog } from '@/features/projects/components/project-parameter-overrides-dialog';
import { ActionCell } from '@/components/action-cell';
import { Badge } from '@/components/ui/badge';

interface GetColumnsProps {
  onEdit: (project: IProject) => void;
  onRefresh: () => void;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export const getProjectColumns = ({
  onEdit,
  onDelete,
}: GetColumnsProps): ColumnDef<IProject>[] => {
  return [
    {
      accessorKey: 'name',
      header: 'Nama Proyek',
    },
    {
      accessorKey: 'client.name',
      header: 'Klien',
    },
    {
      accessorKey: 'startDate',
      header: 'Mulai',
      cell: ({ row }) => {
        const date = new Date(row.getValue('startDate'));
        return date.toLocaleDateString('id-ID');
      },
    },
    {
      accessorKey: 'endDate',
      header: 'Selesai',
      cell: ({ row }) => {
        const date = row.getValue('endDate');
        if (!date) return '-';
        return new Date(date as string).toLocaleDateString('id-ID');
      },
    },
    {
      id: 'machineCount',
      header: 'Mesin',
      cell: ({ row }) => {
        const machines = row.original.machines || [];
        return (
          <Badge variant="outline" className="font-mono">
            {machines.length} Unit
          </Badge>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as TProjectStatus;

        const variants: Record<
          TProjectStatus,
          'default' | 'secondary' | 'destructive' | 'outline'
        > = {
          PENDING: 'secondary',
          ONGOING: 'default',
          PAUSED: 'outline',
          COMPLETED: 'default',
          CANCELLED: 'destructive',
        };

        const labels: Record<TProjectStatus, string> = {
          PENDING: 'Menunggu',
          ONGOING: 'Berjalan',
          PAUSED: 'Ditunda',
          COMPLETED: 'Selesai',
          CANCELLED: 'Dibatalkan',
        };

        return <Badge variant={variants[status]}>{labels[status]}</Badge>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <ProjectParameterOverridesDialog project={row.original} />
          <ActionCell
            data={row.original}
            entityName="Proyek"
            getEntityId={project => project.id}
            onEdit={() => onEdit(row.original)}
            onDelete={() => onDelete(row.original.id)}
          />
        </div>
      ),
    },
  ];
};
