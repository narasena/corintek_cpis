'use client';

import { ColumnDef } from '@tanstack/react-table';
import { TUserResponse } from '@/@types/user.type';
import { ActionCell } from '@/components/action-cell';
import { deleteUserAction } from '@/features/users/actions';

export const ROLE_OPTIONS = [
  { label: 'Semua', value: 'all' },
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Teknisi', value: 'TECHNICIAN' },
  { label: 'Supervisor', value: 'SUPERVISOR' },
  { label: 'Klien', value: 'CLIENT' },
];

export const STATUS_OPTIONS = [
  { label: 'Semua', value: 'all' },
  { label: 'Aktif', value: 'true' },
  { label: 'Nonaktif', value: 'false' },
];

interface IUserColumnsProps {
  onEdit: (user: TUserResponse) => void;
  onRefresh: () => void;
}

export const getUserColumns = ({
  onEdit,
  onRefresh,
}: IUserColumnsProps): ColumnDef<TUserResponse>[] => [
  {
    accessorKey: 'firstName',
    header: 'Nama Depan',
  },
  {
    accessorKey: 'lastName',
    header: 'Nama Belakang',
  },
  {
    accessorKey: 'email',
    header: 'Email',
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
    accessorKey: 'role',
    header: 'Peran',
    cell: ({ row }) => (
      <span className="text-xs bg-blue-200 dark:bg-blue-800 px-2 py-1 rounded">
        {row.original.role}
      </span>
    ),
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => (
      <span
        className={`text-xs px-2 py-1 rounded ${
          row.original.isActive
            ? 'bg-green-200 dark:bg-green-800'
            : 'bg-red-200 dark:bg-red-800'
        }`}
      >
        {row.original.isActive ? 'Aktif' : 'Nonaktif'}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <ActionCell
        data={row.original}
        entityName="Pengguna"
        getDisplayName={user => `${user.firstName} ${user.lastName}`}
        getEntityId={user => user.id}
        onEdit={() => onEdit(row.original)}
        onDelete={async id => {
          const result = await deleteUserAction(id);
          if (result.success) {
            onRefresh();
          }
          return result;
        }}
      />
    ),
  },
];
