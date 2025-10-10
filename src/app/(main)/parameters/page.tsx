'use client';

import { DataTable, ITableTab } from '@/components/data-table';
import CreateData from '@/components/features/data/create-data';
import ParameterForm from './components/parameter-form';
import { parameterColumns } from './components/parameter-columns';
import { IParameter, IParameterGroup } from '@/types/parameter.type';
import { ColumnDef } from '@tanstack/react-table';
import { parameterGroupColumns } from './components/parameter-group-columns';
import ParameterGroupForm from './components/parameter-group-form';

type TParameter = IParameter | IParameterGroup;

export default function UsersPage() {
  const parametersTabs: ITableTab<TParameter>[] = [
    {
      value: 'parameter',
      label: 'Parameter',
      data: [],
      columns: parameterColumns() as ColumnDef<TParameter>[],
      addNewRow: (
        <CreateData
          buttonText="Tambah Parameter"
          modalTitle="Tambah Parameter Baru"
          modalDescription="Menambahkan parameter baru ke dalam sistem CPIS"
          content={<ParameterForm />}
        />
      ),
    },
    {
      value: 'parameterGroup',
      label: 'Grup Parameter',
      data: [],
      columns: parameterGroupColumns() as ColumnDef<TParameter>[],
      addNewRow: (
        <CreateData
          buttonText="Tambah Grup"
          modalTitle="Tambah Grup Parameter Baru"
          modalDescription="Menambahkan grup parameter baru ke dalam sistem CPIS"
          content={<ParameterGroupForm />}
        />
      ),
    },
  ];
  return (
    <div>
      <DataTable tabs={parametersTabs} />
    </div>
  );
}
