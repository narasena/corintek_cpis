import { prisma } from '@/lib/prisma';
import { TCreateMachine, TUpdateMachine } from './types';

// =============================================================================
// Machine Service - Pure Business Logic Layer
// =============================================================================

/**
 * Create a new machine for a project
 */
export async function createMachine(data: TCreateMachine) {
  return await prisma.machine.create({
    data: {
      projectId: data.projectId,
      unitNumber: data.unitNumber,
      type: data.type,
      ownership: data.ownership,
      status: data.status,
      capacity: data.capacity ?? null,
      brand: data.brand ?? null,
      model: data.model ?? null,
      serialNumber: data.serialNumber ?? null,
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

/**
 * Update an existing machine
 */
export async function updateMachine(id: string, data: TUpdateMachine) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, ...updateData } = data;

  return await prisma.machine.update({
    where: { id },
    data: {
      ...(updateData.projectId && { projectId: updateData.projectId }),
      ...(updateData.unitNumber !== undefined && {
        unitNumber: updateData.unitNumber,
      }),
      ...(updateData.type && { type: updateData.type }),
      ...(updateData.ownership && { ownership: updateData.ownership }),
      ...(updateData.status && { status: updateData.status }),
      ...(updateData.capacity !== undefined && {
        capacity: updateData.capacity,
      }),
      ...(updateData.brand !== undefined && { brand: updateData.brand }),
      ...(updateData.model !== undefined && { model: updateData.model }),
      ...(updateData.serialNumber !== undefined && {
        serialNumber: updateData.serialNumber,
      }),
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

/**
 * Soft delete a machine (set deletedAt timestamp)
 */
export async function deleteMachine(id: string) {
  return await prisma.machine.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
}

/**
 * Get all machines for a specific project (exclude soft-deleted)
 */
export async function getMachinesByProject(projectId: string) {
  return await prisma.machine.findMany({
    where: {
      projectId,
      deletedAt: null,
    },
    orderBy: [
      { type: 'asc' }, // Group by type (CHILLER, COOLING_TOWER)
      { unitNumber: 'asc' }, // Then by unit number
    ],
  });
}

/**
 * Get a single machine by ID with project relation
 */
export async function getMachineById(id: string) {
  return await prisma.machine.findUnique({
    where: { id },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          clientId: true,
        },
      },
    },
  });
}

/**
 * Bulk create machines for a project (used in project creation)
 */
export async function createMachinesForProject(
  projectId: string,
  machines: Omit<TCreateMachine, 'projectId'>[]
) {
  if (machines.length === 0) return [];

  const machineData = machines.map(machine => ({
    projectId,
    unitNumber: machine.unitNumber,
    type: machine.type,
    ownership: machine.ownership,
    status: machine.status,
    capacity: machine.capacity ?? null,
    brand: machine.brand ?? null,
    model: machine.model ?? null,
    serialNumber: machine.serialNumber ?? null,
  }));

  // Use createMany for bulk insert
  await prisma.machine.createMany({
    data: machineData,
  });

  // Return created machines
  return await getMachinesByProject(projectId);
}

/**
 * Delete all machines for a project (used when project is deleted)
 */
export async function deleteMachinesByProject(projectId: string) {
  return await prisma.machine.updateMany({
    where: { projectId },
    data: {
      deletedAt: new Date(),
    },
  });
}
