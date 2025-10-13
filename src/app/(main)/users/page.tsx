'use client';

import { DataTable, ITableTab } from '@/components/data-table';
import { userColumns } from './components/user-columns';
import useUsers from './hooks/useUsers';
import CreateData from '@/components/features/data/create-data';
import UserForm from './components/user-form';
import { IUser } from '@/types/user.type';

export default function UsersPage() {
  const { allUsers } = useUsers();
  console.log(allUsers);
  const usersTabs: ITableTab<IUser>[] = [
    {
      value: 'default',
      label: 'Default',
      data: allUsers,
      columns: userColumns(),
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
