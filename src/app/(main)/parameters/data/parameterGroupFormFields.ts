import { ParameterGroupType } from '@/features/api/generated/prisma';
import { EFieldType, IFormFields } from '@/types/form/form.type';

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
    enumOptions: Object.keys(ParameterGroupType).map(
      key => ParameterGroupType[key as keyof typeof ParameterGroupType]
    ) as string[],
  },
  {
    name: 'description',
    label: 'Penjelasan Grup Parameter',
    type: EFieldType.TEXT,
    description: '',
  },
];
