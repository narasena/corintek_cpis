'use client';

import { DataTable } from '@/components/data-table';
import React from 'react';
import { clientColumns } from './components/client-columns';
import CreateData from '@/components/features/data/create-data';
import ClientForm from './components/client-form';
import useClients from './hooks/useClients';

export default function ClientsPage() {
  const { clients } = useClients();
  return (
    <div>
      <DataTable
        data={clients}
        columns={clientColumns()}
        addNewRow={
          <CreateData
            buttonText="Tambah Client"
            modalTitle="Tambah Client Baru"
            modalDescription="Menambahkan client baru ke dalam sistem CPIS"
            content={<ClientForm />}
          />
        }
      />
    </div>
  );
}
