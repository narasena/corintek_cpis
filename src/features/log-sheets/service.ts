import { prisma } from '@/lib/prisma';
import { ParameterCategory } from '@/generated/prisma/client';
import type { IParameter } from '@/features/parameters/types';
import type { IMachine } from '@/features/machines/types';
import type { TChemicalUsage } from '@/@types/chemical.type';
import type { IJwtPayload } from '@/@types/auth.type';
import { ensureAccess, RbacResource } from '@/lib/rbac';
import * as projectService from '@/features/projects/service';
import type {
  ILogSheet,
  ILogSheetEntry,
  ILogSheetPhoto,
  TCreateLogSheet,
  TCreateLogSheetEntry,
  TUpdateLogSheet,
} from './types';
import { isLogSheetEntryEmpty, makeEntryKey } from './utils';

function isEntryComplete(
  entry?: Pick<
    ILogSheetEntry,
    'valueType' | 'numericValue' | 'boolValue' | 'textValue'
  >
) {
  if (!entry) return false;

  if (entry.valueType === 'NUMBER') {
    return (
      entry.numericValue !== null &&
      entry.numericValue !== undefined &&
      !Number.isNaN(entry.numericValue)
    );
  }

  if (entry.valueType === 'BOOLEAN') {
    return entry.boolValue !== null && entry.boolValue !== undefined;
  }

  if (entry.valueType === 'TEXT') {
    return !!entry.textValue && entry.textValue.trim() !== '';
  }

  return false;
}

async function hasProjectAssignment(
  userId: string,
  projectId: string,
  role: 'PROJECT_PIC' | 'TECHNICIAN' | 'CLIENT_PIC'
) {
  const assignment = await prisma.projectAssignment.findFirst({
    where: {
      userId,
      projectId,
      role,
      isActive: true,
    },
    select: { id: true },
  });

  return !!assignment;
}

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
    select: { id: true, projectId: true, status: true },
  });

  if (!row) {
    throw new Error('Log sheet tidak ditemukan');
  }

  await projectService.assertCanAccessProject(actor, row.projectId);

  if (row.status === 'DRAFT') {
    return row;
  }

  if (actor.role === 'ADMIN' && options?.allowAdminOverride) {
    return row;
  }

  if (row.status === 'APPROVED') {
    throw new Error('Log sheet sudah disetujui');
  }

  throw new Error('Log sheet sudah dikirim dan tidak bisa diubah');
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

