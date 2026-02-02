import { prisma } from '@/lib/prisma';
import { TCreateProject, TUpdateProject, IProject } from './types';

// =============================================================================
// Project Service - Business Logic
// =============================================================================

/**
 * Get all active projects with client details
 */
export async function getProjects(): Promise<IProject[]> {
  const projects = await prisma.project.findMany({
    where: {
      deletedAt: null,
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return projects as unknown as IProject[];
}

/**
 * Get a single project by ID
 */
export async function getProjectById(id: string): Promise<IProject | null> {
  const project = await prisma.project.findUnique({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!project) return null;

  return project as unknown as IProject;
}

/**
 * Create a new project
 */
export async function createProject(data: TCreateProject): Promise<IProject> {
  const project = await prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      quoteNumber: data.quoteNumber,
      poNumber: data.poNumber,
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status,
      clientId: data.clientId,
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return project as unknown as IProject;
}

/**
 * Update an existing project
 */
export async function updateProject(data: TUpdateProject): Promise<IProject> {
  const { id, ...updateData } = data;

  const project = await prisma.project.update({
    where: { id },
    data: updateData,
    include: {
      client: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return project as unknown as IProject;
}

/**
 * Soft delete a project
 */
export async function deleteProject(id: string): Promise<IProject> {
  const project = await prisma.project.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });

  return project as unknown as IProject;
}
