'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { getCacheContainer } from '@/features/cache/di';
import { getCurrentUserDetails } from '@/lib/auth-helpers';
import { ensureAccess, RbacResource } from '@/lib/rbac';
import {
  CreateProjectSchema,
  UpdateProjectSchema,
  ProjectParameterOverrideSchema,
  SetProjectAssignmentsSchema,
  TCreateProject,
  TUpdateProject,
  TProjectParameterOverride,
} from './types';
import { ECacheTag } from '../cache/tags';

// =============================================================================
// Project Actions - Server Actions Entry Point
// =============================================================================

/**
 * Upsert project parameter override action
 */
export async function upsertProjectParameterOverrideAction(
  data: TProjectParameterOverride
) {
  const actor = await getCurrentUserDetails();
  if (!actor) return { success: false, error: 'Unauthorized' };

  try {
    const { projects: projectService } = getCacheContainer();
    const validatedData = ProjectParameterOverrideSchema.parse(data);

    if (!validatedData.projectId || !validatedData.parameterId) {
      throw new Error('Project ID dan Parameter ID wajib diisi');
    }

    const override = await projectService.upsertProjectParameterOverride(
      {
        id: actor.id,
        email: actor.email,
        role: actor.role,
      },
      {
        projectId: validatedData.projectId,
        parameterId: validatedData.parameterId,
        minValue: validatedData.minValue,
        maxValue: validatedData.maxValue,
        rawWaterMinValue: validatedData.rawWaterMinValue,
        rawWaterMaxValue: validatedData.rawWaterMaxValue,
      }
    );

    // Invalidate cache for projects and dashboard projections
    revalidateTag(ECacheTag.PROJECTS, 'max');
    revalidateTag(ECacheTag.PROJECTS_DASHBOARD, 'max');
    revalidatePath(`/projects`); // Fallback for page router components

    return { success: true, data: override };
  } catch (error: any) {
    console.error('[CPIS-ERROR] Projects.UpsertParameterOverride:', error);
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
  const actor = await getCurrentUserDetails();
  if (!actor) return { success: false, error: 'Unauthorized' };

  try {
    const validatedData = CreateProjectSchema.parse(data);
    const { projects } = getCacheContainer();
    const project = await projects.createProject(
      {
        id: actor.id,
        email: actor.email,
        role: actor.role,
      },
      validatedData
    );

    // CG-05: Cache invalidation
    revalidateTag(ECacheTag.PROJECTS, 'max');
    revalidateTag(ECacheTag.PROJECTS_DASHBOARD, 'max');
    // revalidatePath('/projects'); // fallback

    return { success: true, data: project };
  } catch (error: any) {
    console.error('[CPIS-ERROR] Projects.Create:', error);
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
  const actor = await getCurrentUserDetails();
  if (!actor) return { success: false, error: 'Unauthorized' };

  try {
    const validatedData = UpdateProjectSchema.parse(data);
    const { projects } = getCacheContainer();
    const project = await projects.updateProject(
      {
        id: actor.id,
        email: actor.email,
        role: actor.role,
      },
      validatedData
    );

    // CG-05: Cache invalidation
    revalidateTag(ECacheTag.PROJECTS, 'max');
    revalidateTag(ECacheTag.PROJECTS_DASHBOARD, 'max');
    // revalidatePath('/projects'); // fallback

    return { success: true, data: project };
  } catch (error: any) {
    console.error('[CPIS-ERROR] Projects.Update:', error);
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
  const actor = await getCurrentUserDetails();
  if (!actor) return { success: false, error: 'Unauthorized' };

  try {
    const { projects } = getCacheContainer();
    await projects.deleteProject(
      {
        id: actor.id,
        email: actor.email,
        role: actor.role,
      },
      id
    );

    // CG-05: Cache invalidation
    revalidateTag(ECacheTag.PROJECTS, 'max');
    revalidateTag(ECacheTag.PROJECTS_DASHBOARD, 'max');
    // revalidatePath('/projects'); // fallback

    return { success: true };
  } catch (error: any) {
    console.error('[CPIS-ERROR] Projects.Delete:', error);
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
  const actor = await getCurrentUserDetails();
  if (!actor) return { success: false, error: 'Unauthorized' };

  try {
    ensureAccess(actor.role, RbacResource.PROJECTS_LIST, 'read');
    const { projects: projectsService } = getCacheContainer();
    const projects = await projectsService.getProjects({
      id: actor.id,
      email: actor.email,
      role: actor.role,
    });
    return { success: true, data: projects };
  } catch (error: any) {
    console.error('[CPIS-ERROR] Projects.List:', error);
    return {
      success: false,
      error: error.message || 'Gagal mengambil data proyek',
    };
  }
}

export async function getDashboardProjectsAction() {
  const actor = await getCurrentUserDetails();
  if (!actor) return { success: false, error: 'Unauthorized' };

  try {
    ensureAccess(actor.role, RbacResource.DASHBOARD, 'read');
    const { projects: projectsService } = getCacheContainer();
    const projects = await projectsService.getDashboardProjects({
      id: actor.id,
      email: actor.email,
      role: actor.role,
    });
    return { success: true, data: projects };
  } catch (error: any) {
    console.error('[CPIS-ERROR] Projects.DashboardList:', error);
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
  const actor = await getCurrentUserDetails();
  if (!actor) return { success: false, error: 'Unauthorized' };

  try {
    ensureAccess(actor.role, RbacResource.PROJECTS_LIST, 'read');
    const { projects } = getCacheContainer();
    const project = await projects.getProjectById(
      {
        id: actor.id,
        email: actor.email,
        role: actor.role,
      },
      id
    );
    if (!project) {
      return { success: false, error: 'Proyek tidak ditemukan' };
    }
    return { success: true, data: project };
  } catch (error: any) {
    console.error('[CPIS-ERROR] Projects.GetById:', error);
    return {
      success: false,
      error: error.message || 'Gagal mengambil data proyek',
    };
  }
}

export async function getProjectAssignmentsAction(projectId: string) {
  const actor = await getCurrentUserDetails();
  if (!actor) return { success: false, error: 'Unauthorized' };

  try {
    ensureAccess(actor.role, RbacResource.PROJECTS_ADMIN, 'read');
    const validatedProjectId =
      SetProjectAssignmentsSchema.shape.projectId.parse(projectId);

    const { projects } = getCacheContainer();
    const assignments = await projects.getProjectAssignments(
      { id: actor.id, email: actor.email, role: actor.role },
      validatedProjectId
    );

    return { success: true, data: assignments };
  } catch (error: any) {
    console.error('[CPIS-ERROR] Projects.Assignments.List:', error);
    return {
      success: false,
      error: error.message || 'Gagal mengambil data penugasan proyek',
    };
  }
}

export async function setProjectAssignmentsAction(input: unknown) {
  const actor = await getCurrentUserDetails();
  if (!actor) return { success: false, error: 'Unauthorized' };

  try {
    ensureAccess(actor.role, RbacResource.PROJECTS_ADMIN, 'update');
    const parsed = SetProjectAssignmentsSchema.parse(input);

    const { projects } = getCacheContainer();
    const assignments = await projects.setProjectAssignments(
      { id: actor.id, email: actor.email, role: actor.role },
      parsed.projectId,
      parsed.assignments
    );

    // CG-05: Cache invalidation (affects dashboard project cards and user assignment lists)
    revalidateTag(ECacheTag.PROJECTS_DASHBOARD, 'max');
    revalidateTag(ECacheTag.USERS, 'max');
    // revalidatePath('/projects'); // fallback

    return { success: true, data: assignments };
  } catch (error: any) {
    console.error('[CPIS-ERROR] Projects.Assignments.Set:', error);
    return {
      success: false,
      error: error.message || 'Gagal menyimpan penugasan proyek',
    };
  }
}
