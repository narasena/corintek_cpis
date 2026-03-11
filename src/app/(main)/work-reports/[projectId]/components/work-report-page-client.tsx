'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { WorkReportRow } from '@/features/work-reports/types';
import { WorkReportList } from './work-report-list';
import { WorkReportCreateDialog } from './work-report-create-dialog';
import { Button } from '@/components/ui/button';
import { useSession } from '@/hooks/use-session';
import { canAccess, RbacResource } from '@/lib/rbac';

interface WorkReportPageClientProps {
  projectId: string;
  data: WorkReportRow[];
  defaultOpen: boolean;
}

export function WorkReportPageClient({
  projectId,
  data,
  defaultOpen,
}: WorkReportPageClientProps) {
  const router = useRouter();
  const { user: actor } = useSession();

  const canEdit =
    actor?.role !== 'CLIENT' &&
    actor?.role !== 'CLIENT_SUPERVISOR' &&
    canAccess(actor?.role ?? '', RbacResource.WORK_REPORTS, 'update');

  const canDelete = canAccess(
    actor?.role ?? '',
    RbacResource.WORK_REPORTS,
    'delete'
  );

  const handleView = (workReportId: string) => {
    router.push(`/work-reports/${projectId}/${workReportId}`);
  };

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

      <WorkReportList
        projectId={projectId}
        data={data}
        canEdit={canEdit}
        canDelete={canDelete}
        onView={handleView}
      />
    </div>
  );
}
