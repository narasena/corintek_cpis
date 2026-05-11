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
import { buildProjectAccessWhere, isProjectScopedRole } from './access-policy';

// =============================================================================
// Project Service - Business Logic
// =============================================================================

export async function getProjects(actor: IJwtPayload): Promise<IProject[]> {
  ensureAccess(actor.role, RbacResource.PROJECTS_LIST, 'read');

  const projects = await prisma.project.findMany({
    where: buildProjectAccessWhere(actor),
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
      _count: {
        select: {
          logSheets: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return projects as unknown as IProject[];
}

type TDashboardProjectRow = {
  id: string;
  name: string;
  quoteNumber: string | null;
  status: string;
  client: { id: string; name: string } | null;
  assignments: { role: string }[];
};

type TPendingCounts = {
  logSheets: Map<string, number>;
  workReports: Map<string, number>;
};

export async function getDashboardProjects(
  actor: IJwtPayload
): Promise<IProjectDashboardCard[]> {
  ensureAccess(actor.role, RbacResource.PROJECTS_LIST, 'read');

  try {
    const projects = await getDashboardProjectsBase(actor);
    const counts = await getPendingCountsForProjects(projects.map(p => p.id));
    return mapProjectsToDashboardCards(projects, counts);
  } catch (error) {
    console.error('[CPIS-ERROR] Projects.GetDashboardProjects:', error);
    throw error;
  }
}

async function getDashboardProjectsBase(
  actor: IJwtPayload
): Promise<TDashboardProjectRow[]> {
  const projects = await prisma.project.findMany({
    where: buildProjectAccessWhere(actor),
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

  return projects as TDashboardProjectRow[];
}

async function getPendingCountsForProjects(
  projectIds: string[]
): Promise<TPendingCounts> {
  if (projectIds.length === 0) {
    return {
      logSheets: new Map(),
      workReports: new Map(),
    };
  }

  const [logSheetCounts, workReportCounts] = await Promise.all([
    prisma.logSheet.groupBy({
      by: ['projectId'],
      where: {
        projectId: { in: projectIds },
        deletedAt: null,
        status: 'SUBMITTED',
      },
      _count: { _all: true },
    }),
    prisma.workReport.groupBy({
      by: ['projectId'],
      where: {
        projectId: { in: projectIds },
        deletedAt: null,
        status: 'SUBMITTED',
      },
      _count: { _all: true },
    }),
  ]);

  return {
    logSheets: new Map(
      logSheetCounts.map(row => [row.projectId, row._count._all])
    ),
    workReports: new Map(
      workReportCounts.map(row => [row.projectId, row._count._all])
    ),
  };
}

function mapProjectsToDashboardCards(
  projects: TDashboardProjectRow[],
  counts: TPendingCounts
): IProjectDashboardCard[] {
  return projects.map(project => ({
    id: project.id,
    name: project.name,
    quoteNumber: project.quoteNumber,
    status: project.status as any,
    client: project.client ?? undefined,
    myAssignmentRoles: project.assignments.map(a => a.role as any),
    taskCounts: {
      logSheetsPendingApproval: counts.logSheets.get(project.id) ?? 0,
      workReportsPendingApproval: counts.workReports.get(project.id) ?? 0,
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

  const project = await prisma.project.findFirst({
    where: buildProjectAccessWhere(actor, { id }),
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
  const canAccess = await canActorAccessProject(actor, projectId);
  if (!canAccess) {
    throw new Error('Unauthorized');
  }
}

async function canActorAccessProject(
  actor: IJwtPayload,
  projectId: string
): Promise<boolean> {
  try {
    if (!isProjectScopedRole(actor.role)) {
      return true;
    }

    const project = await prisma.project.findFirst({
      where: buildProjectAccessWhere(actor, { id: projectId }),
      select: { id: true },
    });

    return !!project;
  } catch (error) {
    console.error('[CPIS-ERROR] Projects.CanAccessProject:', error);
    throw error;
  }
}

export async function getAccessibleProjectIds(
  actor: IJwtPayload
): Promise<string[] | null> {
  if (!isProjectScopedRole(actor.role)) {
    return null;
  }

  try {
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
  } catch (error) {
    console.error('[CPIS-ERROR] Projects.GetAccessibleProjectIds:', error);
    throw error;
  }
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

  try {
    return await prisma.$transaction(tx =>
      applyProjectAssignmentsTransaction(tx, projectId, assignments)
    );
  } catch (error) {
    console.error('[CPIS-ERROR] Projects.SetProjectAssignments:', error);
    throw error;
  }
}

async function applyProjectAssignmentsTransaction(
  tx: Omit<
    typeof prisma,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
  >,
  projectId: string,
  assignments: TProjectAssignmentInput[]
) {
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

  await assertValidAddendumOnCreate(data);

  // Validate at least one CLIENT_PIC is assigned (required for all new projects)
  if (!data.assignments || data.assignments.length === 0) {
    throw new Error('Proyek harus memiliki minimal satu CLIENT_PIC');
  }
  const hasClientPic = data.assignments.some(a => a.role === 'CLIENT_PIC');
  if (!hasClientPic) {
    throw new Error('Proyek harus memiliki minimal satu CLIENT_PIC');
  }

  const { machines, ...projectData } = data;

  const project = await prisma.$transaction(async tx => {
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
        projectType: projectData.projectType,
        contractType: projectData.contractType,
        workCategory: projectData.workCategory,
        warrantyMonths: projectData.warrantyMonths ?? null,
        parentProjId: projectData.parentProjId ?? null,
        parameterLimitProfileId: projectData.parameterLimitProfileId ?? null,
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

    // Create assignments if provided
    if (data.assignments && data.assignments.length > 0) {
      await applyProjectAssignmentsTransaction(
        tx,
        newProject.id,
        data.assignments
      );
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

  await assertValidAddendumOnUpdate(data);

  const { id, machines, ...updateData } = data;

  const project = await prisma.$transaction(async tx => {
    const updatedProject = await tx.project.update({
      where: { id },
      data: {
        ...updateData,
        parentProjId: normalizeParentProjIdForUpdate(updateData.parentProjId),
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

    if (machines) {
      await syncProjectMachines(tx, id, machines);
    }

    return updatedProject;
  });

  return project as unknown as IProject;
}

type TUpdateMachines = NonNullable<TUpdateProject['machines']>;

function normalizeParentProjIdForUpdate(
  value: TUpdateProject['parentProjId']
): string | null | undefined {
  if (typeof value === 'undefined') return undefined;
  return value ?? null;
}

async function assertValidAddendumOnCreate(data: TCreateProject) {
  if (data.projectType !== 'ADDENDUM') return;
  if (!data.parentProjId) {
    throw new Error('Project addendum harus memiliki project utama');
  }

  try {
    const parent = await prisma.project.findUnique({
      where: { id: data.parentProjId },
      select: { id: true, clientId: true, projectType: true },
    });

    if (!parent) {
      throw new Error('Project utama tidak ditemukan');
    }

    if (parent.projectType !== 'UTAMA') {
      throw new Error('Project addendum hanya boleh terkait ke project utama');
    }

    if (parent.clientId !== data.clientId) {
      throw new Error('Project addendum harus memiliki client yang sama');
    }
  } catch (error) {
    console.error('[CPIS-ERROR] Projects.ValidateAddendumOnCreate:', error);
    throw error;
  }
}

async function assertValidAddendumOnUpdate(data: TUpdateProject) {
  if (data.projectType !== 'ADDENDUM' || !data.parentProjId) return;

  try {
    const parent = await prisma.project.findUnique({
      where: { id: data.parentProjId },
      select: { id: true, projectType: true },
    });

    if (!parent) {
      throw new Error('Project utama tidak ditemukan');
    }

    if (parent.projectType !== 'UTAMA') {
      throw new Error('Project addendum hanya boleh terkait ke project utama');
    }
  } catch (error) {
    console.error('[CPIS-ERROR] Projects.ValidateAddendumOnUpdate:', error);
    throw error;
  }
}

async function syncProjectMachines(
  tx: Omit<
    typeof prisma,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
  >,
  projectId: string,
  machines: TUpdateMachines
) {
  try {
    const existingIds = await getExistingMachineIds(tx, projectId);
    const { toCreate, toUpdate, toDelete } = splitMachinesByAction(
      machines,
      existingIds
    );

    await applyMachineDeletions(tx, toDelete);
    await applyMachineCreations(tx, projectId, toCreate);
    await applyMachineUpdates(tx, toUpdate);
  } catch (error) {
    console.error('[CPIS-ERROR] Projects.SyncMachines:', error);
    throw error;
  }
}

async function getExistingMachineIds(
  tx: Omit<
    typeof prisma,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
  >,
  projectId: string
): Promise<string[]> {
  const rows = await tx.machine.findMany({
    where: { projectId, deletedAt: null },
    select: { id: true },
  });

  return rows.map(m => m.id);
}

function splitMachinesByAction(
  machines: TUpdateMachines,
  existingIds: string[]
) {
  const inputIds = machines.filter(m => m.id).map(m => m.id as string);
  const toDelete = existingIds.filter(id => !inputIds.includes(id));
  const toCreate = machines.filter(m => !m.id);
  const toUpdate = machines.filter(m => m.id);

  return { toCreate, toUpdate, toDelete };
}

async function applyMachineDeletions(
  tx: Omit<
    typeof prisma,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
  >,
  ids: string[]
) {
  if (!ids.length) return;

  await tx.machine.updateMany({
    where: { id: { in: ids } },
    data: { deletedAt: new Date() },
  });
}

async function applyMachineCreations(
  tx: Omit<
    typeof prisma,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
  >,
  projectId: string,
  machines: TUpdateMachines
) {
  if (!machines.length) return;

  await tx.machine.createMany({
    data: machines.map(machine => ({
      projectId,
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

async function applyMachineUpdates(
  tx: Omit<
    typeof prisma,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
  >,
  machines: TUpdateMachines
) {
  for (const machine of machines) {
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
