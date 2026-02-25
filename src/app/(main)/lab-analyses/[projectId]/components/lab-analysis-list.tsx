'use client';

import { DataTable } from '@/components/data-table';
import { LabAnalysisRow } from '@/features/lab-analyses/types';
import { getLabAnalysisColumns } from './columns';

interface LabAnalysisListProps {
  projectId: string;
  data: LabAnalysisRow[];
}

export function LabAnalysisList({ projectId, data }: LabAnalysisListProps) {
  const columns = getLabAnalysisColumns({ projectId });
  return <DataTable columns={columns} data={data} />;
}
