import { TStandardMethodAttributes } from '@/types/parameter.type';
import { ColumnDef } from '@tanstack/react-table';

export const standardMethodColumns =
  (): ColumnDef<TStandardMethodAttributes>[] => {
    return [
      {
        accessorKey: 'methodName',
        header: 'Nama Metode',
      },
      {
        accessorKey: 'year',
        header: 'Tahun',
      },
      {
        accessorKey: 'version',
        header: 'Versi',
      },
      {
        accessorKey: 'isActive',
        header: 'Status Aktif',
        cell: ({ getValue }) => {
          const value = getValue() as boolean;
          return value ? 'Aktif' : 'Tidak Aktif';
        },
      },
      {
        accessorKey: 'description',
        header: 'Deskripsi',
      },
    ];
  };
