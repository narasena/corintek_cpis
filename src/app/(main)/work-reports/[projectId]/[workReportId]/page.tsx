import { getWorkReportById } from '@/features/work-reports/service';
import { WorkReportPreview } from './components/work-report-preview';
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
  const data = await getWorkReportById(workReportId);

  if (!data) return notFound();

  return (
    <div className="min-h-screen bg-gray-100 p-8 print:p-0 print:bg-white">
      {/* Navigation & Actions - Hidden when printing */}
      <div className="max-w-[210mm] mx-auto mb-6 flex items-center justify-between print:hidden">
        <Button variant="ghost" asChild>
          <Link href={`/work-reports/${projectId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Link>
        </Button>
        <PrintButton />
      </div>

      <WorkReportPreview data={data} />
    </div>
  );
}
