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
          capacity: true,
          brand: true,
          model: true,
          serialNumber: true,
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
          capacity: true,
          brand: true,
          model: true,
          serialNumber: true,
        },
        orderBy: [{ type: 'asc' }, { unitNumber: 'asc' }],
      },
      parameterOverrides: {
        include: {
          parameter: {
            select: {
              id: true,
              name: true,
              unit: true,
            },
          },
        },
      },
    },
  });

  if (!project) return null;

  return project as unknown as IProject;
}

/**
 * Upsert project parameter override
 */
export async function upsertProjectParameterOverride(data: {
  projectId: string;
  parameterId: string;
  minValue?: number | null;
  maxValue?: number | null;
  rawWaterMinValue?: number | null;
  rawWaterMaxValue?: number | null;
}) {
  const { projectId, parameterId, ...overrides } = data;

  return prisma.projectParameterOverride.upsert({
    where: {
      projectId_parameterId: { projectId, parameterId },
    },
    create: {
      projectId,
      parameterId,
      ...overrides,
    },
    update: {
      ...overrides,
    },
  });
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
  const { id, machines, ...updateData } = data;

  // Use transaction to ensure atomicity
  const project = await prisma.$transaction(async tx => {
    // 1. Update project details
    const updatedProject = await tx.project.update({
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

    // 2. Handle machines synchronization if machines array is provided
    if (machines) {
      // Get existing machines from DB
      const existingMachines = await tx.machine.findMany({
        where: { projectId: id, deletedAt: null },
        select: { id: true },
      });

      const existingMachineIds = existingMachines.map(m => m.id);

      // Identify machines to delete (in DB but not in input)
      const inputMachineIds = machines
        .filter(m => m.id)
        .map(m => m.id as string);

      const machinesToDelete = existingMachineIds.filter(
        dbId => !inputMachineIds.includes(dbId)
      );

      // Identify machines to create (no ID) and update (has ID)
      const machinesToCreate = machines.filter(m => !m.id);
      const machinesToUpdate = machines.filter(m => m.id);

      // Execute Delete
      if (machinesToDelete.length > 0) {
        await tx.machine.updateMany({
          where: { id: { in: machinesToDelete } },
          data: { deletedAt: new Date() },
        });
      }

      // Execute Create
      if (machinesToCreate.length > 0) {
        await tx.machine.createMany({
          data: machinesToCreate.map(machine => ({
            projectId: id,
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

      // Execute Update
      // We iterate because we need to update each specific machine by ID
      for (const machine of machinesToUpdate) {
        if (!machine.id) continue;

        await tx.machine.update({
          where: { id: machine.id },
          data: {
            unitNumber: machine.unitNumber,
            type: machine.type,
            ownership: machine.ownership,
            status: machine.status,
            capacity: machine.capacity ?? null,
            brand: machine.brand ?? null,
            model: machine.model ?? null,
            serialNumber: machine.serialNumber ?? null,
          },
        });
      }
    }

    return updatedProject;
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
