import { prisma } from '@/lib/prisma';
import type { TProjectType } from '@/features/projects/types';

type TProjectWithParentInfo = {
  id: string;
  projectType: TProjectType;
  parentProjId: string | null;
  deletedAt: Date | null;
};

export interface IProjectReportingScope {
  rootProjectId: string;
  projectIds: string[];
}

async function findProjectWithParentInfo(
  id: string
): Promise<TProjectWithParentInfo | null> {
  return prisma.project.findUnique({
    where: { id },
    select: {
      id: true,
      projectType: true,
      parentProjId: true,
      deletedAt: true,
    },
  }) as Promise<TProjectWithParentInfo | null>;
}

async function findAddendaForParent(
  parentId: string
): Promise<TProjectWithParentInfo[]> {
  return prisma.project.findMany({
    where: {
      parentProjId: parentId,
      deletedAt: null,
    },
    select: {
      id: true,
      projectType: true,
      parentProjId: true,
      deletedAt: true,
    },
  }) as Promise<TProjectWithParentInfo[]>;
}

export async function getProjectReportingScope(
  projectId: string
): Promise<IProjectReportingScope | null> {
  try {
    const project = await findProjectWithParentInfo(projectId);
    if (!project || project.deletedAt) {
      return null;
    }

    if (project.projectType === 'UTAMA') {
      const addenda = await findAddendaForParent(project.id);
      return {
        rootProjectId: project.id,
        projectIds: [project.id, ...addenda.map(p => p.id)],
      };
    }

    if (project.projectType === 'ADDENDUM' && project.parentProjId) {
      const parent = await findProjectWithParentInfo(project.parentProjId);
      if (!parent || parent.deletedAt) {
        return {
          rootProjectId: project.id,
          projectIds: [project.id],
        };
      }

      const siblings = await findAddendaForParent(parent.id);
      return {
        rootProjectId: parent.id,
        projectIds: [parent.id, ...siblings.map(p => p.id)],
      };
    }

    if (!project.parentProjId) {
      return {
        rootProjectId: project.id,
        projectIds: [project.id],
      };
    }
    return {
      rootProjectId: project.id,
      projectIds: [project.id],
    };
  } catch (error) {
    console.error('[CPIS-ERROR] Projects.ReportingScope.Get:', error);
    throw error;
  }
}
