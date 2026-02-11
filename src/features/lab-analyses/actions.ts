'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import * as service from './service';
import { CreateLabAnalysisSchema, UpdateLabAnalysisSchema } from './types';
import { getCurrentUserDetails } from '@/lib/auth-helpers';
import { ensureAccess, RbacResource } from '@/lib/rbac';
import * as projectService from '@/features/projects/service';
import type { IJwtPayload } from '@/@types/auth.type';

export async function getLabAnalysesByProjectAction(projectId: string) {
  try {
    const actorDetails = await getCurrentUserDetails();
    if (!actorDetails) return { success: false, message: 'Unauthorized' };
    const actor: IJwtPayload = {
      id: actorDetails.id,
      email: actorDetails.email,
      role: actorDetails.role,
    };

    ensureAccess(actor.role, RbacResource.LAB_ANALYSES, 'read');
    const validatedProjectId = z.string().uuid().parse(projectId);
    await projectService.assertCanAccessProject(actor, validatedProjectId);

    const data = await service.getLabAnalysesByProject(validatedProjectId);
    return { success: true, data };
  } catch (error) {
    console.error('[CPIS-ERROR] LabAnalyses.GetByProject:', error);
    return { success: false, message: 'Gagal memuat data lab analysis' };
  }
}

export async function getLabAnalysisDetailAction(id: string) {
  try {
    const actorDetails = await getCurrentUserDetails();
    if (!actorDetails) return { success: false, message: 'Unauthorized' };
    const actor: IJwtPayload = {
      id: actorDetails.id,
      email: actorDetails.email,
      role: actorDetails.role,
    };

    ensureAccess(actor.role, RbacResource.LAB_ANALYSES, 'read');
    const validatedId = z.string().uuid().parse(id);
    const data = await service.getLabAnalysisDetail(validatedId);
    if (!data) return { success: false, message: 'Data tidak ditemukan' };
    await projectService.assertCanAccessProject(actor, data.projectId);
    return { success: true, data };
  } catch (error) {
    console.error('[CPIS-ERROR] LabAnalyses.GetDetail:', error);
    return { success: false, message: 'Gagal memuat detail lab analysis' };
  }
}

export async function createLabAnalysisAction(input: unknown) {
  try {
    const actorDetails = await getCurrentUserDetails();
    if (!actorDetails) return { success: false, message: 'Unauthorized' };
    const actor: IJwtPayload = {
      id: actorDetails.id,
      email: actorDetails.email,
      role: actorDetails.role,
    };

    ensureAccess(actor.role, RbacResource.LAB_ANALYSES, 'create');
    const validated = CreateLabAnalysisSchema.parse(input);
    await projectService.assertCanAccessProject(actor, validated.projectId);
    const created = await service.createLabAnalysis(validated);
    revalidatePath(`/lab-analyses/${validated.projectId}`);
    revalidatePath(`/lab-analyses/${validated.projectId}/${created.id}/edit`);
    revalidatePath(`/lab-analyses/${validated.projectId}/${created.id}/print`);
    return { success: true, data: { id: created.id } };
  } catch (error) {
    console.error('[CPIS-ERROR] LabAnalyses.Create:', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: (error as any).errors[0]?.message ?? 'Validasi gagal',
      };
    }
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Gagal membuat lab analysis',
    };
  }
}

export async function updateLabAnalysisAction(input: unknown) {
  try {
    const actorDetails = await getCurrentUserDetails();
    if (!actorDetails) return { success: false, message: 'Unauthorized' };
    const actor: IJwtPayload = {
      id: actorDetails.id,
      email: actorDetails.email,
      role: actorDetails.role,
    };

    ensureAccess(actor.role, RbacResource.LAB_ANALYSES, 'update');
    const validated = UpdateLabAnalysisSchema.parse(input);
    const existing = await service.getLabAnalysisDetail(validated.id);
    if (!existing) return { success: false, message: 'Data tidak ditemukan' };

    await projectService.assertCanAccessProject(actor, existing.projectId);

    const updated = await service.updateLabAnalysis({
      ...validated,
      projectId: existing.projectId,
    });
    revalidatePath(`/lab-analyses/${existing.projectId}`);
    revalidatePath(`/lab-analyses/${existing.projectId}/${updated.id}/edit`);
    revalidatePath(`/lab-analyses/${existing.projectId}/${updated.id}/print`);
    return { success: true, data: { id: updated.id } };
  } catch (error) {
    console.error('[CPIS-ERROR] LabAnalyses.Update:', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: (error as any).errors[0]?.message ?? 'Validasi gagal',
      };
    }
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Gagal memperbarui lab analysis',
    };
  }
}
