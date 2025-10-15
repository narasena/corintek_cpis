import { ValueType } from '@/features/api/generated/prisma';
import { EFieldType, IFormFields } from '@/types/form/form.type';
import {
  IParameter,
  IParameterGroup,
  IStandardMethod,
} from '@/types/parameter.type';
import enumOptions from '@/utils/enumOptions';

interface IParameterLimitFormFields {
  allParameters: IParameter[];
  allParameterGroups: IParameterGroup[];
  allStandardMethods: IStandardMethod[];
}

export const parameterLimitFormFields = (
  data: IParameterLimitFormFields
): IFormFields[] => {
  return [
    {
      name: 'parameterId',
      label: 'Parameter',
      type: EFieldType.SELECT,
      description: 'Pilih parameter yang akan diberikan limit',
      selectData: data.allParameters.map(param => ({
        label: param.name,
        value: param.id,
      })),
    },
    {
      name: 'groupId',
      label: 'Grup Parameter',
      type: EFieldType.SELECT,
      description: 'Grup parameter (opsional)',
      selectData: data.allParameterGroups.map(group => ({
        label: group.name,
        value: group.id,
      })),
    },
    {
      name: 'methodId',
      label: 'Metode Standar',
      type: EFieldType.SELECT,
      description: 'ID metode standar (opsional)',
      selectData: data.allStandardMethods.map(method => ({
        label: method.methodName,
        value: method.id,
      })),
    },
    {
      name: 'valueType',
      label: 'Tipe Nilai',
      type: EFieldType.ENUM,
      description: 'Tipe nilai untuk limit parameter',
      enumOptions: enumOptions(ValueType),
    },
    {
      name: 'minValue',
      label: 'Nilai Minimum',
      type: EFieldType.NUMBER,
      description: 'Nilai minimum yang diperbolehkan (opsional)',
    },
    {
      name: 'maxValue',
      label: 'Nilai Maximum',
      type: EFieldType.NUMBER,
      description: 'Nilai maximum yang diperbolehkan (opsional)',
    },
    {
      name: 'booleanValue',
      label: 'Nilai Boolean',
      type: EFieldType.BOOLEAN,
      description: 'Nilai boolean jika tipe adalah boolean (opsional)',
    },
    {
      name: 'textValue',
      label: 'Nilai Teks',
      type: EFieldType.TEXT,
      description: 'Nilai teks jika tipe adalah text (opsional)',
    },
  ];
};
