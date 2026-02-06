import { prisma } from '@/lib/prisma';
import type { IParameter } from '@/features/parameters/types';
import type { IMachine } from '@/features/machines/types';
import type { TChemicalUsage } from '@/@types/chemical.type';
import type {
  ILogSheet,
  ILogSheetEntry,
  ILogSheetPhoto,
  TCreateLogSheet,
  TCreateLogSheetEntry,
  TUpdateLogSheet,
} from './types';

function makeEntryKey(
  parameterId: string,
  machineId: string | null,
  role: ILogSheetEntry['role']
) {
  return `${parameterId}:${machineId ?? 'null'}:${role}`;
}

function isEntryEmpty(entry: {
  valueType: 'NUMBER' | 'BOOLEAN' | 'TEXT';
  numericValue?: number | null;
  boolValue?: boolean | null;
  textValue?: string | null;
  fileUrl?: string | null;
}) {
  if (entry.fileUrl) return false;

  if (entry.valueType === 'NUMBER') {
    return entry.numericValue === null || entry.numericValue === undefined;
  }

  if (entry.valueType === 'BOOLEAN') {
    return entry.boolValue === null || entry.boolValue === undefined;
  }

  if (entry.valueType === 'TEXT') {
    return (
      entry.textValue === null ||
      entry.textValue === undefined ||
      entry.textValue.trim() === ''
    );
  }

  return true;
}

export interface ILogSheetListItem {
  id: string;
  projectId: string;
  date: Date;
  notes: string | null;
  status: ILogSheet['status'];
  createdAt: Date;
  updatedAt: Date;
}

export interface IGlobalLogSheetListItem extends ILogSheetListItem {
  project: {
    name: string;
    client: {
      name: string;
    } | null;
  };
}

