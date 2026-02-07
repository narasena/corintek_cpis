'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CrudDialog } from '@/components/crud-dialog';
import { WorkReportForm } from '@/features/work-reports/components/work-report-form';

interface WorkReportCreateDialogProps {
  projectId: string;
}

export function WorkReportCreateDialog({
  projectId,
}: WorkReportCreateDialogProps) {
  return (
    <CrudDialog
      mode="create"
      title="Buat Laporan Kerja"
      trigger={
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Laporan
        </Button>
      }
    >
      {({ onSuccess, onCancel }) => (
        <WorkReportForm
          projectId={projectId}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      )}
    </CrudDialog>
  );
}
