import { notFound } from 'next/navigation';
import {
  getCoolingWaterQualityParameters,
  getLabAnalysisDetail,
} from '@/features/lab-analyses/service';
import { LabAnalysisForm } from '@/features/lab-analyses/components/lab-analysis-form';

interface PageProps {
  params: Promise<{ projectId: string; labAnalysisId: string }>;
}

export default async function EditLabAnalysisPage({ params }: PageProps) {
  const { projectId, labAnalysisId } = await params;

  const [parameters, labAnalysis] = await Promise.all([
    getCoolingWaterQualityParameters(),
    getLabAnalysisDetail(labAnalysisId),
  ]);

  if (!labAnalysis || labAnalysis.projectId !== projectId) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">
        Ubah Hasil Analisa Lab
      </h1>
      <LabAnalysisForm
        mode="edit"
        projectId={projectId}
        parameters={parameters}
        initialData={labAnalysis}
      />
    </div>
  );
}
