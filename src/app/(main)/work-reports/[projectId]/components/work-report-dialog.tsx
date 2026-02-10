'use client';

import { CrudDialog } from '@/components/crud-dialog';
import { WorkReportForm } from '@/features/work-reports/components/work-report-form';
import { WorkReportRow } from '@/features/work-reports/types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface IWorkReportDialogProps {
  projectId: string;
  initialData?: WorkReportRow;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function WorkReportDialog({
  projectId,
  initialData,
  trigger,
  open,
  onOpenChange,
}: IWorkReportDialogProps) {
  const mode = initialData ? 'edit' : 'create';

  return (
    <CrudDialog
      mode={mode}
      title={mode === 'create' ? 'Buat Laporan Kerja' : 'Ubah Laporan Kerja'}
      trigger={
        trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Buat Laporan
          </Button>
        )
      }
      open={open}
      onOpenChange={onOpenChange}
    >
      {({ onSuccess, onCancel }) => (
        <WorkReportForm
          projectId={projectId}
          initialData={initialData}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      )}
    </CrudDialog>
  );
}
