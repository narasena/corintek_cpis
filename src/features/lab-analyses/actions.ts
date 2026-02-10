'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import * as service from './service';
import { CreateLabAnalysisSchema, UpdateLabAnalysisSchema } from './types';

export async function getLabAnalysesByProjectAction(projectId: string) {
  try {
    const data = await service.getLabAnalysesByProject(projectId);
    return { success: true, data };
  } catch (error) {
    console.error('[CPIS-ERROR] LabAnalyses.GetByProject:', error);
    return { success: false, message: 'Gagal memuat data lab analysis' };
  }
}

export async function getLabAnalysisDetailAction(id: string) {
  try {
    const data = await service.getLabAnalysisDetail(id);
    if (!data) return { success: false, message: 'Data tidak ditemukan' };
    return { success: true, data };
  } catch (error) {
    console.error('[CPIS-ERROR] LabAnalyses.GetDetail:', error);
    return { success: false, message: 'Gagal memuat detail lab analysis' };
  }
}

export async function createLabAnalysisAction(input: unknown) {
  try {
    const validated = CreateLabAnalysisSchema.parse(input);
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
    const validated = UpdateLabAnalysisSchema.parse(input);
    const updated = await service.updateLabAnalysis(validated);
    revalidatePath(`/lab-analyses/${validated.projectId}`);
    revalidatePath(`/lab-analyses/${validated.projectId}/${updated.id}/edit`);
    revalidatePath(`/lab-analyses/${validated.projectId}/${updated.id}/print`);
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
