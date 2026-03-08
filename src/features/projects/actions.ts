'use server';

import { revalidatePath } from 'next/cache';
import * as projectService from './service';
import { actionFactory } from '@/features/auth/di';
import { RbacResource } from '@/lib/rbac';
import {
  CreateProjectSchema,
  UpdateProjectSchema,
  ProjectParameterOverrideSchema,
  SetProjectAssignmentsSchema,
} from './types';
import { z } from 'zod/v4';

// =============================================================================
// Project Actions - Server Actions Entry Point
// =============================================================================

/**
 * Upsert project parameter override action
 */
export const upsertProjectParameterOverrideAction = actionFactory.protected(
  async ({ input, actor }) => {
    const override = await projectService.upsertProjectParameterOverride(
      actor,
      input
    );
    revalidatePath(`/projects`);
    return override;
  },
  {
    schema: ProjectParameterOverrideSchema,
    metadata: { rbac: { resource: RbacResource.PROJECTS_ADMIN, capability: 'update' } },
  }
);

/**
 * Create project action
 */
export const createProjectAction = actionFactory.protected(
  async ({ input, actor }) => {
    const project = await projectService.createProject(actor, input);
    revalidatePath('/projects');
    return project;
  },
  {
    schema: CreateProjectSchema,
    metadata: { rbac: { resource: RbacResource.PROJECTS_ADMIN, capability: 'create' } },
  }
);

/**
 * Update project action
 */
export const updateProjectAction = actionFactory.protected(
  async ({ input, actor }) => {
    const project = await projectService.updateProject(actor, input);
    revalidatePath('/projects');
    return project;
  },
  {
    schema: UpdateProjectSchema,
    metadata: { rbac: { resource: RbacResource.PROJECTS_ADMIN, capability: 'update' } },
  }
);

/**
 * Delete project action
 */
export const deleteProjectAction = actionFactory.protected(
  async ({ input, actor }) => {
    await projectService.deleteProject(actor, input);
    revalidatePath('/projects');
    return undefined;
  },
  {
    schema: z.string().uuid(),
    metadata: { rbac: { resource: RbacResource.PROJECTS_ADMIN, capability: 'delete' } },
  }
);

/**
 * Get projects action (for internal data fetching if needed)
 */
export const getProjectsAction = actionFactory.protected(
  async ({ actor }) => {
    return projectService.getProjects(actor);
  },
  {
    metadata: { rbac: { resource: RbacResource.PROJECTS_LIST, capability: 'read' } },
  }
);

export const getDashboardProjectsAction = actionFactory.protected(
  async ({ actor }) => {
    return projectService.getDashboardProjects(actor);
  },
  {
    metadata: { rbac: { resource: RbacResource.DASHBOARD, capability: 'read' } },
  }
);

/**
 * Get single project action
 */
export const getProjectAction = actionFactory.protected(
  async ({ input, actor }) => {
    const project = await projectService.getProjectById(actor, input);
    if (!project) throw new Error('Proyek tidak ditemukan');
    return project;
  },
  {
    schema: z.string().uuid(),
    metadata: { rbac: { resource: RbacResource.PROJECTS_LIST, capability: 'read' } },
  }
);

export const getProjectAssignmentsAction = actionFactory.protected(
  async ({ input, actor }) => {
    return projectService.getProjectAssignments(actor, input);
  },
  {
    schema: z.string().uuid(),
    metadata: { rbac: { resource: RbacResource.PROJECTS_ADMIN, capability: 'read' } },
  }
);

export const setProjectAssignmentsAction = actionFactory.protected(
  async ({ input, actor }) => {
    const assignments = await projectService.setProjectAssignments(
      actor,
      input.projectId,
      input.assignments
    );
    revalidatePath('/projects');
    return assignments;
  },
  {
    schema: SetProjectAssignmentsSchema,
    metadata: { rbac: { resource: RbacResource.PROJECTS_ADMIN, capability: 'update' } },
  }
);
