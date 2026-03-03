'use client';

import { CrudDialog } from '@/components/crud-dialog';
import { ParameterForm } from './parameter-form';
import { IParameter } from '@/features/parameters/types';

interface IParameterDialogProps {
  mode: 'create' | 'edit';
  parameter?: IParameter;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
  hasExistingLimits?: boolean;
}

export function ParameterDialog({
  mode,
  parameter,
  trigger,
  open,
  onOpenChange,
  onSuccess,
  hasExistingLimits = false,
}: IParameterDialogProps) {
  const title =
    mode === 'create' ? 'Tambah Parameter Baru' : 'Ubah Data Parameter';

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
        <ParameterForm
          mode={mode}
          defaultValues={parameter}
          onSuccess={handleSuccess}
          onCancel={onCancel}
          hasExistingLimits={hasExistingLimits}
        />
      )}
    </CrudDialog>
  );
}
