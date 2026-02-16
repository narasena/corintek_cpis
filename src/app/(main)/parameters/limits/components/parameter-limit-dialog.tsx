'use client';

import { CrudDialog } from '@/components/crud-dialog';
import { ParameterLimitForm } from './parameter-limit-form';
import type { IParameterLimitMasterItem } from '@/features/parameters/types';

interface ParameterLimitDialogProps {
  parameter: IParameterLimitMasterItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ParameterLimitDialog({
  parameter,
  open,
  onOpenChange,
  onSuccess,
}: ParameterLimitDialogProps) {
  return (
    <CrudDialog
      mode="edit"
      title="Ubah Batas Parameter"
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
    >
      {({ onSuccess: handleSuccess, onCancel }) => (
        <ParameterLimitForm
          parameter={parameter}
          onSuccess={handleSuccess}
          onCancel={onCancel}
        />
      )}
    </CrudDialog>
  );
}
