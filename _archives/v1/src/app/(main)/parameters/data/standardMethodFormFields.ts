import { EFieldType, IFormFields } from '@/types/form/form.type';

export const standardMethodFormFields: IFormFields[] = [
  {
    name: 'methodName',
    label: 'Nama Metode',
    type: EFieldType.TEXT,
    description: 'Nama metode standar',
  },
  {
    name: 'year',
    label: 'Tahun',
    type: EFieldType.NUMBER,
    description: 'Tahun publikasi metode',
  },
  {
    name: 'version',
    label: 'Versi',
    type: EFieldType.TEXT,
    description: 'Versi metode standar',
  },
  {
    name: 'isActive',
    label: 'Status Aktif',
    type: EFieldType.BOOLEAN,
    description: 'Apakah metode ini aktif digunakan',
  },
  {
    name: 'description',
    label: 'Deskripsi',
    type: EFieldType.TEXTAREA,
    description: 'Deskripsi tambahan tentang metode (opsional)',
  },
];
