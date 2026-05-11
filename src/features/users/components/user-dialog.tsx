'use client';

import { CrudDialog } from '@/components/crud-dialog';
import { UserForm } from './user-form';
import { TUserResponse } from '@/@types/user.type';

interface IUserDialogProps {
  mode: 'create' | 'edit';
  user?: TUserResponse;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  canResetPassword?: boolean;
}

export function UserDialog({
  mode,
  user,
  trigger,
  open,
  onOpenChange,
  onSuccess,
  canResetPassword,
}: IUserDialogProps) {
  const title =
    mode === 'create' ? 'Tambah Pengguna Baru' : 'Ubah Data Pengguna';

  return (
    <CrudDialog
      mode={mode}
      title={title}
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
    >
      {({ onSuccess: handleSuccess, onCancel }) => (
        <UserForm
          mode={mode}
          defaultValues={user}
          onSuccess={handleSuccess}
          onCancel={onCancel}
          canResetPassword={canResetPassword}
        />
      )}
    </CrudDialog>
  );
}
