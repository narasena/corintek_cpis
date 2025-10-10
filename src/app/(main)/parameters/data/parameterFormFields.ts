import { ParameterType, ValueType } from '@/features/api/generated/prisma';
import { EFieldType, IFormFields } from '@/types/form/form.type';
import React from 'react';
import { ControllerRenderProps, FieldValues, Path } from 'react-hook-form';
import { SelectParameterGroup } from '../components/select-parameter-group';

export const parameterFormFields: IFormFields[] = [
  {
    name: 'name',
    label: 'Nama Parameter',
    type: EFieldType.TEXT,
    className: 'col-span-2',
    description: '',
  },
  {
    name: 'type',
    label: 'Peruntukan Parameter',
    type: EFieldType.ENUM,
    description: '',
    enumOptions: Object.keys(ParameterType).map(
      key => ParameterType[key as keyof typeof ParameterType]
    ) as string[],
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
  {
    name: 'groupId',
    label: 'Grup Parameter',
    type: EFieldType.CUSTOM,
    description: '',
    customComponent: (
      field: ControllerRenderProps<FieldValues, Path<FieldValues>>
    ) => React.createElement(SelectParameterGroup, { field, data: [] as any }),
  },
];
