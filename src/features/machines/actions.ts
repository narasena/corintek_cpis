'use server';

import { revalidatePath } from 'next/cache';
import {
  CreateMachineSchema,
  UpdateMachineSchema,
} from './types';
import {
  createMachine,
  updateMachine,
  deleteMachine,
  getMachinesByProject,
  getMachineById,
} from './service';
import { actionFactory } from '@/lib/action-factory';
import { RbacResource } from '@/lib/rbac';
import { z } from 'zod/v4';

// =============================================================================
// Machine Actions - Server Action Layer
// =============================================================================

/**
 * Create a new machine
 */
export const createMachineAction = actionFactory.protected(
  async ({ input, actor }) => {
    const machine = await createMachine(actor, input);
    revalidatePath(`/projects/${machine.projectId}`);
    revalidatePath('/projects');
    return machine;
  },
  {
    schema: CreateMachineSchema,
    metadata: { rbac: { resource: RbacResource.MACHINES, capability: 'create' } },
  }
);

/**
 * Update an existing machine
 */
export const updateMachineAction = actionFactory.protected(
  async ({ input, actor }) => {
    const machine = await updateMachine(actor, input.id!, input);
    revalidatePath(`/projects/${machine.projectId}`);
    revalidatePath('/projects');
    return machine;
  },
  {
    schema: UpdateMachineSchema,
    metadata: { rbac: { resource: RbacResource.MACHINES, capability: 'update' } },
  }
);

/**
 * Delete a machine (soft delete)
 */
export const deleteMachineAction = actionFactory.protected(
  async ({ input, actor }) => {
    const machine = await getMachineById(actor, input);
    if (!machine) throw new Error('Mesin tidak ditemukan');

    await deleteMachine(actor, input);

    revalidatePath(`/projects/${machine.projectId}`);
    revalidatePath('/projects');
    return { success: true };
  },
  {
    schema: z.string().min(1, 'ID mesin wajib diisi'),
    metadata: { rbac: { resource: RbacResource.MACHINES, capability: 'delete' } },
  }
);

/**
 * Get all machines for a project
 */
export const getMachinesByProjectAction = actionFactory.protected(
  async ({ input, actor }) => {
    // Note: service.getMachinesByProject doesn't have ensureAccess internally currently
    // but we protect it here with MACHINES:read
    return getMachinesByProject(input);
  },
  {
    schema: z.string().min(1, 'ID proyek wajib diisi'),
    metadata: { rbac: { resource: RbacResource.MACHINES, capability: 'read' } },
  }
);

/**
 * Get a single machine by ID
 */
export const getMachineByIdAction = actionFactory.protected(
  async ({ input, actor }) => {
    const machine = await getMachineById(actor, input);
    if (!machine) throw new Error('Mesin tidak ditemukan');
    return machine;
  },
  {
    schema: z.string().min(1, 'ID mesin wajib diisi'),
    metadata: { rbac: { resource: RbacResource.MACHINES, capability: 'read' } },
  }
);
