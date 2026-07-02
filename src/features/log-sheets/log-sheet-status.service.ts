import { prisma } from '@/lib/prisma';
import type { IJwtPayload } from '@/@types/auth.type';
import { ensureAccess, RbacResource } from '@/lib/rbac';
import * as projectService from '@/features/projects/service';
import type { ILogSheet, TLogSheetStatus } from './types';
import { validateLogSheetApprovalDetail } from './approval-validation';
import { decideLogSheetStatusTransition } from './log-sheet-status';
import { getLogSheetDetail, hasProjectAssignment } from './service';

export async function updateLogSheetStatus(
  actor: IJwtPayload,
  id: string,
  status: ILogSheet['status'],
  options?: { rejectionReason?: string }
): Promise<ILogSheet> {
  ensureAccess(actor.role, RbacResource.LOG_SHEETS, 'update');

  const row = await prisma.logSheet.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      projectId: true,
      status: true,
      replacedByUserId: true,
    },
  });

  if (!row) {
    throw new Error('Log sheet tidak ditemukan');
  }

  await projectService.assertCanAccessProject(actor, row.projectId);

  const isInternalPic =
    actor.role === 'ADMIN' ||
    (actor.role === 'SUPERVISOR' &&
      (await hasProjectAssignment(actor.id, row.projectId, 'PROJECT_PIC')));
  const isInternalTechnician =
    (actor.role === 'TECHNICIAN' &&
      (await hasProjectAssignment(actor.id, row.projectId, 'TECHNICIAN'))) ||
    actor.id === row.replacedByUserId;

  const current = row.status;

  if (status === current) {
    const unchanged = await prisma.logSheet.findFirst({
      where: { id: row.id, deletedAt: null },
    });
    if (!unchanged) throw new Error('Log sheet tidak ditemukan');
    return unchanged as unknown as ILogSheet;
  }

  const decision = decideLogSheetStatusTransition({
    current: current as TLogSheetStatus,
    target: status as TLogSheetStatus,
    isInternalPic,
    isInternalTechnician,
  });

  if (!decision.ok) {
    throw new Error(decision.error);
  }

  if (decision.requiresApprovalValidation) {
    await validateLogSheetForApproval(id);
  }

  const now = new Date();
  const updated = await prisma.logSheet.update({
    where: { id: row.id },
    data: {
      status,
      ...(status === 'SUBMITTED'
        ? { submittedAt: now, submittedByUserId: actor.id }
        : {}),
      ...(status === 'APPROVED'
        ? { approvedAt: now, approvedByUserId: actor.id }
        : {}),
      ...(status === 'DRAFT' && current === 'SUBMITTED'
        ? {
            rejectedAt: now,
            rejectedByUserId: actor.id,
            rejectionReason: options?.rejectionReason ?? null,
          }
        : {}),
    },
  });

  return updated as unknown as ILogSheet;
}

export async function validateLogSheetForSubmission(
  id: string,
  options?: { actorRole?: string }
) {
  const detail = await getLogSheetDetail(id);
  const errors: string[] = [];

  if (!detail.logSheet.technicianSignatureUrl) {
    errors.push('Tanda tangan teknisi belum diisi');
  }
  // Admin can override — client PIC signature not required
  if (!detail.logSheet.clientPicSignatureUrl && options?.actorRole !== 'ADMIN') {
    errors.push('Tanda tangan PIC klien belum diisi');
  }
  // Numeric range validation removed: out-of-range values are warnings, not blockers.
  // Warnings are handled by notifyLimitBreachesOnSubmission in status-with-notifications.ts

  if (errors.length > 0) {
    throw new Error(`Validasi gagal:\n${errors.join('\n')}`);
  }
}

export async function validateLogSheetForApproval(id: string) {
  const detail = await getLogSheetDetail(id);
  validateLogSheetApprovalDetail(detail);
}
