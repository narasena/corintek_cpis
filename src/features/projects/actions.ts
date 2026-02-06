'use server';

import { revalidatePath } from 'next/cache';
import * as projectService from './service';
import {
  CreateProjectSchema,
  UpdateProjectSchema,
  ProjectParameterOverrideSchema,
  TCreateProject,
  TUpdateProject,
  TProjectParameterOverride,
} from './types';

// =============================================================================
// Project Actions - Server Actions Entry Point
// =============================================================================

/**
 * Upsert project parameter override action
 */
export async function upsertProjectParameterOverrideAction(
  data: TProjectParameterOverride
) {
  try {
    const validatedData = ProjectParameterOverrideSchema.parse(data);

    if (!validatedData.projectId || !validatedData.parameterId) {
      throw new Error('Project ID dan Parameter ID wajib diisi');
    }

    const override = await projectService.upsertProjectParameterOverride({
      projectId: validatedData.projectId,
      parameterId: validatedData.parameterId,
      minValue: validatedData.minValue,
      maxValue: validatedData.maxValue,
      rawWaterMinValue: validatedData.rawWaterMinValue,
      rawWaterMaxValue: validatedData.rawWaterMaxValue,
    });

    revalidatePath(`/projects`); // Revalidate list just in case
    // revalidatePath(`/projects/${validatedData.projectId}`); // Dynamic path not easily guessable here if we are on edit page, but we can try.
    // Actually, usually we revalidate the specific path.
    
    return { success: true, data: override };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Gagal menyimpan pengaturan parameter',
    };
  }
}

/**
 * Create project action
 */
export async function createProjectAction(data: TCreateProject) {
  try {
    const validatedData = CreateProjectSchema.parse(data);
    const project = await projectService.createProject(validatedData);

    revalidatePath('/projects');
    return { success: true, data: project };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Gagal membuat proyek',
    };
  }
}

/**
 * Update project action
 */
export async function updateProjectAction(data: TUpdateProject) {
  try {
    const validatedData = UpdateProjectSchema.parse(data);
    const project = await projectService.updateProject(validatedData);

    revalidatePath('/projects');
    return { success: true, data: project };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Gagal memperbarui proyek',
    };
  }
}

/**
 * Delete project action
 */
export async function deleteProjectAction(id: string) {
  try {
    await projectService.deleteProject(id);

    revalidatePath('/projects');
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Gagal menghapus proyek',
    };
  }
}

/**
 * Get projects action (for internal data fetching if needed)
 */
export async function getProjectsAction() {
  try {
    const projects = await projectService.getProjects();
    return { success: true, data: projects };
  } catch (error: any) {
    console.error('[getProjectsAction] Error:', error);
    return {
      success: false,
      error: error.message || 'Gagal mengambil data proyek',
    };
  }
}

/**
 * Get single project action
 */
export async function getProjectAction(id: string) {
  try {
    const project = await projectService.getProjectById(id);
    if (!project) {
      return { success: false, error: 'Proyek tidak ditemukan' };
    }
    return { success: true, data: project };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Gagal mengambil data proyek',
    };
  }
}
