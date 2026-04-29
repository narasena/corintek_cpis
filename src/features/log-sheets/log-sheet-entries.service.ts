import { prisma } from '@/lib/prisma';
import type { IJwtPayload } from '@/@types/auth.type';
import type { ILogSheetEntry, TCreateLogSheetEntry } from './types';
import { isLogSheetEntryEmpty, makeEntryKey } from './utils';
import {
  assertLogSheetEditable,
  type TLogSheetEditOptions,
} from './internal/edit-permission';

type TPrismaTransaction = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

async function upsertSingleLogSheetEntry(
  tx: TPrismaTransaction,
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

interface IWaterMeterParams {
  beforeId: string | null;
  afterId: string | null;
  totalId: string | null;
}

async function getWaterMeterParams(
  logSheetId: string
): Promise<IWaterMeterParams> {
  const logSheet = await prisma.logSheet.findFirst({
    where: { id: logSheetId },
    select: {
      projectId: true,
    },
  });

  if (!logSheet) {
    return { beforeId: null, afterId: null, totalId: null };
  }

  const consumptionParams = await prisma.parameter.findMany({
    where: {
      category: 'CONSUMPTION',
    },
    select: {
      id: true,
      name: true,
    },
  });

  let beforeId: string | null = null;
  let afterId: string | null = null;
  let totalId: string | null = null;

  for (const param of consumptionParams) {
    const nameLower = param.name.toLowerCase();
    if (nameLower.includes('before') && !nameLower.includes('after')) {
      beforeId = param.id;
    } else if (nameLower.includes('after') && !nameLower.includes('before')) {
      afterId = param.id;
    } else if (
      nameLower.includes('total') ||
      nameLower.includes('consumption')
    ) {
      if (!totalId) {
        totalId = param.id;
      }
    }
  }

  return { beforeId, afterId, totalId };
}

async function calculateAndSaveWaterMeterTotal(
  tx: TPrismaTransaction,
  logSheetId: string,
  waterMeterParams: IWaterMeterParams,
  existingByKey: Map<string, { id: string; deletedAt: Date | null }>,
  now: Date
) {
  const { beforeId, afterId, totalId } = waterMeterParams;

  if (!beforeId || !afterId || !totalId) return;

  const [beforeEntry, afterEntry] = await Promise.all([
    tx.logSheetEntry.findFirst({
      where: { logSheetId, parameterId: beforeId, deletedAt: null },
      select: { numericValue: true },
    }),
    tx.logSheetEntry.findFirst({
      where: { logSheetId, parameterId: afterId, deletedAt: null },
      select: { numericValue: true },
    }),
  ]);

  const beforeValue = beforeEntry?.numericValue;
  const afterValue = afterEntry?.numericValue;

  if (
    beforeValue === null ||
    beforeValue === undefined ||
    afterValue === null ||
    afterValue === undefined
  ) {
    return;
  }

  const totalValue = afterValue - beforeValue;

  await upsertSingleLogSheetEntry(
    tx,
    logSheetId,
    {
      logSheetId,
      parameterId: totalId,
      machineId: null,
      role: 'VALUE',
      valueType: 'NUMBER',
      numericValue: totalValue,
    },
    existingByKey,
    now
  );
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

  const waterMeterParams = await getWaterMeterParams(logSheetId);

  await prisma.$transaction(
    async tx => {
      const now = new Date();
      await Promise.all(
        entries.map(entry =>
          upsertSingleLogSheetEntry(tx, logSheetId, entry, existingByKey, now)
        )
      );
      await calculateAndSaveWaterMeterTotal(
        tx,
        logSheetId,
        waterMeterParams,
        existingByKey,
        now
      );
    },
    { timeout: 30000 } // 30 seconds
  );
}
