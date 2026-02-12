'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CrudDialog } from '@/components/crud-dialog';
import { WorkReportForm } from '@/features/work-reports/components/work-report-form';

interface WorkReportCreateDialogProps {
  projectId: string;
  defaultOpen?: boolean;
}

export function WorkReportCreateDialog({
  projectId,
  defaultOpen,
}: WorkReportCreateDialogProps) {
  const [open, setOpen] = useState(!!defaultOpen);

  return (
    <CrudDialog
      mode="create"
      title="Buat Laporan Kerja"
      open={open}
      onOpenChange={setOpen}
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