export async function getAllLogSheets(
  projectIds?: string[]
): Promise<IGlobalLogSheetListItem[]> {
  const logSheets = await prisma.logSheet.findMany({
    where: {
      deletedAt: null,
      ...(projectIds ? { projectId: { in: projectIds } } : {}),
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
  project: {
    id: string;
    name: string;
    clientName: string | null;
    assignments?: Array<{
      role: 'PROJECT_PIC' | 'TECHNICIAN' | 'CLIENT_PIC';
      user: { id: string; firstName: string; lastName: string | null };
    }>;
  };
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
  activeMachineIds: {
    chillers: string[];
    coolingTowers: string[];
  };
}

export async function getLogSheetActiveMachines(logSheetId: string) {
  const machines = await prisma.logSheetMachine.findMany({
    where: { logSheetId },
    select: { machineId: true },
  });
  return machines.map(m => m.machineId);
}

export async function upsertLogSheetMachines(
  actor: IJwtPayload,
  logSheetId: string,
  machineIds: string[],
  options?: TLogSheetEditOptions
) {
  await assertLogSheetEditable(actor, logSheetId, options);

  const existing = await getLogSheetActiveMachines(logSheetId);
  const toAdd = machineIds.filter(id => !existing.includes(id));
  const toRemove = existing.filter(id => !machineIds.includes(id));

  await prisma.$transaction(async tx => {
    if (toRemove.length > 0) {
      await tx.logSheetMachine.deleteMany({
        where: {
          logSheetId,
          machineId: { in: toRemove },
        },
      });

      // Also soft-delete entries for removed machines
      await tx.logSheetEntry.updateMany({
        where: {
          logSheetId,
          machineId: { in: toRemove },
          deletedAt: null,
        },
        data: { deletedAt: new Date() },
      });
    }

    if (toAdd.length > 0) {
      await tx.logSheetMachine.createMany({
        data: toAdd.map(machineId => ({
          logSheetId,
          machineId,
        })),
      });
    }
  });
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

export async function getLogSheetProjectId(id: string): Promise<string | null> {
  const row = await prisma.logSheet.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    select: {
      projectId: true,
    },
  });

  return row?.projectId ?? null;
}

export async function assertCanCreateLogSheet(
  actor: IJwtPayload,
  projectId: string
) {
  if (actor.role === 'ADMIN') return;

  const isInternalPic =
    actor.role === 'SUPERVISOR' &&
    (await hasProjectAssignment(actor.id, projectId, 'PROJECT_PIC'));
  const isInternalTechnician =
    actor.role === 'TECHNICIAN' &&
    (await hasProjectAssignment(actor.id, projectId, 'TECHNICIAN'));

  if (!isInternalPic && !isInternalTechnician) {
    throw new Error('Unauthorized');
  }
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
  actor: IJwtPayload,
  data: TUpdateLogSheet,
  options?: TLogSheetEditOptions
): Promise<ILogSheet> {
  const { id, ...updateData } = data;

  await assertLogSheetEditable(actor, id, options);

  const logSheet = await prisma.logSheet.update({
    where: { id },
    data: {
      ...updateData,
      notes: updateData.notes ?? null,
    },
  });

  return logSheet as unknown as ILogSheet;
}

export async function updateLogSheetStatus(
  actor: IJwtPayload,
  id: string,
  status: ILogSheet['status']
): Promise<ILogSheet> {
  ensureAccess(actor.role, RbacResource.LOG_SHEETS, 'update');

  const row = await prisma.logSheet.findFirst({
    where: { id, deletedAt: null },
    select: { id: true, projectId: true, status: true },
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
    actor.role === 'TECHNICIAN' &&
    (await hasProjectAssignment(actor.id, row.projectId, 'TECHNICIAN'));

  const current = row.status;

  if (status === current) {
    const unchanged = await prisma.logSheet.findFirst({
      where: { id: row.id, deletedAt: null },
    });
    if (!unchanged) throw new Error('Log sheet tidak ditemukan');
    return unchanged as unknown as ILogSheet;
  }

  if (status === 'SUBMITTED') {
    if (current !== 'DRAFT') {
      throw new Error('Log sheet hanya bisa dikirim dari status DRAFT');
    }
    if (!isInternalTechnician && !isInternalPic) {
      throw new Error('Unauthorized');
    }
  } else if (status === 'APPROVED') {
    if (current !== 'SUBMITTED') {
      throw new Error('Log sheet hanya bisa disetujui dari status SUBMITTED');
    }
    if (!isInternalPic) {
      throw new Error('Unauthorized');
    }
    await validateLogSheetForApproval(id);
  } else if (status === 'DRAFT') {
    throw new Error('Tidak dapat mengubah status kembali ke DRAFT');
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
    },
  });

  return updated as unknown as ILogSheet;
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
          assignments: {
            where: { isActive: true },
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true },
              },
            },
          },
        },
      },
      replacedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      submittedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      approvedBy: {
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
      activeMachines: true,
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
      category: {
        not: ParameterCategory.LAB_ANALYSIS,
      },
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

  // activeMachineIds logic
  let activeChillerIds = logSheet.activeMachines
    .filter(am => chillers.some(c => c.id === am.machineId))
    .map(am => am.machineId);
  let activeCTIds = logSheet.activeMachines
    .filter(am => coolingTowers.some(ct => ct.id === am.machineId))
    .map(am => am.machineId);

  // Fallback: if no active machines recorded, assume all are active
  if (logSheet.activeMachines.length === 0) {
    activeChillerIds = chillers.map(c => c.id);
    activeCTIds = coolingTowers.map(ct => ct.id);
  }

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
      submittedAt: logSheet.submittedAt,
      submittedByUserId: logSheet.submittedByUserId,
      approvedAt: logSheet.approvedAt,
      approvedByUserId: logSheet.approvedByUserId,
      createdAt: logSheet.createdAt,
      updatedAt: logSheet.updatedAt,
      deletedAt: logSheet.deletedAt,
      project: { id: logSheet.project.id, name: logSheet.project.name },
      replacedBy: logSheet.replacedBy,
      submittedBy: logSheet.submittedBy,
      approvedBy: logSheet.approvedBy,
    },
    project: {
      id: logSheet.project.id,
      name: logSheet.project.name,
      clientName: logSheet.project.client?.name ?? null,
      assignments: (logSheet.project.assignments ?? []).map(a => ({
        role: a.role as unknown as 'PROJECT_PIC' | 'TECHNICIAN' | 'CLIENT_PIC',
        user: a.user,
      })),
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
      url: photo.url,
      type: photo.type as unknown as ILogSheetPhoto['type'],
      caption: photo.caption,
      createdAt: photo.createdAt,
      updatedAt: photo.updatedAt,
      deletedAt: photo.deletedAt,
    })),
    chemicalUsages: logSheet.chemicalUsages.map(usage => ({
      id: usage.id,
      logSheetId: usage.logSheetId,
      chemicalId: usage.chemicalId,
      amount: usage.amount,
      chemicalName: usage.chemical.name,
      chemicalUnit: usage.chemical.unit || '',
      createdAt: usage.createdAt,
      updatedAt: usage.updatedAt,
    })),
    activeMachineIds: {
      chillers: activeChillerIds,
      coolingTowers: activeCTIds,
    },
  };
}

