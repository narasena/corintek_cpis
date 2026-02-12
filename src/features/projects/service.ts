import { prisma } from '@/lib/prisma';
import {
  TCreateProject,
  TUpdateProject,
  IProject,
  IProjectDashboardCard,
  TProjectAssignmentInput,
} from './types';
import type { IJwtPayload } from '@/@types/auth.type';
import { ensureAccess, RbacResource } from '@/lib/rbac';

// =============================================================================
// Project Service - Business Logic
// =============================================================================

/**
 * Get all active projects with client details
 */
export async function getProjects(actor: IJwtPayload): Promise<IProject[]> {
  ensureAccess(actor.role, RbacResource.PROJECTS_LIST, 'read');

  const isScopedRole =
    actor.role === 'SUPERVISOR' ||
    actor.role === 'TECHNICIAN' ||
    actor.role === 'CLIENT_SUPERVISOR' ||
    actor.role === 'CLIENT_TECHNICIAN';

  const projects = await prisma.project.findMany({
    where: {
      deletedAt: null,
      ...(isScopedRole
        ? {
            status: 'ONGOING',
            assignments: {
              some: {
                userId: actor.id,
                isActive: true,
              },
            },
          }
        : {}),
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

export async function getDashboardProjects(
  actor: IJwtPayload
): Promise<IProjectDashboardCard[]> {
  ensureAccess(actor.role, RbacResource.PROJECTS_LIST, 'read');

  const isScopedRole =
    actor.role === 'SUPERVISOR' ||
    actor.role === 'TECHNICIAN' ||
    actor.role === 'CLIENT_SUPERVISOR' ||
    actor.role === 'CLIENT_TECHNICIAN';

  const projects = await prisma.project.findMany({
    where: {
      deletedAt: null,
      ...(isScopedRole
        ? {
            status: 'ONGOING',
            assignments: {
              some: {
                userId: actor.id,
                isActive: true,
              },
            },
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      quoteNumber: true,
      status: true,
      client: { select: { id: true, name: true } },
      assignments: {
        where: { userId: actor.id, isActive: true },
        select: { role: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const projectIds = projects.map(p => p.id);

  const logSheetCounts =
    projectIds.length === 0
      ? []
      : await prisma.logSheet.groupBy({
          by: ['projectId'],
          where: {
            projectId: { in: projectIds },
            deletedAt: null,
            status: 'SUBMITTED',
          },
          _count: { _all: true },
        });

  const logSheetsPendingByProjectId = new Map<string, number>(
    logSheetCounts.map(row => [row.projectId, row._count._all])
  );

  const workReportCounts =
    projectIds.length === 0
      ? []
      : await prisma.workReport.groupBy({
          by: ['projectId'],
          where: {
            projectId: { in: projectIds },
            deletedAt: null,
            status: 'SUBMITTED',
          },
          _count: { _all: true },
        });

  const workReportsPendingByProjectId = new Map<string, number>(
    workReportCounts.map(row => [row.projectId, row._count._all])
  );

  return projects.map(project => ({
    id: project.id,
    name: project.name,
    quoteNumber: project.quoteNumber,
    status: project.status as any,
    client: project.client ?? undefined,
    myAssignmentRoles: project.assignments.map(a => a.role as any),
    taskCounts: {
      logSheetsPendingApproval:
        logSheetsPendingByProjectId.get(project.id) ?? 0,
      workReportsPendingApproval:
        workReportsPendingByProjectId.get(project.id) ?? 0,
    },
  }));
}

/**
 * Get a single project by ID
 */
export async function getProjectById(
  actor: IJwtPayload,
  id: string
): Promise<IProject | null> {
  ensureAccess(actor.role, RbacResource.PROJECTS_LIST, 'read');

  const isScopedRole =
    actor.role === 'SUPERVISOR' ||
    actor.role === 'TECHNICIAN' ||
    actor.role === 'CLIENT_SUPERVISOR' ||
    actor.role === 'CLIENT_TECHNICIAN';

  const project = await prisma.project.findFirst({
    where: {
      id,
      deletedAt: null,
      ...(isScopedRole
        ? {
            status: 'ONGOING',
            assignments: {
              some: {
                userId: actor.id,
                isActive: true,
              },
            },
          }
        : {}),
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

export async function assertCanAccessProject(
  actor: IJwtPayload,
  projectId: string
) {
  const isScopedRole =
    actor.role === 'SUPERVISOR' ||
    actor.role === 'TECHNICIAN' ||
    actor.role === 'CLIENT_SUPERVISOR' ||
    actor.role === 'CLIENT_TECHNICIAN';

  if (!isScopedRole) return;

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      deletedAt: null,
      status: 'ONGOING',
      assignments: {
        some: {
          userId: actor.id,
          isActive: true,
        },
      },
    },
    select: { id: true },
  });

  if (!project) {
    throw new Error('Unauthorized');
  }
}

export async function getAccessibleProjectIds(
  actor: IJwtPayload
): Promise<string[] | null> {
  const isScopedRole =
    actor.role === 'SUPERVISOR' ||
    actor.role === 'TECHNICIAN' ||
    actor.role === 'CLIENT_SUPERVISOR' ||
    actor.role === 'CLIENT_TECHNICIAN';

  if (!isScopedRole) return null;

  const rows = await prisma.projectAssignment.findMany({
    where: {
      userId: actor.id,
      isActive: true,
      project: {
        deletedAt: null,
        status: 'ONGOING',
      },
    },
    select: { projectId: true },
    distinct: ['projectId'],
  });

  return rows.map(r => r.projectId);
}

export async function getProjectAssignments(
  actor: IJwtPayload,
  projectId: string
) {
  ensureAccess(actor.role, RbacResource.PROJECTS_ADMIN, 'read');

  return prisma.projectAssignment.findMany({
    where: {
      projectId,
      isActive: true,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          isBlocked: true,
          deletedAt: true,
        },
      },
    },
    orderBy: [{ createdAt: 'asc' }],
  });
}

export async function setProjectAssignments(
  actor: IJwtPayload,
  projectId: string,
  assignments: TProjectAssignmentInput[]
) {
  ensureAccess(actor.role, RbacResource.PROJECTS_ADMIN, 'update');

  return prisma.$transaction(async tx => {
    const existing = await tx.projectAssignment.findMany({
      where: {
        projectId,
        isActive: true,
      },
      select: {
        id: true,
        userId: true,
        role: true,
      },
    });

    const incomingKeys = new Set(assignments.map(a => `${a.userId}:${a.role}`));

    for (const assignment of assignments) {
      await tx.projectAssignment.upsert({
        where: {
          projectId_userId_role: {
            projectId,
            userId: assignment.userId,
            role: assignment.role,
          },
        },
        create: {
          projectId,
          userId: assignment.userId,
          role: assignment.role,
          isActive: true,
          startDate: new Date(),
        },
        update: {
          isActive: true,
          endDate: null,
        },
      });
    }

    const now = new Date();
    for (const row of existing) {
      const key = `${row.userId}:${row.role}`;
      if (incomingKeys.has(key)) continue;
      await tx.projectAssignment.update({
        where: { id: row.id },
        data: {
          isActive: false,
          endDate: now,
        },
      });
    }

    return tx.projectAssignment.findMany({
      where: {
        projectId,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
            isBlocked: true,
            deletedAt: true,
          },
        },
      },
      orderBy: [{ createdAt: 'asc' }],
    });
  });
}

/**
 * Upsert project parameter override
 */
export async function upsertProjectParameterOverride(
  actor: IJwtPayload,
  data: {
    projectId: string;
    parameterId: string;
    minValue?: number | null;
    maxValue?: number | null;
    rawWaterMinValue?: number | null;
    rawWaterMaxValue?: number | null;
  }
) {
  ensureAccess(actor.role, RbacResource.PROJECTS_ADMIN, 'update');

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
export async function createProject(
  actor: IJwtPayload,
  data: TCreateProject
): Promise<IProject> {
  ensureAccess(actor.role, RbacResource.PROJECTS_ADMIN, 'create');

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
export async function updateProject(
  actor: IJwtPayload,
  data: TUpdateProject
): Promise<IProject> {
  ensureAccess(actor.role, RbacResource.PROJECTS_ADMIN, 'update');

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
export async function deleteProject(
  actor: IJwtPayload,
  id: string
): Promise<IProject> {
  ensureAccess(actor.role, RbacResource.PROJECTS_ADMIN, 'delete');

  const project = await prisma.project.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });

  return project as unknown as IProject;
}
