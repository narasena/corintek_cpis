'use client';

import { useState, useEffect } from 'react';
import { ProfileForm } from './profile-form';
import { CrudDialog } from '@/components/crud-dialog';
import type { IParameterLimitProfile } from '../types';

interface IProfileDialogProps {
  mode: 'create' | 'edit';
  profile?: IParameterLimitProfile;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: (profile: IParameterLimitProfile) => void;
  trigger?: React.ReactNode;
}

export function ProfileDialog({
  mode,
  profile,
  open,
  onOpenChange,
  onSuccess,
  trigger,
}: IProfileDialogProps) {
  const [isOpen, setIsOpen] = useState(open ?? false);

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const handleSuccess = (data: IParameterLimitProfile) => {
    onSuccess?.(data);
    setIsOpen(false);
  };

  return (
    <CrudDialog
      mode={mode}
      open={isOpen}
      onOpenChange={handleOpenChange}
      trigger={trigger}
      title={mode === 'create' ? 'Tambah Profil' : 'Ubah Profil'}
    >
      {({ onSuccess: onFormSuccess, onCancel }) => (
        <ProfileForm
          initialData={profile}
          onSuccess={data => {
            handleSuccess(data);
            onFormSuccess();
          }}
          onCancel={onCancel}
        />
      )}
    </CrudDialog>
  );
}
