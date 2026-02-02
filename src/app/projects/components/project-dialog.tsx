'use client';

import { CrudDialog } from '@/components/crud-dialog';
import { ProjectForm } from './project-form';
import { IProject } from '@/features/projects/types';
import { TClientResponse } from '@/@types/client.type';

interface IProjectDialogProps {
  mode: 'create' | 'edit';
  project?: IProject;
  clients: TClientResponse[];
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ProjectDialog({
  mode,
  project,
  clients,
  trigger,
  open,
  onOpenChange,
  onSuccess,
}: IProjectDialogProps) {
  const title = mode === 'create' ? 'Tambah Proyek Baru' : 'Ubah Data Proyek';

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
        <ProjectForm
          mode={mode}
          defaultValues={project}
          clients={clients}
          onSuccess={handleSuccess}
          onCancel={onCancel}
        />
      )}
    </CrudDialog>
  );
}
