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
import useAllParameterGroups from '@/hooks/parameters/useAllParameterGroups';

type TParameter =
  | IParameter
  | IParameterGroup
  | IParameterLimit
  | IStandardMethod;

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import useAllParameters from '@/hooks/parameters/useAllParameters';
import useAllParameterLimits from '@/hooks/parameters/useAllParameterLimits';

export default function ParametersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'parameter';

  const onTabChange = (value: string) => {
    router.push(`${pathname}?tab=${value}`);
  };

  const { allParameters, refetchAllParameters } = useAllParameters();
  const { allParameterGroups, refetchParameterGroups } =
    useAllParameterGroups();
  const { allParameterLimits, refetchAllParameterLimits } =
    useAllParameterLimits();
  const parametersTabs: ITableTab<TParameter>[] = [
    {
      value: 'parameter',
      label: 'Parameter',
      data: allParameters,
      columns: parameterColumns() as ColumnDef<TParameter>[],
      addNewRow: (
        <CreateData
          buttonText="Tambah Parameter"
          modalTitle="Tambah Parameter Baru"
          modalDescription="Menambahkan parameter baru ke dalam sistem CPIS"
          content={<ParameterForm refetch={refetchAllParameters} />}
        />
      ),
    },
    {
      value: 'parameterGroup',
      label: 'Grup Parameter',
      data: allParameterGroups,
      columns: parameterGroupColumns() as ColumnDef<TParameter>[],
      addNewRow: (
        <CreateData
          buttonText="Tambah Grup"
          modalTitle="Tambah Grup Parameter Baru"
          modalDescription="Menambahkan grup parameter baru ke dalam sistem CPIS"
          content={<ParameterGroupForm refetch={refetchParameterGroups} />}
        />
      ),
    },
    {
      value: 'parameterLimit',
      label: 'Limit Parameter',
      data: allParameterLimits,
      columns: parameterLimitColumns() as ColumnDef<TParameter>[],
      addNewRow: (
        <CreateData
          buttonText="Tambah Limit"
          modalTitle="Tambah Limit Parameter Baru"
          modalDescription="Menambahkan limit parameter baru ke dalam sistem CPIS"
          content={<ParameterLimitForm refetch={refetchAllParameterLimits} />}
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
      <DataTable tabs={parametersTabs} tab={tab} onTabChange={onTabChange} />
    </div>
  );
}
