'use server';

import { revalidatePath } from 'next/cache';
import {
  CreateMachineSchema,
  UpdateMachineSchema,
  TCreateMachine,
  TUpdateMachine,
} from './types';
import {
  createMachine,
  updateMachine,
  deleteMachine,
  getMachinesByProject,
  getMachineById,
} from './service';

// =============================================================================
// Machine Actions - Server Action Layer
// =============================================================================

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Create a new machine
 */
export async function createMachineAction(
  data: TCreateMachine
): Promise<ActionResult> {
  try {
    // Validate input
    const validated = CreateMachineSchema.parse(data);

    // Call service
    const machine = await createMachine(validated);

    // Revalidate project page to show new machine
    revalidatePath(`/projects/${machine.projectId}`);
    revalidatePath('/projects');

    return {
      success: true,
      data: machine,
    };
  } catch (error) {
    console.error('Error creating machine:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal membuat mesin. Silakan coba lagi.',
    };
  }
}

/**
 * Update an existing machine
 */
export async function updateMachineAction(
  data: TUpdateMachine
): Promise<ActionResult> {
  try {
    // Validate input
    const validated = UpdateMachineSchema.parse(data);

    if (!validated.id) {
      return {
        success: false,
        error: 'ID mesin wajib diisi',
      };
    }

    // Call service
    const machine = await updateMachine(validated.id, validated);

    // Revalidate project page
    revalidatePath(`/projects/${machine.projectId}`);
    revalidatePath('/projects');

    return {
      success: true,
      data: machine,
    };
  } catch (error) {
    console.error('Error updating machine:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal memperbarui mesin. Silakan coba lagi.',
    };
  }
}

/**
 * Delete a machine (soft delete)
 */
export async function deleteMachineAction(id: string): Promise<ActionResult> {
  try {
    if (!id) {
      return {
        success: false,
        error: 'ID mesin wajib diisi',
      };
    }

    // Get machine to find projectId for revalidation
    const machine = await getMachineById(id);
    if (!machine) {
      return {
        success: false,
        error: 'Mesin tidak ditemukan',
      };
    }

    // Call service
    await deleteMachine(id);

    // Revalidate project page
    revalidatePath(`/projects/${machine.projectId}`);
    revalidatePath('/projects');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting machine:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal menghapus mesin. Silakan coba lagi.',
    };
  }
}

/**
 * Get all machines for a project
 */
export async function getMachinesByProjectAction(
  projectId: string
): Promise<ActionResult> {
  try {
    if (!projectId) {
      return {
        success: false,
        error: 'ID proyek wajib diisi',
      };
    }

    const machines = await getMachinesByProject(projectId);

    return {
      success: true,
      data: machines,
    };
  } catch (error) {
    console.error('Error fetching machines:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal mengambil data mesin. Silakan coba lagi.',
    };
  }
}

/**
 * Get a single machine by ID
 */
export async function getMachineByIdAction(id: string): Promise<ActionResult> {
  try {
    if (!id) {
      return {
        success: false,
        error: 'ID mesin wajib diisi',
      };
    }

    const machine = await getMachineById(id);

    if (!machine) {
      return {
        success: false,
        error: 'Mesin tidak ditemukan',
      };
    }

    return {
      success: true,
      data: machine,
    };
  } catch (error) {
    console.error('Error fetching machine:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Gagal mengambil data mesin. Silakan coba lagi.',
    };
  }
}
