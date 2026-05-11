'use client';

import { ColumnDef } from '@tanstack/react-table';
import {
  IProject,
  TProjectStatus,
  TProjectContractType,
  TProjectWorkCategory,
} from '@/features/projects/types';
import { ProjectParameterOverridesDialog } from '@/features/projects/components/project-parameter-overrides-dialog';
import { ActionCell } from '@/components/action-cell';
import { Badge } from '@/components/ui/badge';

export const PROJECT_STATUS_OPTIONS = [
  { label: 'Menunggu', value: 'PENDING' },
  { label: 'Berjalan', value: 'ONGOING' },
  { label: 'Ditunda', value: 'PAUSED' },
  { label: 'Selesai', value: 'COMPLETED' },
  { label: 'Dibatalkan', value: 'CANCELLED' },
];

export const CONTRACT_TYPE_OPTIONS = [
  { label: 'Langsung', value: 'DIRECT' },
  { label: 'Subkon', value: 'SUBCONTRACT' },
];

export const WORK_CATEGORY_OPTIONS = [
  { label: 'Operasional', value: 'OPERATIONAL' },
  { label: 'Proyek/Konstruksi', value: 'CONSTRUCTION' },
  { label: 'Ad Hoc', value: 'AD_HOC' },
];

interface GetColumnsProps {
  onEdit: (project: IProject) => void;
  onRefresh: () => void;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const formatWarrantyMonths = (value?: number | null) => {
  if (value === null || value === undefined) return '-';
  if (Number.isNaN(value) || value < 0) return '-';
  return `${value} bulan`;
};

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
      accessorKey: 'contractType',
      header: 'Jenis',
      cell: ({ row }) => {
        const type = row.getValue('contractType') as TProjectContractType;

        const labels: Record<TProjectContractType, string> = {
          DIRECT: 'Langsung',
          SUBCONTRACT: 'Subkon',
        };

        if (!type || !(type in labels)) {
          return '-';
        }

        return <Badge variant="outline">{labels[type]}</Badge>;
      },
    },
    {
      accessorKey: 'workCategory',
      header: 'Pekerjaan',
      cell: ({ row }) => {
        const category = row.getValue('workCategory') as TProjectWorkCategory;

        const labels: Record<TProjectWorkCategory, string> = {
          OPERATIONAL: 'Operasional',
          CONSTRUCTION: 'Proyek/Konstruksi',
          AD_HOC: 'Ad Hoc',
        };

        if (!category || !(category in labels)) {
          return '-';
        }

        return <Badge variant="outline">{labels[category]}</Badge>;
      },
    },
    {
      accessorKey: 'startDate',
      header: 'Mulai',
      cell: ({ row }) => {
        const date = new Date(row.getValue('startDate'));
        return date.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      },
    },
    {
      accessorKey: 'endDate',
      header: 'Selesai',
      cell: ({ row }) => {
        const date = row.getValue('endDate');
        if (!date) return '-';
        return new Date(date as string).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      },
    },
    {
      accessorKey: 'warrantyMonths',
      header: 'Garansi',
      cell: ({ row }) =>
        formatWarrantyMonths(row.original.warrantyMonths ?? null),
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
            customDescription={
              row.original._count.logSheets > 0
                ? `Sudah ada ${row.original._count.logSheets} logsheet tersimpan di database.`
                : undefined
            }
            entityName="Proyek"
            getDisplayName={row => row.name}
            getEntityId={project => project.id}
            onEdit={() => onEdit(row.original)}
            onDelete={() => onDelete(row.original.id)}
          />
        </div>
      ),
    },
  ];
};
