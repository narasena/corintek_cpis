'use client';

import { DataTable } from '@/components/data-table';
import { IClient } from '@/types/client.type';
import React from 'react';
import { clientColumns } from './components/client-columns';

export default function ClientsPage() {
  return (
    <div>
      <DataTable
        data={[] as IClient[]}
        columns={clientColumns()}
        addNewRow={<></>}
      />
    </div>
  );
}
