'use client';

import { DataTable } from '@/components/data-table';
import CreateData from '@/components/features/data/create-data';
import ParameterForm from './components/parameter-form';
import { parameterColumns } from './components/parameter-columns';

export default function UsersPage() {
  return (
    <div>
      <DataTable
        data={[] as any}
        columns={parameterColumns()}
        addNewRow={
          <CreateData
            buttonText="Tambah Parameter"
            modalTitle="Tambah Parameter Baru"
            modalDescription="Menambahkan parameter baru ke dalam sistem CPIS"
            content={<ParameterForm />}
          />
        }
      />
    </div>
  );
}
