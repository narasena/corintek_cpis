import { prisma } from '@/lib/prisma';
import type { IJwtPayload } from '@/@types/auth.type';
import { ensureAccess, RbacResource } from '@/lib/rbac';
import * as projectService from '@/features/projects/service';
import { getLogSheetEditState } from './log-sheet-locking';
import type { TLogSheetStatus } from './types';

type TLogSheetEditOptions = {
  allowAdminOverride?: boolean;
};

async function assertLogSheetEditable(
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

export async function upsertLogSheetChemicalUsages(
  actor: IJwtPayload,
  logSheetId: string,
  usages: Array<{
    id?: string;
    chemicalId: string;
    amount: number;
  }>,
  options?: TLogSheetEditOptions
) {
  await assertLogSheetEditable(actor, logSheetId, options);

  const existing = await prisma.chemicalUsage.findMany({
    where: { logSheetId },
    select: { id: true, deletedAt: true },
  });

  const existingById = new Map(existing.map(usage => [usage.id, usage]));
  const seenIds = new Set<string>();

  await prisma.$transaction(async tx => {
    const now = new Date();

    for (const usage of usages) {
      if (usage.amount <= 0) continue;

      if (usage.id && existingById.has(usage.id)) {
        seenIds.add(usage.id);
        await tx.chemicalUsage.update({
          where: { id: usage.id },
          data: {
            chemicalId: usage.chemicalId,
            amount: usage.amount,
            deletedAt: null,
          },
        });
        continue;
      }

      const created = await tx.chemicalUsage.create({
        data: {
          logSheetId,
          chemicalId: usage.chemicalId,
          amount: usage.amount,
        },
      });
      seenIds.add(created.id);
    }

    for (const existingUsage of existing) {
      if (seenIds.has(existingUsage.id)) continue;
      if (existingUsage.deletedAt === null) {
        await tx.chemicalUsage.update({
          where: { id: existingUsage.id },
          data: { deletedAt: now },
        });
      }
    }
  });
}
