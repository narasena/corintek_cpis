import { getWorkReportByIdAction } from '@/features/work-reports/actions';
import { WorkReportPreview } from '@/features/work-reports/components/work-report-preview';
import { WorkReportSignatureSection } from '@/features/work-reports/components/work-report-signature-section';
import { PrintButton } from '@/components/print-button';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ projectId: string; workReportId: string }>;
}

export default async function WorkReportDetailPage({ params }: PageProps) {
  const { projectId, workReportId } = await params;
  const res = await getWorkReportByIdAction(workReportId);
  const data = res.success ? (res.data as any) : null;

  if (!data) return notFound();
  if (data.projectId !== projectId) return notFound();

  return (
    <div className="min-h-screen bg-gray-100 p-8 print:p-0 print:bg-white">
      {/* Navigation & Actions - Hidden when printing */}
      <div className="max-w-[210mm] mx-auto mb-6 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href={`/work-reports/${projectId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/my-projects/${projectId}`}>Proyek</Link>
          </Button>
        </div>
        <PrintButton />
      </div>

      <div className="max-w-[210mm] mx-auto mb-4 print:hidden">
        <WorkReportSignatureSection
          projectId={projectId}
          workReportId={workReportId}
          isLocked={data.status !== 'DRAFT'}
          technicianSignatureUrl={data.technicianSignatureUrl}
          technicianSignedAt={data.technicianSignedAt}
          clientPicSignatureUrl={data.clientPicSignatureUrl}
          clientPicSignedAt={data.clientPicSignedAt}
        />
      </div>

      <WorkReportPreview data={data} />
    </div>
  );
}
