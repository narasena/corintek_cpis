import { EFieldType, IFormFields } from '@/types/form/form.type';

export const parameterLimitFormFields: IFormFields[] = [
  {
    name: 'parameterId',
    label: 'Parameter ID',
    type: EFieldType.TEXT,
    description: 'ID parameter yang akan diberikan limit',
  },
  {
    name: 'methodId',
    label: 'Method ID',
    type: EFieldType.TEXT,
    description: 'ID metode standar (opsional)',
  },
  {
    name: 'valueType',
    label: 'Tipe Nilai',
    type: EFieldType.TEXT,
    description: 'Tipe nilai untuk limit parameter',
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
