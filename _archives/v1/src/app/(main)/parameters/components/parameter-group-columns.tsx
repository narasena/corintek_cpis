import { defaultColumns } from '@/components/default-columns';
import SlugData from '@/components/features/data/slug-data';
import { IParameterGroup } from '@/types/parameter.type';
import { ColumnDef } from '@tanstack/react-table';
import { ParametersPickerModal } from '@/app/(main)/parameters/components/parameters-picker-modal';
import ParameterGroupForm from './parameter-group-form';
import { UniqueIdentifier } from '@dnd-kit/core';
import { IDefaultFormComponentProps } from '@/types/form/form.type';

interface IParameterGroupColumnsParams extends IDefaultFormComponentProps {}

export const parameterGroupColumns = (
  params: IParameterGroupColumnsParams
): ColumnDef<IParameterGroup>[] => {
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
    actions({
      handleEdit: (id: UniqueIdentifier) => {
        return (
          <div className="space-y-4">
            <p>Apakah Anda yakin ingin mengedit parameter group ini?</p>
            <ParameterGroupForm
              id={id as string}
              type="update"
              refetch={params.refetch}
            />
          </div>
        );
      },
    }),
  ];
};
