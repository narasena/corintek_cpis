import { notFound } from 'next/navigation';
import Link from 'next/link';

import { getWorkReportsByProjectAction } from '@/features/work-reports/actions';
import { WorkReportRow } from '@/features/work-reports/types';
import { WorkReportList } from './components/work-report-list';
import { WorkReportCreateDialog } from './components/work-report-create-dialog';
import { Button } from '@/components/ui/button';

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

  // Cast data to WorkReportRow[] because types might mismatch slightly on Date fields
  // (Prisma returns Date, client expects Date, but serialization might be tricky if passed to client component directly)
  // But here we are passing to Client Component (DataTable) which takes data.
  // The columns definition expects WorkReportRow.
  const formattedData = res.data as unknown as WorkReportRow[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/my-projects/${projectId}`}>Kembali ke Proyek</Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Laporan Kerja</h1>
        </div>
        <WorkReportCreateDialog
          projectId={projectId}
          defaultOpen={defaultOpen}
        />
      </div>

      <WorkReportList projectId={projectId} data={formattedData} />
    </div>
  );
}
