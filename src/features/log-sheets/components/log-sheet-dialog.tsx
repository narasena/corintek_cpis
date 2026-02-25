'use client';

import { CrudDialog } from '@/components/crud-dialog';
import { LogSheetForm } from './log-sheet-form';

interface ILogSheetDialogProps {
  projectId: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
  onCreated?: (logSheetId: string) => void;
}

export function LogSheetDialog({
  projectId,
  trigger,
  onSuccess,
  onCreated,
}: ILogSheetDialogProps) {
  return (
    <CrudDialog mode="create" title="Tambah Log Sheet" trigger={trigger}>
      {({ onSuccess: handleSuccess, onCancel }) => (
        <LogSheetForm
          projectId={projectId}
          onCancel={onCancel}
          onSuccess={() => {
            onSuccess?.();
            handleSuccess();
          }}
          onCreated={onCreated}
        />
      )}
    </CrudDialog>
  );
}
