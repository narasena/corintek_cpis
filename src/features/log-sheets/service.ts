import { prisma } from '@/lib/prisma';
import { ParameterCategory } from '@/generated/prisma/client';
import type { IParameter } from '@/features/parameters/types';
import type { IMachine } from '@/features/machines/types';
import type { TChemicalUsage } from '@/@types/chemical.type';
import type { IJwtPayload } from '@/@types/auth.type';
import { ensureAccess, RbacResource } from '@/lib/rbac';
import { applyProjectOverridesToParameters } from '@/features/parameters/limits-utils';
import * as projectService from '@/features/projects/service';
import type {
  ILogSheet,
  ILogSheetEntry,
  ILogSheetPhoto,
  TCreateLogSheet,
  TLogSheetStatus,
  TUpdateLogSheet,
} from './types';
import { validateLogSheetApprovalDetail } from './approval-validation';
import { getLogSheetEditState } from './log-sheet-locking';
import { decideLogSheetStatusTransition } from './log-sheet-status';

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

type TSignatureRole = 'TECHNICIAN' | 'CLIENT_PIC';

async function assertCanSignLogSheet(
  actor: IJwtPayload,
  logSheetId: string,
  role: TSignatureRole
) {
  const row = await prisma.logSheet.findFirst({
    where: { id: logSheetId, deletedAt: null },
    select: { id: true, projectId: true, status: true },
  });

  if (!row) {
    throw new Error('Log sheet tidak ditemukan');
  }

  await projectService.assertCanAccessProject(actor, row.projectId);

  if (row.status !== 'DRAFT') {
    throw new Error('Log sheet sudah dikirim dan tidak bisa ditandatangani');
  }

  if (actor.role === 'ADMIN') {
    return row;
  }

  if (role === 'TECHNICIAN') {
    const isTechnician =
      actor.role === 'TECHNICIAN' &&
      (await hasProjectAssignment(actor.id, row.projectId, 'TECHNICIAN'));
    if (!isTechnician) {
      throw new Error('Hanya teknisi proyek yang dapat menandatangani');
    }
  } else if (role === 'CLIENT_PIC') {
    const isClientPic =
      (actor.role === 'CLIENT_TECHNICIAN' ||
        actor.role === 'CLIENT_SUPERVISOR') &&
      (await hasProjectAssignment(actor.id, row.projectId, 'CLIENT_PIC'));
    if (!isClientPic) {
      throw new Error('Hanya PIC klien proyek yang dapat menandatangani');
    }
  }

  return row;
}

