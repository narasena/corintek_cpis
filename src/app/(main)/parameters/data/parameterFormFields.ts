import { ValueType } from '@/features/api/generated/prisma';
import { EFieldType, IFormFields } from '@/types/form/form.type';

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
    enumOptions: Object.keys(ValueType).map(
      key => ValueType[key as keyof typeof ValueType]
    ) as string[],
  },
  {
    name: 'unit',
    label: 'Satuan Parameter',
    type: EFieldType.TEXT,
    description: '',
  },
];
