import { EmploymentStatus } from '@/features/api/generated/prisma';
import { clientPersonnelRoles } from '../../users/components/user-columns';
import { EFieldType, IFormFields } from '@/types/form/form.type';
import enumOptions from '@/utils/enumOptions';
import { IconLockFilled } from '@tabler/icons-react';

export const createClientPICFormFields: IFormFields[] = [
  {
    name: 'firstName',
    type: EFieldType.TEXT,
    label: 'Nama Depan',
    placeHolder: 'John',
    description: 'Masukkan nama depan PIC Klien',
  },
  {
    name: 'lastName',
    type: EFieldType.TEXT,
    label: 'Nama Belakang',
    placeHolder: 'Doe',
    description: 'Masukkan nama belakang PIC Klien',
  },
  {
    name: 'idNumber',
    type: EFieldType.TEXT,
    label: 'ID Number',
    placeHolder: 'ID-12345',
    description: 'Masukkan nomor identitas PIC Klien',
  },
  {
    name: 'phoneNumber',
    type: EFieldType.TEXT,
    label: 'Nomor Telepon',
    placeHolder: '088812345678',
    description: 'Masukkan nomor telepon PIC Klien',
  },
  {
    name: 'email',
    type: EFieldType.EMAIL,
    className: 'col-span-2',
    label: 'Email',
    placeHolder: 'Y2mE2@example.com',
    description: 'Masukkan email PIC Klien',
  },
  {
    name: 'password',
    type: EFieldType.PASSWORD,
    label: 'Password',
    placeHolder: 'Password',
    description: 'Buat password untuk user',
  },
  {
    name: 'confirmPassword',
    type: EFieldType.PASSWORD,
    label: 'Konfirmasi Password',
    placeHolder: 'Password',
    description: 'Konfirmasi password untuk user',
  },
  {
    name: 'role',
    type: EFieldType.ENUM,
    label: 'Role',
    placeHolder: 'Pilih Salah Satu',
    description: 'Masukkan role PIC Klien',
    enumOptions: clientPersonnelRoles.map(r => r.role),
  },
  {
    name: 'employmentStatus',
    type: EFieldType.ENUM,
    label: 'Employment Status',
    placeHolder: 'Pilih Salah Satu',
    description: 'Masukkan status kerja PIC Klien',
    enumOptions: enumOptions(EmploymentStatus),
  },
];

export const editClientPICFormFields: IFormFields[] = [
  ...createClientPICFormFields,
  {
    name: 'isActive',
    type: EFieldType.BOOLEAN,
    label: 'Aktif',
    placeHolder: 'true',
    description: 'Masih aktif bekerja',
  },
  {
    name: 'isBlocked',
    icon: IconLockFilled,
    type: EFieldType.BOOLEAN,
    label: 'Blokir',
    placeHolder: 'false',
    description: 'Blokir / batasi akses user / pengguna',
  },
];
