'use client';

import { DataTable, ITableTab } from '@/components/data-table';
import React from 'react';
import { clientColumns } from './components/client-columns';
import CreateData from '@/components/features/data/create-data';
import ClientForm from './components/client-form';
import useClients from './hooks/useClients';
import { IClient } from '@/types/client.type';

export default function ClientsPage() {
  const { allClients } = useClients();
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
