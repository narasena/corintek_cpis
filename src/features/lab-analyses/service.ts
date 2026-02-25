import { prisma } from '@/lib/prisma';
import {
  LabAnalysisColumnKind,
  ParameterCategory,
  ValueType,
} from '@/generated/prisma/client';
import { CreateLabAnalysisInput, UpdateLabAnalysisInput } from './types';

export async function getLabAnalysesByProject(projectId: string) {
  return await prisma.labAnalysis.findMany({
    where: { projectId, deletedAt: null },
    orderBy: { date: 'desc' },
  });
}

export async function getLabAnalysisDetail(id: string) {
  return await prisma.labAnalysis.findUnique({
    where: { id },
    include: {
      project: {
        include: {
          client: true,
          parameterOverrides: true,
        },
      },
      columns: {
        where: { deletedAt: null },
        orderBy: { displayOrder: 'asc' },
      },
      entries: {
        where: { deletedAt: null },
        include: {
          parameter: true,
          column: true,
        },
      },
    },
  });
}

export async function getCoolingWaterQualityParameters() {
  const targetCategories = [
    ParameterCategory.COOLING_WATER_QUALITY,
    ParameterCategory.LAB_ANALYSIS,
  ];

  return await prisma.parameter.findMany({
    where: {
      category: {
        in: targetCategories,
      },
      deletedAt: null,
      isActive: true,
    },
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
  });
}

function normalizeHeaderStrings<T extends Record<string, unknown>>(data: T) {
  const next: any = { ...data };
  for (const key of Object.keys(next)) {
    const value = next[key];
    if (typeof value === 'string' && value.trim() === '') {
      next[key] = null;
    }
  }
  return next as T;
}

function hasEntryValue(entry: {
  valueType: ValueType;
  numericValue?: number | null;
  boolValue?: boolean | null;
  textValue?: string | null;
}) {
  if (entry.valueType === 'NUMBER') return entry.numericValue != null;
  if (entry.valueType === 'BOOLEAN') return entry.boolValue != null;
  return !!(entry.textValue && entry.textValue.trim());
}

export async function createLabAnalysis(input: CreateLabAnalysisInput) {
  const header = buildLabAnalysisHeader(input);

  return await prisma.$transaction(async tx => {
    const labAnalysis = await tx.labAnalysis.create({
      data: {
        projectId: input.projectId,
        ...header,
      },
    });

    const createdColumns = await createLabAnalysisColumns(
      tx,
      input,
      labAnalysis.id
    );
    const columnIdByTempId = mapLabAnalysisColumnTempIds(input, createdColumns);

    await createLabAnalysisEntries(
      tx,
      labAnalysis.id,
      input.entries,
      columnIdByTempId
    );

    await ensureDefaultRawWaterColumn(tx, labAnalysis.id, createdColumns);

    return labAnalysis;
  });
}

export async function updateLabAnalysis(input: UpdateLabAnalysisInput) {
  const header = buildLabAnalysisHeader(input);

  return await prisma.$transaction(async tx => {
    const labAnalysis = await tx.labAnalysis.update({
      where: { id: input.id },
      data: header,
    });

    const existingColumns = await tx.labAnalysisColumn.findMany({
      where: { labAnalysisId: input.id, deletedAt: null },
      select: { id: true },
    });

    const removedColumnIds = findRemovedLabAnalysisColumnIds(
      existingColumns,
      input.columns
    );

    if (removedColumnIds.length > 0) {
      await softDeleteLabAnalysisColumns(tx, input.id, removedColumnIds);
    }

    await updateExistingLabAnalysisColumns(tx, input);

    const createdColumns = await createNewLabAnalysisColumns(tx, input);
    const columnIdByTempId = mapUpdatedLabAnalysisColumnTempIds(
      input,
      createdColumns
    );

    await upsertLabAnalysisEntries(tx, input, columnIdByTempId);

    return labAnalysis;
  });
}

function buildLabAnalysisHeader(
  input: CreateLabAnalysisInput | UpdateLabAnalysisInput
) {
  return normalizeHeaderStrings({
    date: input.date,
    attention: input.attention ?? null,
    cc: input.cc ?? null,
    customer: input.customer ?? null,
    address: input.address ?? null,
    faxNumber: input.faxNumber ?? null,
    reportNumber: input.reportNumber ?? null,
    remarks: input.remarks ?? null,
    recommendations: input.recommendations ?? null,
  });
}

async function createLabAnalysisColumns(
  tx: Parameters<typeof prisma.$transaction>[0] extends (arg: infer A) => any
    ? A
    : never,
  input: CreateLabAnalysisInput,
  labAnalysisId: string
) {
  return await Promise.all(
    input.columns.map(col =>
      tx.labAnalysisColumn.create({
        data: {
          labAnalysisId,
          name: col.name,
          kind: col.kind,
          displayOrder: col.displayOrder,
        },
      })
    )
  );
}

function mapLabAnalysisColumnTempIds(
  input: CreateLabAnalysisInput,
  createdColumns: { id: string }[]
) {
  const columnIdByTempId = new Map<string, string>();

  for (let i = 0; i < input.columns.length; i++) {
    const tempId = input.columns[i].tempId;
    if (tempId) columnIdByTempId.set(tempId, createdColumns[i].id);
  }

  return columnIdByTempId;
}