export async function getAllLogSheets(): Promise<IGlobalLogSheetListItem[]> {
  const logSheets = await prisma.logSheet.findMany({
    where: {
      deletedAt: null,
    },
    select: {
      id: true,
      projectId: true,
      date: true,
      notes: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      project: {
        select: {
          name: true,
          client: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
  });

  return logSheets as unknown as IGlobalLogSheetListItem[];
}

export interface ILogSheetDetailView {
  logSheet: ILogSheet;
  project: { id: string; name: string; clientName: string | null };
  machines: {
    chillers: Pick<IMachine, 'id' | 'unitNumber' | 'type'>[];
    coolingTowers: Pick<IMachine, 'id' | 'unitNumber' | 'type'>[];
  };
  parameters: Pick<
    IParameter,
    | 'id'
    | 'name'
    | 'variableName'
    | 'category'
    | 'valueType'
    | 'unit'
    | 'minValue'
    | 'maxValue'
    | 'rawWaterMinValue'
    | 'rawWaterMaxValue'
    | 'displayOrder'
  >[];
  entries: ILogSheetEntry[];
  photos: ILogSheetPhoto[];
  chemicalUsages: (TChemicalUsage & {
    chemicalName: string;
    chemicalUnit: string;
  })[];
}

export async function getLogSheetsByProject(
  projectId: string
): Promise<ILogSheetListItem[]> {
  const logSheets = await prisma.logSheet.findMany({
    where: {
      projectId,
      deletedAt: null,
    },
    select: {
      id: true,
      projectId: true,
      date: true,
      notes: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
  });

  return logSheets as unknown as ILogSheetListItem[];
}

export async function createLogSheet(
  data: TCreateLogSheet
): Promise<ILogSheet> {
  const logSheet = await prisma.logSheet.create({
    data: {
      projectId: data.projectId,
      date: data.date,
      notes: data.notes ?? null,
      replacedByUserId: data.replacedByUserId ?? null,
      status: 'DRAFT',
    },
  });

  return logSheet as unknown as ILogSheet;
}

export async function updateLogSheet(
  data: TUpdateLogSheet
): Promise<ILogSheet> {
  const { id, ...updateData } = data;

  const logSheet = await prisma.logSheet.update({
    where: { id },
    data: {
      ...updateData,
      notes: updateData.notes ?? null,
    },
  });

  return logSheet as unknown as ILogSheet;
}

export async function deleteLogSheet(id: string): Promise<ILogSheet> {
  const logSheet = await prisma.logSheet.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return logSheet as unknown as ILogSheet;
}

export async function getLogSheetDetail(
  id: string
): Promise<ILogSheetDetailView> {
  const logSheet = await prisma.logSheet.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      project: {
        include: {
          client: { select: { name: true } },
          parameterOverrides: true,
        },
      },
      replacedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      entries: {
        where: { deletedAt: null },
        include: {
          parameter: true,
          machine: true,
        },
        orderBy: [{ createdAt: 'asc' }],
      },
      photos: {
        where: { deletedAt: null },
        orderBy: [{ createdAt: 'asc' }],
      },
      chemicalUsages: {
        where: { deletedAt: null },
        include: {
          chemical: true,
        },
        orderBy: {
          chemical: { name: 'asc' },
        },
      },
    },
  });

  if (!logSheet) {
    throw new Error('Log sheet tidak ditemukan');
  }

  const machines = await prisma.machine.findMany({
    where: {
      projectId: logSheet.projectId,
      deletedAt: null,
    },
    select: {
      id: true,
      unitNumber: true,
      type: true,
    },
    orderBy: [{ type: 'asc' }, { unitNumber: 'asc' }],
  });

  const parameters = await prisma.parameter.findMany({
    where: {
      deletedAt: null,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      variableName: true,
      category: true,
      valueType: true,
      unit: true,
      minValue: true,
      maxValue: true,
      rawWaterMinValue: true,
      rawWaterMaxValue: true,
      displayOrder: true,
    },
    orderBy: [
      { category: 'asc' },
      { displayOrder: 'asc' },
      { createdAt: 'asc' },
    ],
  });

  const chillers = machines.filter(m => m.type === 'CHILLER');
  const coolingTowers = machines.filter(m => m.type === 'COOLING_TOWER');

  // Apply project-specific parameter overrides
  const overrides = logSheet.project.parameterOverrides || [];
  const parametersWithOverrides = parameters.map(p => {
    const override = overrides.find(o => o.parameterId === p.id);
    if (!override) return p;

    return {
      ...p,
      minValue: override.minValue ?? p.minValue,
      maxValue: override.maxValue ?? p.maxValue,
      rawWaterMinValue: override.rawWaterMinValue ?? p.rawWaterMinValue,
      rawWaterMaxValue: override.rawWaterMaxValue ?? p.rawWaterMaxValue,
    };
  });

  return {
    logSheet: {
      id: logSheet.id,
      projectId: logSheet.projectId,
      date: logSheet.date,
      notes: logSheet.notes,
      status: logSheet.status as unknown as ILogSheet['status'],
      createdAt: logSheet.createdAt,
      updatedAt: logSheet.updatedAt,
      deletedAt: logSheet.deletedAt,
      project: { id: logSheet.project.id, name: logSheet.project.name },
      replacedBy: logSheet.replacedBy,
    },
    project: {
      id: logSheet.project.id,
      name: logSheet.project.name,
      clientName: logSheet.project.client?.name ?? null,
    },
    machines: {
      chillers,
      coolingTowers,
    },
    parameters:
      parametersWithOverrides as unknown as ILogSheetDetailView['parameters'],
    entries: logSheet.entries.map(e => ({
      id: e.id,
      logSheetId: e.logSheetId,
      parameterId: e.parameterId,
      machineId: e.machineId,
      role: e.role as unknown as ILogSheetEntry['role'],
      valueType: e.valueType as unknown as ILogSheetEntry['valueType'],
      numericValue: e.numericValue,
      boolValue: e.boolValue,
      textValue: e.textValue,
      fileUrl: e.fileUrl,
      checkedAt: e.checkedAt,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      deletedAt: e.deletedAt,
    })),
    photos: logSheet.photos.map(photo => ({
      id: photo.id,
      logSheetId: photo.logSheetId,
      type: photo.type,
      url: photo.url,
      caption: photo.caption,
      createdAt: photo.createdAt,
      updatedAt: photo.updatedAt,
      deletedAt: photo.deletedAt,
    })),
    chemicalUsages: logSheet.chemicalUsages.map(u => ({
      id: u.id,
      logSheetId: u.logSheetId,
      chemicalId: u.chemicalId,
      amount: u.amount,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      chemicalName: u.chemical.name,
      chemicalUnit: u.chemical.unit ?? '',
    })),
  };
}

export async function upsertLogSheetEntries(
  logSheetId: string,
  entries: (TCreateLogSheetEntry & {
    numericValue?: number | null;
    boolValue?: boolean | null;
    textValue?: string | null;
    fileUrl?: string | null;
  })[]
) {
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
      const role = (entry.role ?? 'VALUE') as ILogSheetEntry['role'];
      const key = makeEntryKey(
        entry.parameterId,
        entry.machineId ?? null,
        role
      );
      const existingEntry = existingByKey.get(key);
      const empty = isEntryEmpty(entry);

      if (empty) {
        if (existingEntry && existingEntry.deletedAt === null) {
          await tx.logSheetEntry.update({
            where: { id: existingEntry.id },
            data: { deletedAt: now },
          });
        }
        continue;
      }

      const normalized = {
        logSheetId,
        parameterId: entry.parameterId,
        machineId: entry.machineId ?? null,
        role,
        valueType: entry.valueType,
        numericValue:
          entry.valueType === 'NUMBER' ? (entry.numericValue ?? null) : null,
        boolValue:
          entry.valueType === 'BOOLEAN' ? (entry.boolValue ?? null) : null,
        textValue:
          entry.valueType === 'TEXT' ? (entry.textValue ?? null) : null,
        fileUrl: entry.fileUrl ?? null,
        checkedAt: entry.checkedAt ?? null,
      };

      if (existingEntry) {
        await tx.logSheetEntry.update({
          where: { id: existingEntry.id },
          data: { ...normalized, deletedAt: null },
        });
      } else {
        await tx.logSheetEntry.create({
          data: normalized,
        });
      }
    }
  });
}

