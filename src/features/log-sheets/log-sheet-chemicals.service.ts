import { prisma } from '@/lib/prisma';
import type { IJwtPayload } from '@/@types/auth.type';
import {
  assertLogSheetEditable,
  type TLogSheetEditOptions,
} from './internal/edit-permission';

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
