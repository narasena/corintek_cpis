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
    select: { id: true, projectId: true, status: true, locked: true },
  });

  if (!row) {
    throw new Error('Log sheet tidak ditemukan');
  }

  await projectService.assertCanAccessProject(actor, row.projectId);

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