export async function upsertLogSheetPhotos(
  logSheetId: string,
  photos: Array<{
    id?: string;
    type: ILogSheetPhoto['type'];
    url: string;
    caption?: string | null;
  }>
) {
  const existing = await prisma.logSheetPhoto.findMany({
    where: { logSheetId },
    select: { id: true, deletedAt: true },
  });

  const existingById = new Map(existing.map(photo => [photo.id, photo]));
  const seenIds = new Set<string>();

  await prisma.$transaction(async tx => {
    const now = new Date();

    for (const photo of photos) {
      if (photo.id && existingById.has(photo.id)) {
        seenIds.add(photo.id);
        await tx.logSheetPhoto.update({
          where: { id: photo.id },
          data: {
            type: photo.type,
            url: photo.url,
            caption: photo.caption ?? null,
            deletedAt: null,
          },
        });
        continue;
      }

      const created = await tx.logSheetPhoto.create({
        data: {
          logSheetId,
          type: photo.type,
          url: photo.url,
          caption: photo.caption ?? null,
        },
      });
      seenIds.add(created.id);
    }

    for (const existingPhoto of existing) {
      if (seenIds.has(existingPhoto.id)) continue;
      if (existingPhoto.deletedAt === null) {
        await tx.logSheetPhoto.update({
          where: { id: existingPhoto.id },
          data: { deletedAt: now },
        });
      }
    }
  });
}

export async function upsertLogSheetChemicalUsages(
  logSheetId: string,
  usages: Array<{
    id?: string;
    chemicalId: string;
    amount: number;
  }>
) {
  const existing = await prisma.chemicalUsage.findMany({
    where: { logSheetId },
    select: { id: true, deletedAt: true },
  });

  const existingById = new Map(existing.map(usage => [usage.id, usage]));
  const seenIds = new Set<string>();

  await prisma.$transaction(async tx => {
    const now = new Date();

    for (const usage of usages) {
      if (usage.amount <= 0) continue; // Skip zero/negative amounts

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
