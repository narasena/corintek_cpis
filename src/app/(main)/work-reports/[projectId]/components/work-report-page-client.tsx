'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

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

  const clientRoles = ['CLIENT', 'CLIENT_SUPERVISOR', 'CLIENT_TECHNICIAN'];
  const canEdit =
    !clientRoles.includes(actor?.role ?? '') &&
    canAccess(actor?.role ?? '', RbacResource.WORK_REPORTS, 'update');

  const canCreate =
    !clientRoles.includes(actor?.role ?? '') &&
    canAccess(actor?.role ?? '', RbacResource.WORK_REPORTS, 'create');

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
      {/* UX-202: Fixed mobile header layout - responsive flex */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="gap-1 touch-target"
          >
            <Link href={`/my-projects/${projectId}`}>
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Kembali ke Proyek</span>
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Laporan Kerja
          </h1>
        </div>
      {canCreate && (
        <WorkReportCreateDialog
          projectId={projectId}
          defaultOpen={defaultOpen}
        />
      )}
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
