import { TParameterLimitAttributes } from '@/types/parameter.type';
import { ColumnDef } from '@tanstack/react-table';

export const parameterLimitColumns =
  (): ColumnDef<TParameterLimitAttributes>[] => {
    return [
      {
        accessorKey: 'parameterId',
        header: 'Parameter ID',
      },
      {
        accessorKey: 'methodId',
        header: 'Method ID',
      },
      {
        accessorKey: 'valueType',
        header: 'Tipe Nilai',
      },
      {
        accessorKey: 'minValue',
        header: 'Nilai Minimum',
        cell: ({ getValue }) => {
          const value = getValue() as number;
          return value ? value.toString() : '-';
        },
      },
      {
        accessorKey: 'maxValue',
        header: 'Nilai Maximum',
        cell: ({ getValue }) => {
          const value = getValue() as number;
          return value ? value.toString() : '-';
        },
      },
      {
        accessorKey: 'booleanValue',
        header: 'Nilai Boolean',
        cell: ({ getValue }) => {
          const value = getValue() as boolean;
          return value !== undefined ? (value ? 'Ya' : 'Tidak') : '-';
        },
      },
      {
        accessorKey: 'textValue',
        header: 'Nilai Teks',
      },
    ];
  };
