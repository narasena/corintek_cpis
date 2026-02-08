'use client';

import { ColumnDef } from '@tanstack/react-table';
import { IParameter } from '@/features/parameters/types';
import { ActionCell } from '@/components/action-cell';
import { Badge } from '@/components/ui/badge';

interface GetColumnsProps {
  onEdit: (parameter: IParameter) => void;
  onRefresh: () => void;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
}

// Indonesian labels for enums
const categoryLabels: Record<string, string> = {
  UNIT_CONDENSOR: 'Unit Condensor',
  UNIT_EVAPORATOR: 'Unit Evaporator',
  COOLING_WATER_QUALITY: 'Kualitas Air Pendingin',
  GENERAL_CONDITION: 'Kondisi Umum',
  JOB_DESCRIPTION: 'Deskripsi Pekerjaan',
  CONSUMPTION: 'Konsumsi',
  LAB_ANALYSIS: 'Lab Analysis',
};

const valueTypeLabels: Record<string, string> = {
  NUMBER: 'Angka',
  BOOLEAN: 'Ya/Tidak',
  TEXT: 'Teks',
};

export const getParameterColumns = ({
  onEdit,
  onDelete,
}: GetColumnsProps): ColumnDef<IParameter>[] => {
  return [
    {
      accessorKey: 'name',
      header: 'Nama Parameter',
    },
    {
      accessorKey: 'variableName',
      header: 'Nama Variabel',
      cell: ({ row }) => {
        return (
          <code className="text-xs bg-muted px-1 py-0.5 rounded">
            {row.getValue('variableName')}
          </code>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Kategori',
      cell: ({ row }) => {
        const category = row.getValue('category') as string;
        return (
          <span className="text-sm">
            {categoryLabels[category] || category}
          </span>
        );
      },
    },
    {
      accessorKey: 'valueType',
      header: 'Tipe Nilai',
      cell: ({ row }) => {
        const valueType = row.getValue('valueType') as string;
        return (
          <Badge variant="outline">
            {valueTypeLabels[valueType] || valueType}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'unit',
      header: 'Satuan',
      cell: ({ row }) => {
        const unit = row.getValue('unit') as string | null;
        return unit ? (
          <span className="text-sm">{unit}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      id: 'range',
      header: 'Rentang',
      cell: ({ row }) => {
        const { valueType, minValue, maxValue } = row.original;
        if (
          valueType !== 'NUMBER' ||
          (minValue === null && maxValue === null)
        ) {
          return <span className="text-muted-foreground">-</span>;
        }
        return (
          <span className="text-sm">
            {minValue ?? '∞'} - {maxValue ?? '∞'}
          </span>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean;
        return (
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? 'Aktif' : 'Tidak Aktif'}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <ActionCell
          data={row.original}
          entityName="Parameter"
          getEntityId={param => param.id}
          onEdit={() => onEdit(row.original)}
          onDelete={() => onDelete(row.original.id)}
        />
      ),
    },
  ];
};
