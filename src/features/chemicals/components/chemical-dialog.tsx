'use client';

import { CrudDialog } from '@/components/crud-dialog';
import { ChemicalForm } from './chemical-form';
import { TChemical } from '@/@types/chemical.type';

interface IChemicalDialogProps {
  mode: 'create' | 'edit';
  chemical?: TChemical;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ChemicalDialog({
  mode,
  chemical,
  trigger,
  open,
  onOpenChange,
  onSuccess,
}: IChemicalDialogProps) {
  const title =
    mode === 'create' ? 'Tambah Chemical Baru' : 'Ubah Data Chemical';

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
        <ChemicalForm
          mode={mode}
          defaultValues={chemical}
          onSuccess={handleSuccess}
          onCancel={onCancel}
        />
      )}
    </CrudDialog>
  );
}
