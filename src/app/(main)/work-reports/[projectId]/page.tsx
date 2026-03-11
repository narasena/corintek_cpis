import { notFound } from 'next/navigation';

import { getWorkReportsByProjectAction } from '@/features/work-reports/actions';
import { WorkReportRow } from '@/features/work-reports/types';
import { WorkReportPageClient } from './components/work-report-page-client';

interface PageProps {
  params: Promise<{ projectId: string }>;
  searchParams?: Promise<{ create?: string }>;
}

export default async function WorkReportsPage({
  params,
  searchParams,
}: PageProps) {
  const { projectId } = await params;
  const sp = await searchParams;
  const defaultOpen = sp?.create === '1';

  const res = await getWorkReportsByProjectAction(projectId);
  if (!res.success || !res.data) return notFound();

  const formattedData = res.data as unknown as WorkReportRow[];

  return (
    <WorkReportPageClient
      projectId={projectId}
      data={formattedData}
      defaultOpen={defaultOpen}
    />
  );
}
