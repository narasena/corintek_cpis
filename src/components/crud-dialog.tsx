'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ICrudDialogProps {
  mode: 'create' | 'edit';
  title?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  isLoading?: boolean;
  headerClassName?: string;
  contentWrapperClassName?: string;
  closeButtonClassName?: string;
  children:
    | React.ReactNode
    | ((props: {
        onSuccess: () => void;
        onCancel: () => void;
      }) => React.ReactNode);
}

const sizeClasses = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-2xl',
  lg: 'sm:max-w-4xl',
  xl: 'sm:max-w-5xl',
  '2xl': 'sm:max-w-7xl',
};

export function CrudDialog({
  mode,
  title,
  trigger,
  open,
  onOpenChange,
  onSuccess,
  size = 'md',
  isLoading = false,
  headerClassName,
  contentWrapperClassName,
  closeButtonClassName,
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
      <DialogContent
        className={cn(
          'flex flex-col gap-0 p-0 overflow-hidden max-h-[calc(100dvh-1rem)] sm:max-h-[90dvh]',
          sizeClasses[size]
        )}
        closeButtonClassName={closeButtonClassName}
      >
        <DialogHeader
          className={cn(
            'px-6 py-4 border-b shrink-0 flex flex-row items-center justify-between',
            headerClassName
          )}
        >
          <DialogTitle>{title || defaultTitle}</DialogTitle>
        </DialogHeader>

        <div
          className={cn(
            'flex-1 overflow-y-auto w-full relative p-6',
            contentWrapperClassName
          )}
        >
          {isLoading && (
            <div className="absolute inset-0 z-50 bg-background/50 backdrop-blur-sm flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {childrenWithProps}
        </div>
      </DialogContent>
    </Dialog>
  );
}
