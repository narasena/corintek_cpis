import { IconLockFilled } from "@tabler/icons-react";

export const formFields = [
    {
      name: 'firstName',
      type: 'text',
      label: 'Nama Depan',
      placeHolder: 'John',
      description:
        'Masukkan nama depan sesuai dengan yang terdaftar di perusahaan Anda bekerja',
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'Nama Belakang',
      placeHolder: 'Doe',
      description:
        'Masukkan nama belakang sesuai dengan yang terdaftar di perusahaan Anda bekerja',
    },
    {
      name: 'idNumber',
      type: 'text',
      label: 'ID Number',
      placeHolder: 'ID-12345',
      description:
        'Masukkan nomor identitas sesuai dengan yang terdaftar di perusahaan Anda bekerja',
    },
    {
      name: 'phoneNumber',
      type: 'text',
      label: 'Nomor Telepon',
      placeHolder: '088812345678',
      description:
        'Masukkan nomor telepon sesuai dengan yang terdaftar di perusahaan Anda bekerja',
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      placeHolder: 'Y2mE2@example.com',
      description:
        'Masukkan email sesuai dengan yang terdaftar di perusahaan Anda bekerja',
    },
    {
      name: 'password',
      type: 'password',
      label: 'Password',
      placeHolder: 'Password',
      description: "Buat password untuk user"
    },
    {
      name: 'role',
      type: 'selectEnum',
      label: 'Role',
      placeHolder: 'Pilih Salah Satu',
      description:
        'Masukkan role sesuai dengan yang terdaftar di perusahaan Anda bekerja',
    },
    {
      name: 'employmentStatus',
      type: 'selectEnum',
      label: 'Employment Status',
      placeHolder: 'Pilih Salah Satu',
      description:
        'Masukkan status kerja sesuai dengan yang terdaftar di perusahaan Anda bekerja',
    },
    {
      name: 'isActive',
      type: 'boolean',
      label: 'Aktif',
      placeHolder: 'true',
      description:
        'Masih aktif bekerja',
    },
    {
      name: 'isBlocked',
      icon: IconLockFilled,
      type: 'boolean',
      label: 'Blokir',
      placeHolder: 'false',
      description:
        'Blokir / batasi akses user / pengguna',
    },
  ];