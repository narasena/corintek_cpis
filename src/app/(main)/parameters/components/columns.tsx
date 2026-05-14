'use client';

import { ColumnDef } from '@tanstack/react-table';
import { IParameter, TParameterCategory } from '@/features/parameters/types';
import { ActionCell } from '@/components/action-cell';
import { Badge } from '@/components/ui/badge';
import { CATEGORY_LABELS } from '@/features/parameters/constants';

interface GetColumnsProps {
  onEdit: (parameter: IParameter) => void;
  onRefresh: () => void;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
}

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
        const category = row.getValue('category') as TParameterCategory;
        return (
          <span className="text-sm">
            {CATEGORY_LABELS[category] || category}
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
