import { getWorkReportsByProject } from '@/features/work-reports/service';
import { WorkReportRow } from '@/features/work-reports/types';
import { WorkReportList } from './components/work-report-list';
import { WorkReportCreateDialog } from './components/work-report-create-dialog';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function WorkReportsPage({ params }: PageProps) {
  const { projectId } = await params;
  const data = await getWorkReportsByProject(projectId);

  // Cast data to WorkReportRow[] because types might mismatch slightly on Date fields
  // (Prisma returns Date, client expects Date, but serialization might be tricky if passed to client component directly)
  // But here we are passing to Client Component (DataTable) which takes data.
  // The columns definition expects WorkReportRow.
  const formattedData = data as unknown as WorkReportRow[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Laporan Kerja</h1>
        <WorkReportCreateDialog projectId={projectId} />
      </div>

      <WorkReportList projectId={projectId} data={formattedData} />
    </div>
  );
}
