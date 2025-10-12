import { defaultColumns } from '@/components/default-columns';
import SlugData from '@/components/features/data/slug-data';
import { IParameterGroup } from '@/types/parameter.type';
import { ColumnDef } from '@tanstack/react-table';
import { ParametersPickerModal } from '@/app/(main)/parameters/components/parameters-picker-modal';

export const parameterGroupColumns = (): ColumnDef<IParameterGroup>[] => {
  const { drag, select, actions } = defaultColumns<IParameterGroup>();
  return [
    drag,
    select,
    {
      accessorKey: 'name',
      header: 'Nama Parameter',
      cell: ({ row }) => {
        return (
          <SlugData
            type="nameSlug"
            buttonText={row.original.name}
            modalTitle={`Kelola Parameter - ${row.original.name}`}
            modalDescription={`Atur parameter yang termasuk dalam grup ${row.original.name}`}
            content={<ParametersPickerModal group={row.original} />}
          />
        );
      },
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
