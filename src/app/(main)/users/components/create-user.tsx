import Modal from '@/components/modal';
import { Button } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';
import * as React from 'react';
import UserForm from './user-form';

export default function CreateUser() {
  return (
    <Modal
      trigger={
        <Button variant="outline" size="sm">
          <IconPlus />
          <span className="hidden lg:inline">Tambah User</span>
        </Button>
      }
      title="Tambah User Baru"
      description="Menambahkan user baru ke dalam sistem CPIS"
      content={<UserForm />}
    />
  );
}
