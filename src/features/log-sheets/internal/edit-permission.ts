import { prisma } from '@/lib/prisma';
import type { IJwtPayload } from '@/@types/auth.type';
import { ensureAccess, RbacResource } from '@/lib/rbac';
import * as projectService from '@/features/projects/service';
import { getLogSheetEditState } from '../log-sheet-locking';
import type { TLogSheetStatus } from '../types';

export type TLogSheetEditOptions = {
  allowAdminOverride?: boolean;
};

export async function assertLogSheetEditable(
  actor: IJwtPayload,
  logSheetId: string,
  options?: TLogSheetEditOptions
) {
  ensureAccess(actor.role, RbacResource.LOG_SHEETS, 'update');

  const row = await prisma.logSheet.findFirst({
    where: { id: logSheetId, deletedAt: null },
    select: {
      id: true,
      projectId: true,
      status: true,
      locked: true,
      replacedByUserId: true,
    },
  });

  if (!row) {
    throw new Error('Log sheet tidak ditemukan');
  }

  await projectService.assertCanAccessProject(actor, row.projectId);

  // Additional authorization: user must either have an active project assignment
  // OR be the designated replacement user for this specific logsheet.
  // ADMIN bypasses this check.
  if (actor.role !== 'ADMIN') {
    const assignment = await prisma.projectAssignment.findFirst({
      where: {
        userId: actor.id,
        projectId: row.projectId,
        isActive: true,
      },
      select: { id: true },
    });

    const isReplacement = row.replacedByUserId === actor.id;

    if (!assignment && !isReplacement) {
      throw new Error(
        'Anda tidak memiliki hak akses untuk mengedit log sheet ini'
      );
    }
  }

  const state = getLogSheetEditState(
    { status: row.status as TLogSheetStatus, locked: row.locked },
    {
      isAdmin: actor.role === 'ADMIN',
      allowAdminOverride: options?.allowAdminOverride ?? false,
    }
  );

  if (state === 'EDITABLE') {
    return row;
  }

  if (state === 'LOCKED_APPROVED') {
    throw new Error('Log sheet sudah disetujui');
  }

  throw new Error('Log sheet sudah dikirim dan tidak bisa diubah');
}
