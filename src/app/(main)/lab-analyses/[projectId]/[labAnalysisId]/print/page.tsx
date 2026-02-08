import { notFound } from 'next/navigation';
import {
  getCoolingWaterQualityParameters,
  getLabAnalysisDetail,
} from '@/features/lab-analyses/service';
import { LabAnalysisPrint } from '@/features/lab-analyses/components/lab-analysis-print';

interface PageProps {
  params: Promise<{ projectId: string; labAnalysisId: string }>;
}

export default async function LabAnalysisPrintPage({ params }: PageProps) {
  const { projectId, labAnalysisId } = await params;
  const [labAnalysis, parameters] = await Promise.all([
    getLabAnalysisDetail(labAnalysisId),
    getCoolingWaterQualityParameters(),
  ]);

  if (!labAnalysis || labAnalysis.projectId !== projectId) notFound();

  return <LabAnalysisPrint labAnalysis={labAnalysis} parameters={parameters} />;
}
