import { defaultColumns } from '@/components/default-columns';
import { IChemical } from '@/types/chemical.type';
import { ColumnDef } from '@tanstack/react-table';

export const chemicalColumns = (): ColumnDef<IChemical>[] => {
  const { drag, select, actions } = defaultColumns<IChemical>();
  return [
    drag,
    select,
    {
      accessorKey: 'code',
      header: 'Kode Bahan Kimia',
    },
    {
      accessorKey: 'name',
      header: 'Nama Bahan Kimia',
    },
    {
      accessorKey: 'type',
      header: 'Tipe Peruntukan Bahan Kimia',
    },
    {
      accessorKey: 'unit',
      header: 'Satuan Bahan Kimia',
      cell: ({ row }) => {
        return row.original.unit ?? '-';
      },
    },
    {
      accessorKey: 'description',
      header: 'Penjelasan',
      cell: ({ row }) => {
        return row.original.description ?? '-';
      },
    },
    actions(),
  ];
};
