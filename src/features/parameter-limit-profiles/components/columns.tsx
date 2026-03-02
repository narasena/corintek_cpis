import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import type { IParameterLimitMasterItem } from '../../parameters/types';
import type { IParameterLimitProfile } from '../types';

type TParameterLimitColumnDeps = {
  onEdit: (limit: IParameterLimitMasterItem) => void;
};

export function getParameterLimitColumns(
  deps: TParameterLimitColumnDeps
): ColumnDef<IParameterLimitMasterItem>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Parameter
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Kategori',
    },
    {
      accessorKey: 'unit',
      header: 'Satuan',
      cell: ({ row }) => row.getValue('unit') || '-',
    },
    {
      accessorKey: 'minValue',
      header: 'Min',
      cell: ({ row }) => {
        const val = row.getValue('minValue');
        return val !== null ? val : '-';
      },
    },
    {
      accessorKey: 'maxValue',
      header: 'Max',
      cell: ({ row }) => {
        const val = row.getValue('maxValue');
        return val !== null ? val : '-';
      },
    },
    {
      accessorKey: 'rawWaterMinValue',
      header: 'Air Mentah Min',
      cell: ({ row }) => {
        const val = row.getValue('rawWaterMinValue');
        return val !== null ? val : '-';
      },
    },
    {
      accessorKey: 'rawWaterMaxValue',
      header: 'Air Mentah Max',
      cell: ({ row }) => {
        const val = row.getValue('rawWaterMaxValue');
        return val !== null ? val : '-';
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const limit = row.original;
        return (
          <Button variant="ghost" size="sm" onClick={() => deps.onEdit(limit)}>
            Ubah
          </Button>
        );
      },
    },
  ];
}

type TProfileColumnDeps = {
  onEdit: (profile: IParameterLimitProfile) => void;
  onRefresh: () => void;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
};

export function getProfileColumns(
  deps: TProfileColumnDeps
): ColumnDef<IParameterLimitProfile>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Nama
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: 'description',
      header: 'Deskripsi',
      cell: ({ row }) => row.getValue('description') || '-',
    },
    {
      accessorKey: 'isDefault',
      header: 'Default',
      cell: ({ row }) => {
        const isDefault = row.getValue('isDefault') as boolean;
        return isDefault ? (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            Default
          </Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const profile = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deps.onEdit(profile)}
            >
              Ubah
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600"
              onClick={async () => {
                if (confirm('Apakah Anda yakin ingin menghapus profil ini?')) {
                  await deps.onDelete(profile.id);
                  deps.onRefresh();
                }
              }}
            >
              Hapus
            </Button>
          </div>
        );
      },
    },
  ];
}
