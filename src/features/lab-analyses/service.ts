import { prisma } from '@/lib/prisma';
import {
  LabAnalysisColumnKind,
  ParameterCategory,
  ValueType,
} from '@/generated/prisma/client';
import { CreateLabAnalysisInput, UpdateLabAnalysisInput } from './types';
import {
  applyProjectOverridesToParameters,
  IParameterLike,
} from '@/features/parameters/limits-utils';

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

  const parameters = await prisma.parameter.findMany({
    where: {
      category: { in: targetCategories },
      deletedAt: null,
      isActive: true,
    },
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
  });

  // Deduplicate by name: if a parameter name exists in both categories,
  // keep the LAB_ANALYSIS version. This prevents duplicates like "Conductivity"
  // appearing twice when both COOLING_WATER_QUALITY and LAB_ANALYSIS exist.
  const dedupedMap = new Map<string, (typeof parameters)[0]>();
  for (const param of parameters) {
    const existing = dedupedMap.get(param.name);
    if (!existing) {
      dedupedMap.set(param.name, param);
    } else if (
      existing.category === ParameterCategory.COOLING_WATER_QUALITY &&
      param.category === ParameterCategory.LAB_ANALYSIS
    ) {
      dedupedMap.set(param.name, param); // Replace with LAB_ANALYSIS
    }
  }

  return Array.from(dedupedMap.values()).sort((a, b) => {
    if (a.displayOrder !== b.displayOrder)
      return a.displayOrder - b.displayOrder;
    return a.name.localeCompare(b.name);
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

/**
 * Get effective parameter limits for a project
 * Merges parameter profile limits with project-specific overrides
 */
export async function getEffectiveParameterLimits(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      parameterLimitProfile: {
        include: {
          limits: {
            select: {
              parameterId: true,
              minValue: true,
              maxValue: true,
              rawWaterMinValue: true,
              rawWaterMaxValue: true,
            },
          },
        },
      },
      parameterOverrides: true,
    },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  // Fetch numeric parameters from both COOLING_WATER_QUALITY and LAB_ANALYSIS
  const numericParameters = await prisma.parameter.findMany({
    where: {
      category: {
        in: [ParameterCategory.COOLING_WATER_QUALITY, ParameterCategory.LAB_ANALYSIS],
      },
      valueType: 'NUMBER',
      deletedAt: null,
      isActive: true,
    },
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
  });

  // Deduplicate by name: prefer LAB_ANALYSIS over COOLING_WATER_QUALITY
  const dedupedMap = new Map<string, typeof numericParameters[0]>();
  for (const param of numericParameters) {
    const existing = dedupedMap.get(param.name);
    if (!existing) {
      dedupedMap.set(param.name, param);
    } else if (
      existing.category === ParameterCategory.COOLING_WATER_QUALITY &&
      param.category === ParameterCategory.LAB_ANALYSIS
    ) {
      dedupedMap.set(param.name, param);
    }
  }
  const uniqueParameters = Array.from(dedupedMap.values()).sort((a, b) => {
    if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
    return a.name.localeCompare(b.name);
  });

  // Build base parameters with all limit fields null
  const parametersBase: IParameterLike[] = uniqueParameters.map(param => ({
    id: param.id,
    minValue: null,
    maxValue: null,
    rawWaterMinValue: null,
    rawWaterMaxValue: null,
  }));

  // Build profile limit overrides
  const profileLimits = project.parameterLimitProfile?.limits ?? [];
  const profileLimitOverrides = profileLimits.map(limit => ({
    parameterId: limit.parameterId,
    minValue: limit.minValue ?? null,
    maxValue: limit.maxValue ?? null,
    rawWaterMinValue: limit.rawWaterMinValue ?? null,
    rawWaterMaxValue: limit.rawWaterMaxValue ?? null,
  }));

  // Apply profile limits
  const parametersWithProfileLimits = applyProjectOverridesToParameters(
    parametersBase,
    profileLimitOverrides
  );

  // Apply project overrides
  const projectOverrides = project.parameterOverrides;
  const parametersWithOverrides = applyProjectOverridesToParameters(
    parametersWithProfileLimits,
    projectOverrides
  );

  // Convert to plain object indexed by parameterId
  const result: Record<string, {
    minValue: number | null;
    maxValue: number | null;
    rawWaterMinValue: number | null;
    rawWaterMaxValue: number | null;
  }> = {};

  for (const param of parametersWithOverrides) {
    result[param.id] = {
      minValue: param.minValue ?? null,
      maxValue: param.maxValue ?? null,
      rawWaterMinValue: param.rawWaterMinValue ?? null,
      rawWaterMaxValue: param.rawWaterMaxValue ?? null,
    };
  }

  return result;
}

/**
 * Soft delete a lab analysis
 */
export async function deleteLabAnalysis(id: string) {
  const labAnalysis = await prisma.labAnalysis.findUnique({
    where: { id },
    select: { id: true, locked: true },
  });

  if (!labAnalysis) {
    throw new Error('Lab analysis tidak ditemukan');
  }

  if (labAnalysis.locked) {
    throw new Error('Lab analysis terkunci tidak dapat dihapus');
  }

  return await prisma.labAnalysis.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
}
