'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod/v4';
import { actionFactory } from '@/features/auth/di';
import { RbacResource } from '@/lib/rbac';
import * as service from './service';
import { CreateLabAnalysisSchema, UpdateLabAnalysisSchema } from './types';
import * as projectService from '@/features/projects/service';

/**
 * Server Action: Get all lab analyses for a project
 */
export const getLabAnalysesByProjectAction = actionFactory.protected(
  async ({ input, actor }) => {
    await projectService.assertCanAccessProject(actor, input);
    return service.getLabAnalysesByProject(input);
  },
  {
    schema: z.string().uuid('ID proyek tidak valid'),
    metadata: {
      rbac: { resource: RbacResource.LAB_ANALYSES, capability: 'read' },
    },
  }
);

/**
 * Server Action: Get single lab analysis detail
 */
export const getLabAnalysisDetailAction = actionFactory.protected(
  async ({ input, actor }) => {
    const data = await service.getLabAnalysisDetail(input);
    if (!data) throw new Error('Data tidak ditemukan');

    await projectService.assertCanAccessProject(actor, data.projectId);
    return data;
  },
  {
    schema: z.string().uuid('ID lab analysis tidak valid'),
    metadata: {
      rbac: { resource: RbacResource.LAB_ANALYSES, capability: 'read' },
    },
  }
);

/**
 * Server Action: Create new lab analysis
 */
export const createLabAnalysisAction = actionFactory.protected(
  async ({ input, actor }) => {
    await projectService.assertCanAccessProject(actor, input.projectId);

    const created = await service.createLabAnalysis(input);

    revalidatePath(`/lab-analyses/${input.projectId}`);
    revalidatePath(`/lab-analyses/${input.projectId}/${created.id}/edit`);
    revalidatePath(`/lab-analyses/${input.projectId}/${created.id}/print`);

    return { id: created.id };
  },
  {
    schema: CreateLabAnalysisSchema,
    metadata: {
      rbac: { resource: RbacResource.LAB_ANALYSES, capability: 'create' },
    },
  }
);

/**
 * Server Action: Update existing lab analysis
 */
export const updateLabAnalysisAction = actionFactory.protected(
  async ({ input, actor }) => {
    const existing = await service.getLabAnalysisDetail(input.id);
    if (!existing) throw new Error('Data tidak ditemukan');

    await projectService.assertCanAccessProject(actor, existing.projectId);

    const updated = await service.updateLabAnalysis({
      ...input,
      projectId: existing.projectId,
    });

    revalidatePath(`/lab-analyses/${existing.projectId}`);
    revalidatePath(`/lab-analyses/${existing.projectId}/${updated.id}/edit`);
    revalidatePath(`/lab-analyses/${existing.projectId}/${updated.id}/print`);

    return { id: updated.id };
  },
  {
    schema: UpdateLabAnalysisSchema,
    metadata: {
      rbac: { resource: RbacResource.LAB_ANALYSES, capability: 'update' },
    },
  }
);

/**
 * Server Action: Delete a lab analysis
 */
export const deleteLabAnalysisAction = actionFactory.protected(
  async ({ input, actor }) => {
    const labAnalysis = await service.getLabAnalysisDetail(input);
    if (!labAnalysis) throw new Error('Data tidak ditemukan');

    await projectService.assertCanAccessProject(actor, labAnalysis.projectId);

    await service.deleteLabAnalysis(input);

    revalidatePath(`/lab-analyses/${labAnalysis.projectId}`);

    return { success: true };
  },
  {
    schema: z.string().uuid('ID lab analysis tidak valid'),
    metadata: {
      rbac: { resource: RbacResource.LAB_ANALYSES, capability: 'delete' },
    },
  }
);
