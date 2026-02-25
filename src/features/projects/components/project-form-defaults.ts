import type { TCreateProject, IProject } from '@/features/projects/types';

export function buildProjectFormDefaultValues(
  project?: IProject
): Partial<TCreateProject> {
  return {
    name: project?.name || '',
    clientId: project?.clientId || '',
    description: project?.description || '',
    quoteNumber: project?.quoteNumber || '',
    poNumber: project?.poNumber || '',
    status: project?.status || 'PENDING',
    workCategory: project?.workCategory || 'OPERATIONAL',
    contractType: project?.contractType || 'DIRECT',
    warrantyMonths:
      typeof project?.warrantyMonths === 'number'
        ? project.warrantyMonths
        : undefined,
    startDate: project?.startDate ? new Date(project.startDate) : new Date(),
    endDate: project?.endDate ? new Date(project.endDate) : undefined,
    machines: project?.machines || [],
  };
}
