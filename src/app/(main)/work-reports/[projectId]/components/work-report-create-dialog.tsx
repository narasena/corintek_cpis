'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  const handleSuccess = (workReportId: string) => {
    setOpen(false);
    router.push(`/work-reports/${projectId}/${workReportId}`);
    router.refresh();
  };

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
      {({ onCancel }) => (
        <WorkReportForm
          projectId={projectId}
          onSuccessWithId={handleSuccess}
          onCancel={onCancel}
        />
      )}
    </CrudDialog>
  );
}
