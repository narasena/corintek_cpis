import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import {
  getCoolingWaterQualityParameters,
  getEffectiveParameterLimits,
} from '@/features/lab-analyses/service';
import { getProjectById } from '@/features/projects/service';
import { getCurrentUser } from '@/lib/auth-helpers';
import { ensureAccess, RbacResource } from '@/lib/rbac';
import { LabAnalysisForm } from '@/features/lab-analyses/components/lab-analysis-form';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function NewLabAnalysisPage({ params }: PageProps) {
  const actor = await getCurrentUser();
  if (!actor) return notFound();
  ensureAccess(actor.role, RbacResource.LAB_ANALYSES, 'create');

  const { projectId } = await params;
  const accessibleProject = await getProjectById(actor, projectId);
  if (!accessibleProject) return notFound();

  const project = await prisma.project.findUnique({
    where: { id: projectId, deletedAt: null },
    include: { client: true },
  });
  if (!project) notFound();

  const [parameters, effectiveLimits] = await Promise.all([
    getCoolingWaterQualityParameters(),
    getEffectiveParameterLimits(projectId),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">
        Tambah Hasil Analisa Lab
      </h1>
      <LabAnalysisForm
        mode="create"
        projectId={projectId}
        parameters={parameters}
        defaultCustomer={project.client?.name ?? ''}
        defaultAddress={project.client?.address ?? ''}
        effectiveLimits={effectiveLimits}
      />
    </div>
  );
}
