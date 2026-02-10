'use client';

import { useState } from 'react';
import { WorkReportRow } from '@/features/work-reports/types';
import { getWorkReportColumns } from './columns';
import { DataTable } from '@/components/data-table';
import { CrudDialog } from '@/components/crud-dialog';
import { WorkReportForm } from '@/features/work-reports/components/work-report-form';

interface WorkReportListProps {
  projectId: string;
  data: WorkReportRow[];
}

export function WorkReportList({ projectId, data }: WorkReportListProps) {
  const [editingRow, setEditingRow] = useState<WorkReportRow | null>(null);

  const columns = getWorkReportColumns({
    projectId,
    onEdit: row => setEditingRow(row),
  });

  return (
    <>
      <DataTable columns={columns} data={data} />

      <CrudDialog
        mode="edit"
        open={!!editingRow}
        onOpenChange={open => !open && setEditingRow(null)}
        title="Ubah Laporan Kerja"
      >
        {({ onSuccess, onCancel }) => (
          <WorkReportForm
            projectId={projectId}
            initialData={editingRow || undefined}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        )}
      </CrudDialog>
    </>
  );
}
