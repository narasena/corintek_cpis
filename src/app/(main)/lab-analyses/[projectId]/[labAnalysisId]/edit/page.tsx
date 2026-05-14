import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getCoolingWaterQualityParameters,
  getLabAnalysisDetail,
  getEffectiveParameterLimits,
} from '@/features/lab-analyses/service';
import { LabAnalysisForm } from '@/features/lab-analyses/components/lab-analysis-form';
import { Button } from '@/components/ui/button';

interface PageProps {
  params: Promise<{ projectId: string; labAnalysisId: string }>;
}

export default async function EditLabAnalysisPage({ params }: PageProps) {
  const { projectId, labAnalysisId } = await params;

  const [parameters, labAnalysis, effectiveLimits] = await Promise.all([
    getCoolingWaterQualityParameters(),
    getLabAnalysisDetail(labAnalysisId),
    getEffectiveParameterLimits(projectId),
  ]);

  if (!labAnalysis || labAnalysis.projectId !== projectId) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Ubah Hasil Analisa Lab
        </h1>
        <Button asChild variant="outline">
          <Link
            href={`/lab-analyses/${projectId}/${labAnalysisId}/print`}
            target="_blank"
          >
            Preview Print
          </Link>
        </Button>
      </div>
      <LabAnalysisForm
        mode="edit"
        projectId={projectId}
        parameters={parameters}
        initialData={labAnalysis}
        effectiveLimits={effectiveLimits}
      />
    </div>
  );
}
