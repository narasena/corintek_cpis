'use client';

import { DataTable, ITableTab } from '@/components/data-table';
import CreateData from '@/components/features/data/create-data';
import ParameterForm from './components/parameter-form';
import { parameterColumns } from './components/parameter-columns';
import {
  IParameter,
  IParameterGroup,
  IParameterLimit,
  IStandardMethod,
} from '@/types/parameter.type';
import { ColumnDef } from '@tanstack/react-table';
import { parameterGroupColumns } from './components/parameter-group-columns';
import ParameterGroupForm from './components/parameter-group-form';
import ParameterLimitForm from './components/parameter-limit-form';
import { parameterLimitColumns } from './components/parameter-limit-columns';
import StandardMethodForm from './components/standard-method-form';
import { standardMethodColumns } from './components/standard-method-columns';

type TParameter =
  | IParameter
  | IParameterGroup
  | IParameterLimit
  | IStandardMethod;

export default function ParametersPage() {
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
    {
      value: 'parameterLimit',
      label: 'Limit Parameter',
      data: [],
      columns: parameterLimitColumns() as ColumnDef<TParameter>[],
      addNewRow: (
        <CreateData
          buttonText="Tambah Limit"
          modalTitle="Tambah Limit Parameter Baru"
          modalDescription="Menambahkan limit parameter baru ke dalam sistem CPIS"
          content={<ParameterLimitForm />}
        />
      ),
    },
    {
      value: 'standardMethod',
      label: 'Metode Standar',
      data: [],
      columns: standardMethodColumns() as ColumnDef<TParameter>[],
      addNewRow: (
        <CreateData
          buttonText="Tambah Metode"
          modalTitle="Tambah Metode Standar Baru"
          modalDescription="Menambahkan metode standar baru ke dalam sistem CPIS"
          content={<StandardMethodForm />}
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
