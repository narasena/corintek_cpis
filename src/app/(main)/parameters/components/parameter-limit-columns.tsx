import { IParameterLimit } from '@/types/parameter.type';
import { ColumnDef } from '@tanstack/react-table';

export const parameterLimitColumns = (): ColumnDef<IParameterLimit>[] => {
  return [
    {
      accessorKey: 'parameter.name',
      header: 'Parameter',
    },
    {
      accessorKey: 'method.methodName',
      header: 'Metode Standar',
    },
    {
      accessorKey: 'group.name',
      header: 'Grup Parameter',
    },
    {
      accessorKey: 'valueType',
      header: 'Tipe Nilai',
    },
    {
      accessorKey: 'minValue',
      header: 'Nilai Minimum',
      cell: ({ row, getValue }) => {
        const value = getValue() as number;
        return value
          ? value.toString() + ' ' + row.original.parameter.unit
          : '-';
      },
    },
    {
      accessorKey: 'maxValue',
      header: 'Nilai Maximum',
      cell: ({ row, getValue }) => {
        const value = getValue() as number;
        return value
          ? value.toString() + ' ' + row.original.parameter.unit
          : '-';
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
