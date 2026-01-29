import { ValueType } from '@/features/api/generated/prisma/enums';
import { EFieldType, IFormFields } from '@/types/form/form.type';
import enumOptions from '@/utils/enumOptions';

export const parameterFormFields: IFormFields[] = [
  {
    name: 'name',
    label: 'Nama Parameter',
    type: EFieldType.TEXT,
    className: 'col-span-2',
    description: '',
  },
  {
    name: 'valueType',
    label: 'Tipe Nilai Parameter',
    type: EFieldType.ENUM,
    description: '',
    enumOptions: enumOptions(ValueType),
  },
  {
    name: 'unit',
    label: 'Satuan Parameter',
    type: EFieldType.TEXT,
    description: '',
  },
];
