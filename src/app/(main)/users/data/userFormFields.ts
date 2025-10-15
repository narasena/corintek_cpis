import { EmploymentStatus } from '@/features/api/generated/prisma';
import { EFieldType, IFormFields } from '@/types/form/form.type';
import enumOptions from '@/utils/enumOptions';
import { IconLockFilled } from '@tabler/icons-react';
import { allowedUserRoles } from '../schemas/userSchema';

export const createUserFormFields: IFormFields[] = [
  {
    name: 'firstName',
    type: EFieldType.TEXT,
    label: 'Nama Depan',
    placeHolder: 'John',
    description: 'Masukkan nama depan sesuai dengan yang terdaftar di Corintek',
  },
  {
    name: 'lastName',
    type: EFieldType.TEXT,
    label: 'Nama Belakang',
    placeHolder: 'Doe',
    description:
      'Masukkan nama belakang sesuai dengan yang terdaftar di Corintek',
  },
  {
    name: 'idNumber',
    type: EFieldType.TEXT,
    label: 'ID Number',
    placeHolder: 'ID-12345',
    description:
      'Masukkan nomor identitas sesuai dengan yang terdaftar di Corintek',
  },
  {
    name: 'phoneNumber',
    type: EFieldType.TEXT,
    label: 'Nomor Telepon',
    placeHolder: '088812345678',
    description:
      'Masukkan nomor telepon sesuai dengan yang terdaftar di Corintek',
  },
  {
    name: 'email',
    type: EFieldType.EMAIL,
    className: 'col-span-2',
    label: 'Email',
    placeHolder: 'Y2mE2@example.com',
    description: 'Masukkan email sesuai dengan yang terdaftar di Corintek',
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
    description: 'Masukkan role sesuai dengan yang terdaftar di Corintek',
    enumOptions: enumOptions(allowedUserRoles),
  },
  {
    name: 'employmentStatus',
    type: EFieldType.ENUM,
    label: 'Employment Status',
    placeHolder: 'Pilih Salah Satu',
    description:
      'Masukkan status kerja sesuai dengan yang terdaftar di Corintek',
    enumOptions: enumOptions(EmploymentStatus),
  },
];

export const editUserFormFields: IFormFields[] = [
  ...createUserFormFields,
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
