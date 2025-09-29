import Modal from '@/components/modal';
import { Button } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';
import * as React from 'react';
import UserForm from './user-form';
import CreateData from '@/components/features/data/create-data';

export default function CreateUser() {
  return (
    <CreateData
    buttonText='Tambah User'
    modalTitle='Tambah User Baru'
    modalDescription='Menambahkan user baru ke dalam sistem CPIS'
    content={<UserForm />}
    />
  );
}
