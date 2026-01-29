'use client';

import { DataTable, ITableTab } from '@/components/data-table';
import CreateData from '@/components/features/data/create-data';
import ChemicalForm from './components/chemical-form';
import { IChemical } from '@/types/chemical.type';
import { chemicalColumns } from './components/chemical-columns';
import useAllChemicals from '@/hooks/chemicals/useAllChemicals';
import { Spinner } from '@/components/ui/spinner';

export default function ChemicalPage() {
  const { allChemicals, loading, error, refetchAllChemicals } =
    useAllChemicals();
  if (loading) {
    return (
      <Spinner className="size-12 text-gray-500 self-center items-center" />
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded-md bg-red-50">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }
  const chemicalTabs: ITableTab<IChemical>[] = [
    {
      value: 'default',
      label: 'Default',
      data: allChemicals,
      columns: chemicalColumns(),
      addNewRow: (
        <CreateData
          buttonText="Tambah Bahan Kimia"
          modalTitle="Tambah Bahan Kimia Baru"
          modalDescription="Menambahkan bahan kimia baru ke dalam sistem CPIS"
          content={<ChemicalForm refetch={refetchAllChemicals} />}
        />
      ),
    },
  ];
  return <DataTable tabs={chemicalTabs} />;
}
