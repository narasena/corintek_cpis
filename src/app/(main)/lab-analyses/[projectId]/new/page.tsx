import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCoolingWaterQualityParameters } from '@/features/lab-analyses/service';
import { LabAnalysisForm } from '@/features/lab-analyses/components/lab-analysis-form';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function NewLabAnalysisPage({ params }: PageProps) {
  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId, deletedAt: null },
    include: { client: true },
  });
  if (!project) notFound();

  const parameters = await getCoolingWaterQualityParameters();

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
      />
    </div>
  );
}
