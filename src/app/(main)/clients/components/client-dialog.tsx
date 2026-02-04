'use client';

import { CrudDialog } from '@/components/crud-dialog';
import { ClientForm } from './client-form';
import { TClientResponse } from '@/@types/client.type';

interface IClientDialogProps {
  mode: 'create' | 'edit';
  client?: TClientResponse;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ClientDialog({
  mode,
  client,
  trigger,
  open,
  onOpenChange,
  onSuccess,
}: IClientDialogProps) {
  const title = mode === 'create' ? 'Tambah Klien Baru' : 'Ubah Data Klien';

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
        <ClientForm
          mode={mode}
          defaultValues={client}
          onSuccess={handleSuccess}
          onCancel={onCancel}
        />
      )}
    </CrudDialog>
  );
}