export async function saveLogSheetSignature(
  actor: IJwtPayload,
  logSheetId: string,
  role: TSignatureRole,
  url: string
): Promise<ILogSheet> {
  const row = await assertCanSignLogSheet(actor, logSheetId, role);

  const now = new Date();

  const updated = await prisma.logSheet.update({
    where: { id: row.id },
    data:
      role === 'TECHNICIAN'
        ? ({
            technicianSignatureUrl: url,
            technicianSignedAt: now,
            technicianSignedByUserId: actor.id,
          } as any)
        : ({
            clientPicSignatureUrl: url,
            clientPicSignedAt: now,
            clientPicSignedByUserId: actor.id,
          } as any),
  });

  return updated as unknown as ILogSheet;
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

async function fetchLogSheetRow(id: string) {
  const logSheet = (await prisma.logSheet.findFirst({
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
      technicianSignedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      clientPicSignedBy: {
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
    } as any,
  })) as any;

  if (!logSheet) {
    throw new Error('Log sheet tidak ditemukan');
  }

  return logSheet;
}

async function fetchProjectMachines(projectId: string) {
  const machines = await prisma.machine.findMany({
    where: {
      projectId,
      deletedAt: null,
    },
    select: {
      id: true,
      unitNumber: true,
      type: true,
    },
    orderBy: [{ type: 'asc' }, { unitNumber: 'asc' }],
  });

  const chillers = machines.filter(m => m.type === 'CHILLER');
  const coolingTowers = machines.filter(m => m.type === 'COOLING_TOWER');

  return { chillers, coolingTowers };
}

async function fetchParameters() {
  return prisma.parameter.findMany({
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
}

function computeActiveMachineIds(
  logSheet: any,
  chillers: { id: string }[],
  coolingTowers: { id: string }[]
) {
  let activeChillerIds = logSheet.activeMachines
    .filter((am: any) => chillers.some(c => c.id === am.machineId))
    .map((am: any) => am.machineId);
  let activeCTIds = logSheet.activeMachines
    .filter((am: any) => coolingTowers.some(ct => ct.id === am.machineId))
    .map((am: any) => am.machineId);

  if (logSheet.activeMachines.length === 0) {
    activeChillerIds = chillers.map(c => c.id);
    activeCTIds = coolingTowers.map(ct => ct.id);
  }

  return { chillers: activeChillerIds, coolingTowers: activeCTIds };
}

function buildLogSheetDetailView(
  logSheet: any,
  machines: { chillers: any[]; coolingTowers: any[] },
  parameters: any[],
  activeMachineIds: { chillers: string[]; coolingTowers: string[] }
): ILogSheetDetailView {
  return {
    logSheet: {
      id: logSheet.id,
      projectId: logSheet.projectId,
      date: logSheet.date,
      notes: logSheet.notes,
      status: logSheet.status as unknown as ILogSheet['status'],
      locked: logSheet.locked ?? false,
      technicianSignatureUrl: logSheet.technicianSignatureUrl,
      technicianSignedAt: logSheet.technicianSignedAt,
      technicianSignedByUserId: logSheet.technicianSignedByUserId,
      clientPicSignatureUrl: logSheet.clientPicSignatureUrl,
      clientPicSignedAt: logSheet.clientPicSignedAt,
      clientPicSignedByUserId: logSheet.clientPicSignedByUserId,
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
      technicianSignedBy: logSheet.technicianSignedBy,
      clientPicSignedBy: logSheet.clientPicSignedBy,
    },
    project: {
      id: logSheet.project.id,
      name: logSheet.project.name,
      clientName: logSheet.project.client?.name ?? null,
      assignments: (logSheet.project.assignments ?? []).map((a: any) => ({
        role: a.role as unknown as 'PROJECT_PIC' | 'TECHNICIAN' | 'CLIENT_PIC',
        user: a.user,
      })),
    },
    machines,
    parameters: parameters as unknown as ILogSheetDetailView['parameters'],
    entries: logSheet.entries.map((e: any) => ({
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
    photos: logSheet.photos.map((photo: any) => ({
      id: photo.id,
      logSheetId: photo.logSheetId,
      url: photo.url,
      type: photo.type as unknown as ILogSheetPhoto['type'],
      caption: photo.caption,
      createdAt: photo.createdAt,
      updatedAt: photo.updatedAt,
      deletedAt: photo.deletedAt,
    })),
    chemicalUsages: logSheet.chemicalUsages.map((usage: any) => ({
      id: usage.id,
      logSheetId: usage.logSheetId,
      chemicalId: usage.chemicalId,
      amount: usage.amount,
      chemicalName: usage.chemical.name,
      chemicalUnit: usage.chemical.unit || '',
      createdAt: usage.createdAt,
      updatedAt: usage.updatedAt,
    })),
    activeMachineIds,
  };
}

export async function getLogSheetDetail(
  id: string
): Promise<ILogSheetDetailView> {
  const logSheet = await fetchLogSheetRow(id);
  const machines = await fetchProjectMachines(logSheet.projectId);
  const parameters = await fetchParameters();
  const activeMachineIds = computeActiveMachineIds(
    logSheet,
    machines.chillers,
    machines.coolingTowers
  );

  const overrides = logSheet.project.parameterOverrides || [];
  const parametersWithOverrides = applyProjectOverridesToParameters(
    parameters as any,
    overrides as any
  );

  return buildLogSheetDetailView(
    logSheet,
    machines,
    parametersWithOverrides,
    activeMachineIds
  );
}

export async function validateLogSheetForSubmission(id: string) {
  const detail = await getLogSheetDetail(id);
  const errors: string[] = [];

  if (!detail.logSheet.technicianSignatureUrl) {
    errors.push('Tanda tangan teknisi belum diisi');
  }
  if (!detail.logSheet.clientPicSignatureUrl) {
    errors.push('Tanda tangan PIC klien belum diisi');
  }

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
  validateLogSheetApprovalDetail(detail);
}

export { upsertLogSheetEntries } from './log-sheet-entries.service';
export { upsertLogSheetPhotos } from './log-sheet-photos.service';
export { upsertLogSheetChemicalUsages } from './log-sheet-chemicals.service';
