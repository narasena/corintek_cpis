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
      machines: {
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
          unitNumber: true,
          type: true,
          ownership: true,
          status: true,
        },
        orderBy: [{ type: 'asc' }, { unitNumber: 'asc' }],
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
 * Create a new project with optional machines
 */
export async function createProject(data: TCreateProject): Promise<IProject> {
  const { machines, ...projectData } = data;

  // Use transaction to ensure atomicity
  const project = await prisma.$transaction(async tx => {
    // Create the project first
    const newProject = await tx.project.create({
      data: {
        name: projectData.name,
        description: projectData.description,
        quoteNumber: projectData.quoteNumber,
        poNumber: projectData.poNumber,
        startDate: projectData.startDate,
        endDate: projectData.endDate,
        status: projectData.status,
        clientId: projectData.clientId,
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

    // Create machines if provided
    if (machines && machines.length > 0) {
      await tx.machine.createMany({
        data: machines.map(machine => ({
          projectId: newProject.id,
          unitNumber: machine.unitNumber,
          type: machine.type,
          ownership: machine.ownership,
          status: machine.status,
          capacity: machine.capacity ?? null,
          brand: machine.brand ?? null,
          model: machine.model ?? null,
          serialNumber: machine.serialNumber ?? null,
        })),
      });
    }

    return newProject;
  });

  return project as unknown as IProject;
}

/**
 * Update an existing project
 */
export async function updateProject(data: TUpdateProject): Promise<IProject> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, machines, ...updateData } = data;

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
      machines: {
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
          unitNumber: true,
          type: true,
          ownership: true,
          status: true,
        },
        orderBy: [{ type: 'asc' }, { unitNumber: 'asc' }],
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
