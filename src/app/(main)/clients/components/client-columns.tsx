'use client';

import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { TClientResponse } from '@/@types/client.type';
import { ActionCell } from '@/components/action-cell';
import { deleteClientAction } from '@/features/clients/actions';
import { Button } from '@/components/ui/button';
import { Users, ExternalLink } from 'lucide-react';

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
    accessorKey: 'website',
    header: 'Website',
    cell: ({ row }) => {
      const website = row.original.website;
      if (!website) return '-';
      return (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-blue-600 hover:underline"
        >
          <span className="truncate max-w-[150px]">
            {website.replace(/^https?:\/\//, '')}
          </span>
          <ExternalLink className="h-3 w-3" />
        </a>
      );
    },
  },
  {
    id: 'personnel',
    header: 'Personel',
    cell: ({ row }) => (
      <Button variant="outline" size="sm" asChild>
        <Link href={`/users?clientId=${row.original.id}`}>
          <Users className="h-4 w-4 mr-1" />
          Personel
        </Link>
      </Button>
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