async function createLabAnalysisEntries(
  tx: Parameters<typeof prisma.$transaction>[0] extends (arg: infer A) => any
    ? A
    : never,
  labAnalysisId: string,
  entries: CreateLabAnalysisInput['entries'],
  columnIdByTempId: Map<string, string>
) {
  for (const entry of entries) {
    const columnId =
      entry.columnId ?? columnIdByTempId.get(entry.columnTempId!);
    if (!columnId) continue;
    if (!hasEntryValue(entry)) continue;

    await tx.labAnalysisEntry.create({
      data: {
        labAnalysisId,
        parameterId: entry.parameterId,
        columnId,
        valueType: entry.valueType,
        numericValue: entry.numericValue ?? null,
        boolValue: entry.boolValue ?? null,
        textValue: entry.textValue ?? null,
      },
    });
  }
}

async function ensureDefaultRawWaterColumn(
  tx: Parameters<typeof prisma.$transaction>[0] extends (arg: infer A) => any
    ? A
    : never,
  labAnalysisId: string,
  createdColumns: { id: string }[]
) {
  if (createdColumns.length > 0) return;

  await tx.labAnalysisColumn.create({
    data: {
      labAnalysisId,
      name: 'Raw',
      kind: LabAnalysisColumnKind.RAW_WATER,
      displayOrder: 0,
    },
  });
}

function findRemovedLabAnalysisColumnIds(
  existingColumns: { id: string }[],
  columns: UpdateLabAnalysisInput['columns']
) {
  const existingIds = new Set(existingColumns.map(c => c.id));
  const incomingIds = new Set(
    columns.map(c => c.id).filter(Boolean) as string[]
  );
  return [...existingIds].filter(id => !incomingIds.has(id));
}

async function softDeleteLabAnalysisColumns(
  tx: Parameters<typeof prisma.$transaction>[0] extends (arg: infer A) => any
    ? A
    : never,
  labAnalysisId: string,
  removedColumnIds: string[]
) {
  const now = new Date();

  await tx.labAnalysisEntry.updateMany({
    where: { labAnalysisId, columnId: { in: removedColumnIds } },
    data: { deletedAt: now },
  });

  await tx.labAnalysisColumn.updateMany({
    where: { id: { in: removedColumnIds } },
    data: { deletedAt: now },
  });
}

async function updateExistingLabAnalysisColumns(
  tx: Parameters<typeof prisma.$transaction>[0] extends (arg: infer A) => any
    ? A
    : never,
  input: UpdateLabAnalysisInput
) {
  for (const col of input.columns) {
    if (!col.id) continue;
    await tx.labAnalysisColumn.update({
      where: { id: col.id },
      data: {
        name: col.name,
        kind: col.kind,
        displayOrder: col.displayOrder,
        deletedAt: null,
      },
    });
  }
}

async function createNewLabAnalysisColumns(
  tx: Parameters<typeof prisma.$transaction>[0] extends (arg: infer A) => any
    ? A
    : never,
  input: UpdateLabAnalysisInput
) {
  return await Promise.all(
    input.columns
      .filter(c => !c.id)
      .map(col =>
        tx.labAnalysisColumn.create({
          data: {
            labAnalysisId: input.id,
            name: col.name,
            kind: col.kind,
            displayOrder: col.displayOrder,
          },
        })
      )
  );
}

function mapUpdatedLabAnalysisColumnTempIds(
  input: UpdateLabAnalysisInput,
  createdColumns: { id: string }[]
) {
  const columnIdByTempId = new Map<string, string>();
  const newColumns = input.columns.filter(c => !c.id);

  for (let i = 0; i < newColumns.length; i++) {
    const tempId = newColumns[i].tempId;
    if (tempId) columnIdByTempId.set(tempId, createdColumns[i].id);
  }

  return columnIdByTempId;
}

async function upsertLabAnalysisEntries(
  tx: Parameters<typeof prisma.$transaction>[0] extends (arg: infer A) => any
    ? A
    : never,
  input: UpdateLabAnalysisInput,
  columnIdByTempId: Map<string, string>
) {
  const now = new Date();

  for (const entry of input.entries) {
    const columnId =
      entry.columnId ?? columnIdByTempId.get(entry.columnTempId!);
    if (!columnId) continue;

    const where = {
      labAnalysisId_parameterId_columnId: {
        labAnalysisId: input.id,
        parameterId: entry.parameterId,
        columnId,
      },
    };

    if (!hasEntryValue(entry)) {
      await tx.labAnalysisEntry.updateMany({
        where: {
          labAnalysisId: input.id,
          parameterId: entry.parameterId,
          columnId,
        },
        data: {
          valueType: entry.valueType,
          numericValue: null,
          boolValue: null,
          textValue: null,
          deletedAt: now,
        },
      });
      continue;
    }

    await tx.labAnalysisEntry.upsert({
      where,
      update: {
        valueType: entry.valueType,
        numericValue: entry.numericValue ?? null,
        boolValue: entry.boolValue ?? null,
        textValue: entry.textValue ?? null,
        deletedAt: null,
      },
      create: {
        labAnalysisId: input.id,
        parameterId: entry.parameterId,
        columnId,
        valueType: entry.valueType,
        numericValue: entry.numericValue ?? null,
        boolValue: entry.boolValue ?? null,
        textValue: entry.textValue ?? null,
      },
    });
  }
}
