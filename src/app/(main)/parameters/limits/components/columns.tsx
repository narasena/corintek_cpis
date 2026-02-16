'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ActionCell } from '@/components/action-cell';
import { Badge } from '@/components/ui/badge';
import {
  formatNumericLimit,
  formatRawWaterLimit,
} from '@/features/parameters/limits-format';
import type { IParameterLimitMasterItem } from '@/features/parameters/types';

interface GetColumnsProps {
  onEdit: (row: IParameterLimitMasterItem) => void;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
}

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

export const getParameterLimitColumns = ({
  onEdit,
  onDelete,
}: GetColumnsProps): ColumnDef<IParameterLimitMasterItem>[] => {
  return [
    {
      accessorKey: 'name',
      header: 'Parameter',
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
      header: 'Tipe',
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
      id: 'limits',
      header: 'Limits',
      cell: ({ row }) =>
        formatNumericLimit(
          row.original.minValue,
          row.original.maxValue,
          row.original.unit
        ),
    },
    {
      id: 'rawLimits',
      header: 'Raw Limits',
      cell: ({ row }) =>
        formatRawWaterLimit(
          row.original.rawWaterMinValue,
          row.original.rawWaterMaxValue,
          row.original.unit
        ),
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
          getEntityId={param => param.parameterId}
          onEdit={() => onEdit(row.original)}
          onDelete={() => onDelete(row.original.parameterId)}
        />
      ),
    },
  ];
};