export async function validateLogSheetForSubmission(id: string) {
  const detail = await getLogSheetDetail(id);
  const errors: string[] = [];

  for (const entry of detail.entries) {
    if (entry.valueType === 'NUMBER' && entry.numericValue !== null) {
      const param = detail.parameters.find(p => p.id === entry.parameterId);
      if (!param) continue;

      let min: number | null = param.minValue;
      let max: number | null = param.maxValue;

      if (entry.role === 'RAW_WATER') {
        min = param.rawWaterMinValue ?? null;
        max = param.rawWaterMaxValue ?? null;
      }

      if (min !== null && entry.numericValue < min) {
        errors.push(
          `${param.name}: Nilai ${entry.numericValue} di bawah minimum ${min}`
        );
      }
      if (max !== null && entry.numericValue > max) {
        errors.push(
          `${param.name}: Nilai ${entry.numericValue} di atas maksimum ${max}`
        );
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Validasi gagal:\n${errors.join('\n')}`);
  }
}

export async function validateLogSheetForApproval(id: string) {
  const detail = await getLogSheetDetail(id);
  const parameterById = new Map(detail.parameters.map(p => [p.id, p]));
  const entryByKey = new Map(
    detail.entries.map(entry => [
      makeEntryKey(
        entry.parameterId,
        entry.machineId,
        entry.role as ILogSheetEntry['role']
      ),
      entry,
    ])
  );
  const machineLabelById = new Map<string, string>();

  for (const machine of detail.machines.chillers) {
    machineLabelById.set(machine.id, `Chiller #${machine.unitNumber}`);
  }
  for (const machine of detail.machines.coolingTowers) {
    machineLabelById.set(machine.id, `CT #${machine.unitNumber}`);
  }

  const errors: string[] = [];

  for (const entry of detail.entries) {
    if (entry.valueType === 'NUMBER' && entry.numericValue !== null) {
      const param = parameterById.get(entry.parameterId);
      if (!param) continue;

      let min: number | null = param.minValue;
      let max: number | null = param.maxValue;

      if (entry.role === 'RAW_WATER') {
        min = param.rawWaterMinValue ?? null;
        max = param.rawWaterMaxValue ?? null;
      }

      if (min !== null && entry.numericValue < min) {
        errors.push(
          `${param.name}: Nilai ${entry.numericValue} di bawah minimum ${min}`
        );
      }
      if (max !== null && entry.numericValue > max) {
        errors.push(
          `${param.name}: Nilai ${entry.numericValue} di atas maksimum ${max}`
        );
      }
    }
  }

  for (const param of detail.parameters) {
    const category = param.category;

    if (category === 'COOLING_WATER_QUALITY') {
      const activeCTs = detail.machines.coolingTowers.filter(m =>
        detail.activeMachineIds.coolingTowers.includes(m.id)
      );
      for (const machine of activeCTs) {
        const key = makeEntryKey(param.id, machine.id, 'VALUE');
        const entry = entryByKey.get(key);
        if (!isEntryComplete(entry)) {
          const label = machineLabelById.get(machine.id) ?? 'Mesin';
          errors.push(`${param.name} (${label}) wajib diisi`);
        }
      }

      const rawKey = makeEntryKey(param.id, null, 'RAW_WATER');
      const rawEntry = entryByKey.get(rawKey);
      if (!isEntryComplete(rawEntry)) {
        errors.push(`${param.name} (Raw Water) wajib diisi`);
      }

      continue;
    }

    const usesChillers =
      category === 'UNIT_CONDENSOR' || category === 'UNIT_EVAPORATOR';
    const usesCoolingTowers =
      category === 'GENERAL_CONDITION' || category === 'JOB_DESCRIPTION';

    const activeChillers = detail.machines.chillers.filter(m =>
      detail.activeMachineIds.chillers.includes(m.id)
    );
    const activeCTs = detail.machines.coolingTowers.filter(m =>
      detail.activeMachineIds.coolingTowers.includes(m.id)
    );

    const machines = usesChillers
      ? activeChillers
      : usesCoolingTowers
        ? activeCTs
        : [];

    const targets =
      machines.length > 0
        ? machines.map(machine => ({ id: machine.id }))
        : category === 'CONSUMPTION'
          ? [{ id: null as string | null }]
          : [];

    for (const target of targets) {
      const key = makeEntryKey(param.id, target.id, 'VALUE');
      const entry = entryByKey.get(key);
      if (!isEntryComplete(entry)) {
        const label =
          target.id === null
            ? 'Nilai'
            : (machineLabelById.get(target.id) ?? 'Mesin');
        errors.push(`${param.name} (${label}) wajib diisi`);
      }
    }

    if (usesCoolingTowers && activeCTs.length > 0) {
      const noteKey = makeEntryKey(param.id, null, 'NOTE');
      const noteEntry = entryByKey.get(noteKey);
      if (!isEntryComplete(noteEntry)) {
        errors.push(`${param.name} (Catatan) wajib diisi`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Validasi gagal:\n${errors.join('\n')}`);
  }
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
      const role = (entry.role ?? 'VALUE') as ILogSheetEntry['role'];
      const key = makeEntryKey(
        entry.parameterId,
        entry.machineId ?? null,
        role
      );
      const existingEntry = existingByKey.get(key);
      const empty = isLogSheetEntryEmpty(entry);

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
  actor: IJwtPayload,
  logSheetId: string,
  photos: Array<{
    id?: string;
    type: ILogSheetPhoto['type'];
    url: string;
    caption?: string | null;
  }>,
  options?: TLogSheetEditOptions
) {
  await assertLogSheetEditable(actor, logSheetId, options);

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
