import { defaultColumns } from '@/components/default-columns';
import SlugData from '@/components/features/data/slug-data';
import { IClient } from '@/types/client.type';
import { ColumnDef } from '@tanstack/react-table';
import ClientData from './client-data';

export const clientColumns = (): ColumnDef<IClient>[] => {
  const { drag, select, email, phoneNumber, actions } =
    defaultColumns<IClient>();
  return [
    drag,
    select,
    {
      accessorKey: 'name',
      header: 'Client',
      cell: ({ row }) => {
        return (
          <SlugData
            type="nameSlug"
            onClick={() => {}}
            buttonText={row.original.name}
            modalTitle={row.original.name}
            modalDescription={row.original.description || ''}
            content={<ClientData />}
          />
        );
      },
    },
    email,
    phoneNumber,
    {
      accessorKey: 'websiteUrl',
      header: 'Website',
    },
    actions,
  ];
};
