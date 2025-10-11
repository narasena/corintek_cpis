import { defaultColumns } from '@/components/default-columns';
import { IParameter } from '@/types/parameter.type';
import { ColumnDef } from '@tanstack/react-table';

export const parameterColumns = (): ColumnDef<IParameter>[] => {
  const { drag, select, actions } = defaultColumns<IParameter>();
  return [
    drag,
    select,
    {
      accessorKey: 'name',
      header: 'Nama Parameter',
    },
    {
      accessorKey: 'valueType',
      header: 'Tipe Nilai Parameter',
    },
    {
      accessorKey: 'unit',
      header: 'Satuan Parameter',
    },
    actions,
  ];
};
