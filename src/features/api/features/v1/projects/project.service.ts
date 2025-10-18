import { AppError } from '@/lib/app-error';
import {
  IPersonnelGroup,
  IProject,
  IProjectAssignment,
  IPersonnelDetail,
  TProjectCreationAttributes,
} from '@/types/project.type';
import {
  MachineOwnership,
  MachineStatus,
  MachineType,
  Prisma,
  UserRole,
} from '@/features/api/generated/prisma';
import { prisma } from '@/features/api/connection/prisma';
import { serviceErrorResponse } from '@/lib/error-handler';

export async function fetchInternalPersonnelService() {
  try {
    const whereClause: Prisma.UserWhereInput = {
      deletedAt: null,
      role: {
        in: ['SUPERVISOR', 'TECHNICIAN'],
      },
    };

    const allPersonnel = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    const groupedPersonnel = allPersonnel.reduce((acc, user) => {
      // Note: TypeScript should infer 'role' and other fields from 'user'
      // because it comes from the prisma.user.findMany result.
      const { role, ...personnelDetails } = user;

      // 1. Find the existing group
      // The type of 'acc' is now correctly inferred as PersonnelGroup[]
      let group = acc.find(item => item.role === role);

      // 2. If the group doesn't exist, create it and add it to the accumulator
      if (!group) {
        group = {
          role: role,
          personnel: [],
        };
        acc.push(group);
      }

      // 3. Push the user details to the group's personnel array
      // Since 'group' is guaranteed to be an object (either found or newly created),
      // the error 'group' is possibly 'undefined' is solved.
      group.personnel.push(personnelDetails as IPersonnelDetail);

      return acc;
      // 🔑 Crucial fix: Cast the initial empty array to the desired output type (PersonnelGroup[])
    }, [] as IPersonnelGroup[]);
    // ⭐️ FIX: Sort the grouped array to put 'SUPERVISOR' first
    groupedPersonnel.sort((a, b) => {
      // If 'a' is SUPERVISOR, it should come first (return -1)
      if (a.role === 'SUPERVISOR') {
        return -1;
      }
      // If 'b' is SUPERVISOR, it should come after 'a' (return 1)
      if (b.role === 'SUPERVISOR') {
        return 1;
      }
      // Otherwise, keep the order (return 0) or use default string comparison
      return 0; // Or a.role.localeCompare(b.role) if you have more than two roles
    });

    return groupedPersonnel;
  } catch (error) {
    console.error('Error fetching internal personnel:', error);
    throw new AppError({
      status: 500,
      message: 'Error fetching internal personnel',
      isExpose: true,
    });
  }
}

export async function createProjectService(
  projectData: TProjectCreationAttributes
) {
  try {
    // For database compatibility, we need to provide clientPICId and technicianId
    // We'll use the first client personnel and first internal personnel as the main PICs
    const clientPersonnelId = projectData.clientPersonnelIds?.[0];
    const internalPersonnelId = projectData.personnelIds?.[0];

    if (!clientPersonnelId || !internalPersonnelId) {
      throw new AppError({
        status: 400,
        message:
          'At least one client personnel and one internal personnel are required',
        isExpose: true,
      });
    }

    if (!projectData.chillers?.length || !projectData.coolingTowers?.length) {
      throw new AppError({
        status: 400,
        message: 'At least one chiller and one cooling tower are required',
        isExpose: true,
      });
    }

    let newProject: Partial<IProject> = {};
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const createdProject = await tx.project.create({
        data: {
          parentId: (projectData.parentId as string) ?? null,
          clientId: projectData.clientId,
          name: projectData.name,
          description: (projectData.description as string) ?? null,
          quoteNumber: projectData.quoteNumber,
          PONumber: projectData.PONumber,
          startDate: new Date(projectData.startDate).toISOString(),
          endDate: new Date(projectData.endDate).toISOString(),
          type: projectData.type,
          contractType: projectData.contractType,
          workCategory: projectData.workCategory,
          warranty: Number(projectData.warranty),
        },
      });

      newProject = {
        ...createdProject,
        startDate: newProject.startDate?.split('T')[0],
        endDate: newProject.endDate?.split('T')[0],
      };

      if (
        projectData.clientPersonnelIds &&
        projectData.clientPersonnelIds.length > 0
      ) {
        await tx.projectAssignment.createMany({
          data: projectData.clientPersonnelIds.map(personnelId => ({
            projectId: newProject.id as string,
            assigneeId: personnelId,
            role: 'CLIENT' as const,
          })),
        });
      }

      if (projectData.personnelIds && projectData.personnelIds.length > 0) {
        await tx.projectAssignment.createMany({
          data: projectData.personnelIds.map(personnelId => ({
            projectId: newProject.id as string,
            assigneeId: personnelId,
            role: 'INTERNAL' as const,
          })),
        });
      }

      // Create chillers and their initial history
      const chillers =
        projectData.chillers?.length > 0
          ? await Promise.all(
              projectData.chillers.map(async chiller => {
                const machine = await tx.machine.create({
                  data: {
                    projectId: newProject.id as string,
                    type: MachineType.CHILLER,
                    ownership: chiller.ownership as MachineOwnership,
                    capacity: chiller.capacity
                      ? Number(chiller.capacity)
                      : null,
                    brand: (chiller.brand as string) ?? null,
                    model: (chiller.model as string) ?? null,
                    serialNumber: (chiller.serialNumber as string) ?? null,
                  },
                });

                await tx.machineHistory.create({
                  data: {
                    machineId: machine.id,
                    status: MachineStatus.RUNNING,
                  },
                });

                return machine;
              })
            )
          : [];

      // Create coolingTowers and their initial history
      const coolingTowers =
        projectData.coolingTowers?.length > 0
          ? await Promise.all(
              projectData.coolingTowers.map(async tower => {
                const machine = await tx.machine.create({
                  data: {
                    projectId: newProject.id as string,
                    type: MachineType.COOLING_TOWER,
                    ownership: tower.ownership as MachineOwnership,
                    capacity: tower.capacity ? Number(tower.capacity) : null,
                    brand: (tower.brand as string) ?? null,
                    model: (tower.model as string) ?? null,
                    serialNumber: (tower.serialNumber as string) ?? null,
                  },
                });

                await tx.machineHistory.create({
                  data: {
                    machineId: machine.id,
                    status: MachineStatus.RUNNING,
                  },
                });

                return machine;
              })
            )
          : [];
      return {
        ...newProject,
        chillers,
        coolingTowers,
      };
    });

    return newProject;
  } catch (error) {
    console.error('Error creating project:', error);
    throw new AppError({
      status: 500,
      message: 'Error creating project',
      isExpose: true,
    });
  }
}

