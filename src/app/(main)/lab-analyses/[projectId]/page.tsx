import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getLabAnalysesByProject } from '@/features/lab-analyses/service';
import { LabAnalysisRow } from '@/features/lab-analyses/types';
import { LabAnalysisList } from './components/lab-analysis-list';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function LabAnalysesPage({ params }: PageProps) {
  const { projectId } = await params;
  const data = await getLabAnalysesByProject(projectId);
  const formattedData = data as unknown as LabAnalysisRow[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Hasil Analisa Lab</h1>
        <Button asChild>
          <Link href={`/lab-analyses/${projectId}/new`}>Tambah</Link>
        </Button>
      </div>

      <LabAnalysisList projectId={projectId} data={formattedData} />
    </div>
  );
}
