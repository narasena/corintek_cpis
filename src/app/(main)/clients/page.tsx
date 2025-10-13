'use client';

import { DataTable, ITableTab } from '@/components/data-table';
import React from 'react';
import { clientColumns } from './components/client-columns';
import CreateData from '@/components/features/data/create-data';
import ClientForm from './components/client-form';
import { IClient } from '@/types/client.type';
// import { Skeleton } from '@/components/ui/skeleton';
import useAllClients from '@/hooks/clients/useAllClients';
import { Spinner } from '@/components/ui/spinner';

export default function ClientsPage() {
  const { allClients, loading, error } = useAllClients();

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

  const clientsTabs: ITableTab<IClient>[] = [
    {
      value: 'default',
      label: 'Default',
      data: allClients,
      columns: clientColumns(),
      addNewRow: (
        <CreateData
          buttonText="Tambah Client"
          modalTitle="Tambah Client Baru"
          modalDescription="Menambahkan client baru ke dalam sistem CPIS"
          content={<ClientForm />}
        />
      ),
    },
  ];
  return (
    <div>
      <DataTable tabs={clientsTabs} />
    </div>
  );
}