export async function fetchAllProjectsService() {
  try {
    const projects = await prisma.project.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        client: true,
        assignments: {
          include: {
            assignee: true,
          },
        },
      },
    });

    return projects;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw new AppError({
      status: 500,
      message: 'Error fetching projects',
      isExpose: true,
    });
  }
}

export async function fetchAssignedProjectsService(userId: string) {
  try {
    const projects = await prisma.project.findMany({
      where: {
        deletedAt: null,
        assignments: {
          some: {
            assigneeId: userId,
            deletedAt: null,
          },
        },
      },
      include: {
        client: true,
        assignments: {
          include: {
            assignee: true,
          },
        },
      },
    });

    return projects;
  } catch (error) {
    console.error('Error fetching assigned projects:', error);
    throw new AppError({
      status: 500,
      message: 'Error fetching assigned projects',
      isExpose: true,
    });
  }
}

export async function fetchProjectByIdService(projectId: string) {
  try {
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        deletedAt: null,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        assignments: {
          select: {
            assignee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        },
        machines: {
          select: {
            id: true,
            type: true,
            ownership: true,
            capacity: true,
            brand: true,
            model: true,
            serialNumber: true,
          },
        },
      },
    });

    if (!project) {
      throw new AppError({
        status: 404,
        message: 'Project not found',
        isExpose: true,
      });
    }

    const internalPersonnelRoles: UserRole[] = [
      UserRole.SUPERVISOR,
      UserRole.TECHNICIAN,
    ];
    const clientPersonnelRoles: UserRole[] = [
      UserRole.CLIENT_SUPERVISOR,
      UserRole.CLIENT_TECHNICIAN,
    ];

    // Helper function
    const groupAssignmentsByRoles = (
      assignments: IProjectAssignment[] | undefined,
      roles: UserRole[]
    ): IPersonnelGroup[] => {
      return roles.map(role => ({
        role,
        personnel: assignments
          ?.filter(assignment => assignment.assignee.role === role)
          .map(assignment => assignment.assignee) as IPersonnelDetail[],
      }));
    };

    const currentPersonnel = project.assignments?.filter(assignment =>
      internalPersonnelRoles.includes(assignment.assignee.role)
    );

    const groupedPersonnel = groupAssignmentsByRoles(
      currentPersonnel,
      internalPersonnelRoles
    );
    const clientPersonnel = project.assignments?.filter(assignment =>
      clientPersonnelRoles.includes(assignment.assignee.role)
    );
    const clientGroupedPersonnel = groupAssignmentsByRoles(
      clientPersonnel,
      clientPersonnelRoles
    );

    const chillers = project.machines?.filter(
      machine => machine.type === MachineType.CHILLER
    );
    const coolingTowers = project.machines?.filter(
      machine => machine.type === MachineType.COOLING_TOWER
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { assignments, machines, ...projectData } = project;
    const extendedProject: IProject = {
      ...projectData,
      startDate: project.startDate?.toISOString().split('T')[0] || '',
      endDate: project.endDate?.toISOString().split('T')[0] || '',
      chillers,
      coolingTowers,
      personnel: groupedPersonnel,
      clientPersonnel: clientGroupedPersonnel,
    };

    return extendedProject;
  } catch (error) {
    serviceErrorResponse({
      error,
      customErrorMessage: 'Error fetching project by id',
      status: 500,
    });
  }
}
