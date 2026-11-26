import { notFound } from 'next/navigation';
import {
  getCoolingWaterQualityParameters,
  getLabAnalysisDetail,
  getEffectiveParameterLimits,
} from '@/features/lab-analyses/service';
import { getProjectById } from '@/features/projects/service';
import { getCurrentUser } from '@/lib/auth-helpers';
import { ensureAccess, RbacResource } from '@/lib/rbac';
import { LabAnalysisPrint } from '@/features/lab-analyses/components/lab-analysis-print';

interface PageProps {
  params: Promise<{ projectId: string; labAnalysisId: string }>;
}

export default async function LabAnalysisPrintPage({ params }: PageProps) {
  const actor = await getCurrentUser();
  if (!actor) return notFound();
  ensureAccess(actor.role, RbacResource.LAB_ANALYSES, 'read');

  const { projectId, labAnalysisId } = await params;
  const project = await getProjectById(actor, projectId);
  if (!project) return notFound();

  const [labAnalysis, parameters, effectiveLimits] = await Promise.all([
    getLabAnalysisDetail(labAnalysisId),
    getCoolingWaterQualityParameters(),
    getEffectiveParameterLimits(projectId),
  ]);

  if (!labAnalysis || labAnalysis.projectId !== projectId) notFound();

  return (
    <LabAnalysisPrint
      labAnalysis={labAnalysis}
      parameters={parameters}
      effectiveLimits={effectiveLimits}
    />
  );
}
