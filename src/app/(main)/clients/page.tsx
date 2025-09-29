'use client';

import { DataTable } from '@/components/data-table';
import { IClient } from '@/types/client.type';
import React from 'react';
import CreateUser from '../users/components/create-user';
import { clientColumns } from './components/client-columns';

export default function ClientsPage() {
  return (
    <div>
      <DataTable
        data={[] as IClient[]}
        columns={clientColumns()}
        addNewRow={<CreateUser />}
      />
    </div>
  );
}
