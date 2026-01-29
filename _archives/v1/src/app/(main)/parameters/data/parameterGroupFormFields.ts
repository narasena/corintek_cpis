import { ParameterGroupType } from '@/features/api/generated/prisma/enums';
import { EFieldType, IFormFields } from '@/types/form/form.type';
import enumOptions from '@/utils/enumOptions';

export const parameterGroupFormFields: IFormFields[] = [
  {
    name: 'name',
    label: 'Nama Grup Parameter',
    type: EFieldType.TEXT,
    className: 'col-span-2',
    description: '',
  },
  {
    name: 'type',
    label: 'Kategori Grup Parameter',
    type: EFieldType.ENUM,
    description: '',
    enumOptions: enumOptions(ParameterGroupType),
  },
  {
    name: 'description',
    label: 'Penjelasan Grup Parameter',
    type: EFieldType.TEXT,
    description: '',
  },
];
