'use client';

import { DataTable } from '@/components/data-table';
import { IClient } from '@/types/client.type';
import React from 'react';
import { clientColumns } from './components/client-columns';
import CreateData from '@/components/features/data/create-data';
import ClientForm from './components/client-form';

export default function ClientsPage() {
  return (
    <div>
      <DataTable
        data={[] as IClient[]}
        columns={clientColumns()}
        addNewRow={
        <CreateData
        buttonText='Tambah Client'
        modalTitle='Tambah Client Baru'
        modalDescription='Menambahkan client baru ke dalam sistem CPIS'
        content={<ClientForm />}
        />
      }
      />
    </div>
  );
}
