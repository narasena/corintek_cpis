'use server';

import { revalidatePath } from 'next/cache';
import * as projectService from './service';
import {
  CreateProjectSchema,
  UpdateProjectSchema,
  TCreateProject,
  TUpdateProject,
} from './types';

// =============================================================================
// Project Actions - Server Actions Entry Point
// =============================================================================

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
