'use client';

import { ColumnDef } from '@tanstack/react-table';
import { TClientResponse } from '@/@types/client.type';
import { ActionCell } from '@/components/action-cell';
import { deleteClientAction } from '@/features/clients/actions';

interface IClientColumnsProps {
  onEdit: (client: TClientResponse) => void;
  onRefresh: () => void;
}

export const getClientColumns = ({
  onEdit,
  onRefresh,
}: IClientColumnsProps): ColumnDef<TClientResponse>[] => [
  {
    accessorKey: 'name',
    header: 'Nama',
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => row.original.email || '-',
  },
  {
    accessorKey: 'phoneNumber',
    header: 'Telepon',
    cell: ({ row }) => row.original.phoneNumber || '-',
  },
  {
    accessorKey: 'address',
    header: 'Alamat',
    cell: ({ row }) => (
      <span
        className="max-w-xs truncate block"
        title={row.original.address || ''}
      >
        {row.original.address || '-'}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <ActionCell
        data={row.original}
        entityName="Klien"
        getDisplayName={client => client.name}
        getEntityId={client => client.id}
        onEdit={() => onEdit(row.original)}
        onDelete={async id => {
          const result = await deleteClientAction(id);
          if (result.success) {
            onRefresh();
          }
          return result;
        }}
      />
    ),
  },
];
