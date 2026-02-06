'use client';

import { ColumnDef } from '@tanstack/react-table';
import { TChemical, ChemicalCategoryLabel } from '@/@types/chemical.type';
import { ActionCell } from '@/components/action-cell';
import { deleteChemicalAction } from '@/features/chemicals/actions';

interface IChemicalColumnsProps {
  onEdit: (chemical: TChemical) => void;
  onRefresh: () => void;
}

export const getChemicalColumns = ({
  onEdit,
  onRefresh,
}: IChemicalColumnsProps): ColumnDef<TChemical>[] => [
  {
    accessorKey: 'name',
    header: 'Nama',
  },
  {
    accessorKey: 'category',
    header: 'Kategori',
    cell: ({ row }) => ChemicalCategoryLabel[row.original.category],
  },
  {
    accessorKey: 'unit',
    header: 'Satuan',
  },
  {
    accessorKey: 'description',
    header: 'Deskripsi',
    cell: ({ row }) => (
      <span
        className="max-w-xs truncate block"
        title={row.original.description || ''}
      >
        {row.original.description || '-'}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <ActionCell
        data={row.original}
        entityName="Chemical"
        getDisplayName={chemical => chemical.name}
        getEntityId={chemical => chemical.id}
        onEdit={() => onEdit(row.original)}
        onDelete={async id => {
          const result = await deleteChemicalAction(id);
          if (result.success) {
            onRefresh();
          }
          return result;
        }}
      />
    ),
  },
];
