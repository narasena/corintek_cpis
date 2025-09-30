'use client';

import { DataTable } from '@/components/data-table';
import CreateData from '@/components/features/data/create-data';
import { IProject } from '@/types/project.type';
import React from 'react';
import { projectColumns } from './components/project-columns';

export default function page() {
  return (
    <div>
      <DataTable
        data={[] as IProject[]}
        columns={projectColumns()}
        addNewRow={
          <CreateData
            buttonText="Tambah Client"
            modalTitle="Tambah Client Baru"
            modalDescription="Menambahkan client baru ke dalam sistem CPIS"
            content={<></>}
          />
        }
      />
    </div>
  );
}
