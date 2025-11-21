import { MachineOwnership } from '@/features/api/generated/prisma/enums';
import { EFieldType, IFormFields } from '@/types/form/form.type';
import enumOptions from '@/utils/enumOptions';

export const machineFormFields: IFormFields[] = [
  {
    name: 'ownership',
    label: 'Kepmilikan Unit Mesin',
    type: EFieldType.ENUM,
    description: 'Pemilik mesin',
    enumOptions: enumOptions(MachineOwnership),
  },
  {
    name: 'capacity',
    label: 'Kapasitas Unit Mesin',
    type: EFieldType.NUMBER,
    description: 'Kapasitas mesin',
  },
  {
    name: 'brand',
    label: 'Merek Unit Mesin',
    type: EFieldType.TEXT,
    description: 'Merek unit mesin',
  },
  {
    name: 'model',
    label: 'Model Unit Mesin',
    type: EFieldType.TEXT,
    description: 'Model unit mesin',
  },
  {
    name: 'serialNumber',
    label: 'Nomor Seri Unit Mesin',
    type: EFieldType.TEXT,
    description: 'Nomor seri unit mesin',
  },
];
