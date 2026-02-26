import { prisma } from '@/lib/prisma';
import { ParameterCategory } from '@/generated/prisma/client';
import type { IParameter } from '@/features/parameters/types';
import type { IMachine } from '@/features/machines/types';
import type { TChemicalUsage } from '@/@types/chemical.type';
import type { IJwtPayload } from '@/@types/auth.type';
import { applyProjectOverridesToParameters } from '@/features/parameters/limits-utils';
import * as projectService from '@/features/projects/service';
import {
  assertLogSheetEditable,
  type TLogSheetEditOptions,
} from './internal/edit-permission';
import type {
  ILogSheet,
  ILogSheetEntry,
  ILogSheetPhoto,
  TCreateLogSheet,
  TUpdateLogSheet,
  ILogSheetDetailView,
} from './types';
import {
  mapToLogSheet,
  mapToLogSheetEntry,
  mapToLogSheetPhoto,
  type TPrismaLogSheet,
} from './dto';
import { fetchAllTechnicians, fetchAllChemicals } from './service-extended';

export async function hasProjectAssignment(
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
        ? {
            technicianSignatureUrl: url,
            technicianSignedAt: now,
            technicianSignedByUserId: actor.id,
          }
        : {
            clientPicSignatureUrl: url,
            clientPicSignedAt: now,
            clientPicSignedByUserId: actor.id,
          },
  });

  return updated as ILogSheet;
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

  return logSheets.map(ls => ({
    id: ls.id,
    projectId: ls.projectId,
    date: ls.date,
    notes: ls.notes,
    status: ls.status as ILogSheet['status'],
    createdAt: ls.createdAt,
    updatedAt: ls.updatedAt,
    project: ls.project,
  }));
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

  return logSheets.map(ls => ({
    id: ls.id,
    projectId: ls.projectId,
    date: ls.date,
    notes: ls.notes,
    status: ls.status as ILogSheet['status'],
    createdAt: ls.createdAt,
    updatedAt: ls.updatedAt,
  }));
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

  return logSheet as ILogSheet;
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

  return logSheet as ILogSheet;
}

export async function deleteLogSheet(id: string): Promise<ILogSheet> {
  const logSheet = await prisma.logSheet.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return logSheet as ILogSheet;
}

type TLogSheetRowResult = TPrismaLogSheet & {
  project: {
    id: string;
    name: string;
    client: { name: string } | null;
    parameterOverrides: any[];
    assignments: Array<{
      role: string;
      user: { id: string; firstName: string; lastName: string | null };
    }>;
  };
  entries: Array<{
    id: string;
    logSheetId: string;
    parameterId: string;
    machineId: string | null;
    role: string;
    valueType: string;
    numericValue: number | null;
    boolValue: boolean | null;
    textValue: string | null;
    fileUrl: string | null;
    checkedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    parameter: any;
    machine: any;
  }>;
  photos: Array<{
    id: string;
    logSheetId: string;
    type: string;
    url: string;
    caption: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }>;
  chemicalUsages: Array<{
    id: string;
    logSheetId: string;
    chemicalId: string;
    amount: number;
    createdAt: Date;
    updatedAt: Date;
    chemical: { name: string; unit: string };
  }>;
  activeMachines: Array<{ machineId: string }>;
};

async function fetchLogSheetRow(id: string): Promise<TLogSheetRowResult> {
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
    },
  });

  if (!logSheet) {
    throw new Error('Log sheet tidak ditemukan');
  }

  return logSheet as TLogSheetRowResult;
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
  logSheet: TLogSheetRowResult,
  chillers: { id: string }[],
  coolingTowers: { id: string }[]
) {
  let activeChillerIds = logSheet.activeMachines
    .filter((am: { machineId: string }) =>
      chillers.some(c => c.id === am.machineId)
    )
    .map((am: { machineId: string }) => am.machineId);
  let activeCTIds = logSheet.activeMachines
    .filter((am: { machineId: string }) =>
      coolingTowers.some(ct => ct.id === am.machineId)
    )
    .map((am: { machineId: string }) => am.machineId);

  if (logSheet.activeMachines.length === 0) {
    activeChillerIds = chillers.map(c => c.id);
    activeCTIds = coolingTowers.map(ct => ct.id);
  }

  return { chillers: activeChillerIds, coolingTowers: activeCTIds };
}

function buildLogSheetDetailView(
  logSheet: TLogSheetRowResult,
  machines: { chillers: any[]; coolingTowers: any[] },
  parameters: any[],
  activeMachineIds: { chillers: string[]; coolingTowers: string[] },
  technicians: Array<{
    id: string;
    firstName: string;
    lastName: string | null;
  }>,
  chemicals: Array<{ id: string; name: string; unit: string | null }>
): ILogSheetDetailView {
  return {
    logSheet: mapToLogSheet({
      ...logSheet,
      project: { id: logSheet.project.id, name: logSheet.project.name },
    }),
    project: {
      id: logSheet.project.id,
      name: logSheet.project.name,
      clientName: logSheet.project.client?.name ?? null,
      assignments: (logSheet.project.assignments ?? []).map(
        (a: {
          role: string;
          user: { id: string; firstName: string; lastName: string | null };
        }) => ({
          role: a.role as 'PROJECT_PIC' | 'TECHNICIAN' | 'CLIENT_PIC',
          user: a.user,
        })
      ),
    },
    machines,
    parameters: parameters as ILogSheetDetailView['parameters'],
    entries: logSheet.entries.map((e: any) => mapToLogSheetEntry(e)),
    photos: logSheet.photos.map((photo: any) => mapToLogSheetPhoto(photo)),
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
    technicians,
    chemicals,
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
    parameters,
    overrides
  );

  const [technicians, chemicals] = await Promise.all([
    fetchAllTechnicians(),
    fetchAllChemicals(),
  ]);

  return buildLogSheetDetailView(
    logSheet,
    machines,
    parametersWithOverrides,
    activeMachineIds,
    technicians,
    chemicals
  );
}

export { upsertLogSheetEntries } from './log-sheet-entries.service';
export { upsertLogSheetPhotos } from './log-sheet-photos.service';
export { upsertLogSheetChemicalUsages } from './log-sheet-chemicals.service';
export {
  updateLogSheetStatus,
  validateLogSheetForSubmission,
  validateLogSheetForApproval,
} from './log-sheet-status.service';
