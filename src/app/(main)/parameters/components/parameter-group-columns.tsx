import { defaultColumns } from '@/components/default-columns';
import { IParameterGroup } from '@/types/parameter.type';
import { ColumnDef } from '@tanstack/react-table';

export const parameterGroupColumns = (): ColumnDef<IParameterGroup>[] => {
  const { drag, select, actions } = defaultColumns<IParameterGroup>();
  return [
    drag,
    select,
    {
      accessorKey: 'name',
      header: 'Nama Parameter',
    },
    {
      accessorKey: 'type',
      header: 'Kategori Grup Parameter',
    },
    {
      accessorKey: 'description',
      header: 'Penjelasan',
    },
    actions,
  ];
};
