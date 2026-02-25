import { prisma } from '@/lib/prisma';
import type { IJwtPayload } from '@/@types/auth.type';
import type { ILogSheetEntry, TCreateLogSheetEntry } from './types';
import { isLogSheetEntryEmpty, makeEntryKey } from './utils';
import {
  assertLogSheetEditable,
  type TLogSheetEditOptions,
} from './internal/edit-permission';
import type { PrismaClient } from '@/generated/prisma/client';

async function upsertSingleLogSheetEntry(
  tx: PrismaClient['$transaction'] extends (fn: infer F) => any
    ? F extends (arg: infer A) => any
      ? A
      : never
    : never,
  logSheetId: string,
  entry: TCreateLogSheetEntry & {
    numericValue?: number | null;
    boolValue?: boolean | null;
    textValue?: string | null;
    fileUrl?: string | null;
  },
  existingByKey: Map<string, { id: string; deletedAt: Date | null }>,
  now: Date
) {
  const role = (entry.role ?? 'VALUE') as ILogSheetEntry['role'];
  const key = makeEntryKey(entry.parameterId, entry.machineId ?? null, role);
  const existingEntry = existingByKey.get(key);
  const empty = isLogSheetEntryEmpty(entry);

  if (empty) {
    if (existingEntry && existingEntry.deletedAt === null) {
      await tx.logSheetEntry.update({
        where: { id: existingEntry.id },
        data: { deletedAt: now },
      });
    }
    return;
  }

  const normalized = {
    logSheetId,
    parameterId: entry.parameterId,
    machineId: entry.machineId ?? null,
    role,
    valueType: entry.valueType,
    numericValue:
      entry.valueType === 'NUMBER' ? (entry.numericValue ?? null) : null,
    boolValue: entry.valueType === 'BOOLEAN' ? (entry.boolValue ?? null) : null,
    textValue: entry.valueType === 'TEXT' ? (entry.textValue ?? null) : null,
    fileUrl: entry.fileUrl ?? null,
    checkedAt: entry.checkedAt ?? null,
  };

  if (existingEntry) {
    await tx.logSheetEntry.update({
      where: { id: existingEntry.id },
      data: { ...normalized, deletedAt: null },
    });
    return;
  }

  await tx.logSheetEntry.create({
    data: normalized,
  });
}

export async function upsertLogSheetEntries(
  actor: IJwtPayload,
  logSheetId: string,
  entries: (TCreateLogSheetEntry & {
    numericValue?: number | null;
    boolValue?: boolean | null;
    textValue?: string | null;
    fileUrl?: string | null;
  })[],
  options?: TLogSheetEditOptions
) {
  await assertLogSheetEditable(actor, logSheetId, options);

  const existing = await prisma.logSheetEntry.findMany({
    where: { logSheetId },
    select: {
      id: true,
      parameterId: true,
      machineId: true,
      role: true,
      deletedAt: true,
    },
  });

  const existingByKey = new Map(
    existing.map(e => [
      makeEntryKey(
        e.parameterId,
        e.machineId,
        e.role as unknown as ILogSheetEntry['role']
      ),
      e,
    ])
  );

  await prisma.$transaction(async tx => {
    const now = new Date();
    for (const entry of entries) {
      await upsertSingleLogSheetEntry(
        tx,
        logSheetId,
        entry,
        existingByKey,
        now
      );
    }
  });
}
