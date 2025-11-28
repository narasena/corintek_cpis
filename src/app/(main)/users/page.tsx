'use client';

import { DataTable, ITableTab } from '@/components/data-table';
import { userColumns } from './components/user-columns';
import CreateData from '@/components/features/data/create-data';
import UserForm from './components/user-form';
import { IUser } from '@/types/user.type';
import useAllUsers from '@/hooks/users/useAllUsers';
import { Spinner } from '@/components/ui/spinner';
import { useCallback } from 'react';
import { UniqueIdentifier } from '@dnd-kit/core';
import deleteData from '@/utils/deleteData';

export default function UsersPage() {
  const { allUsers, loading, error } = useAllUsers();

  const handleDelete = useCallback(async (id: UniqueIdentifier) => {
    await deleteData(id, '/api/users');
  }, []);

  if (loading) {
    return (
      <Spinner className="size-12 text-gray-500 self-center items-center" />
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded-md bg-red-50">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  const usersTabs: ITableTab<IUser>[] = [
    {
      value: 'default',
      label: 'Default',
      data: allUsers,
      columns: userColumns({ handleDelete }),
      addNewRow: (
        <CreateData
          buttonText="Tambah User"
          modalTitle="Tambah User Baru"
          modalDescription="Menambahkan user baru ke dalam sistem CPIS"
          content={<UserForm />}
        />
      ),
    },
  ];

  return (
    <div>
      <DataTable tabs={usersTabs} />
    </div>
  );
}
