import { ChemicalType } from '@/features/api/generated/prisma';
import { EFieldType, IFormFields } from '@/types/form/form.type';
import enumOptions from '@/utils/enumOptions';

export const chemicalFormFields: IFormFields[] = [
  {
    name: 'name',
    label: 'Nama Bahan Kimia',
    type: EFieldType.TEXT,
    className: 'col-span-2',
    description: '',
  },
  {
    name: 'code',
    label: 'Kode Bahan Kimia',
    type: EFieldType.TEXT,
    className: 'col-span-2',
    description: '',
    required: true,
  },
  {
    name: 'type',
    label: 'Tipe Peruntukan Bahan Kimia',
    type: EFieldType.ENUM,
    enumOptions: enumOptions(ChemicalType),
  },
  {
    name: 'unit',
    label: 'Satuan Bahan Kimia',
    type: EFieldType.TEXT,
    description: '',
  },
  {
    name: 'description',
    label: 'Penjelasan Bahan Kimia',
    type: EFieldType.TEXTAREA,
    className: 'col-span-2',
  },
];
