'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = open !== undefined;
  const show = isControlled ? open : internalOpen;
  const setShow = isControlled ? onOpenChange : setInternalOpen;

  const handleSuccess = () => {
    setShow?.(false);
    onSuccess?.();
  };

  return (
    <Dialog open={show} onOpenChange={setShow}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Tambah Klien Baru' : 'Edit Data Klien'}
          </DialogTitle>
        </DialogHeader>
        <ClientForm
          mode={mode}
          defaultValues={client}
          onSuccess={handleSuccess}
          onCancel={() => setShow?.(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
