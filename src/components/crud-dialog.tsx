'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ICrudDialogProps {
  mode: 'create' | 'edit';
  title?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  children:
    | React.ReactNode
    | ((props: {
        onSuccess: () => void;
        onCancel: () => void;
      }) => React.ReactNode);
}

export function CrudDialog({
  mode,
  title,
  trigger,
  open,
  onOpenChange,
  onSuccess,
  children,
}: ICrudDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = open !== undefined;
  const show = isControlled ? open : internalOpen;
  const setShow = isControlled ? onOpenChange : setInternalOpen;

  const handleSuccess = () => {
    setShow?.(false);
    onSuccess?.();
  };

  // Pass handleSuccess to children if they need it
  const childrenWithProps =
    typeof children === 'function'
      ? children({ onSuccess: handleSuccess, onCancel: () => setShow?.(false) })
      : children;

  const defaultTitle = mode === 'create' ? 'Tambah Data Baru' : 'Ubah Data';

  return (
    <Dialog open={show} onOpenChange={setShow}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title || defaultTitle}</DialogTitle>
        </DialogHeader>
        {childrenWithProps}
      </DialogContent>
    </Dialog>
  );
}
