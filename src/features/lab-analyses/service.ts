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
  const next = { ...data };
  for (const key of Object.keys(next)) {
    const value = next[key];
    if (typeof value === 'string' && value.trim() === '') {
      next[key] = null as unknown as T[Extract<keyof T, string>];
    }
  }
  return next;
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
  const header = normalizeHeaderStrings({
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

  return await prisma.$transaction(async tx => {
    const labAnalysis = await tx.labAnalysis.create({
      data: {
        projectId: input.projectId,
        ...header,
      },
    });

    const createdColumns = await Promise.all(
      input.columns.map(col =>
        tx.labAnalysisColumn.create({
          data: {
            labAnalysisId: labAnalysis.id,
            name: col.name,
            kind: col.kind,
            displayOrder: col.displayOrder,
          },
        })
      )
    );

    const columnIdByTempId = new Map<string, string>();
    for (let i = 0; i < input.columns.length; i++) {
      const tempId = input.columns[i].tempId;
      if (tempId) columnIdByTempId.set(tempId, createdColumns[i].id);
    }

    for (const entry of input.entries) {
      const columnId =
        entry.columnId ?? columnIdByTempId.get(entry.columnTempId!);
      if (!columnId) continue;
      if (!hasEntryValue(entry)) continue;

      await tx.labAnalysisEntry.create({
        data: {
          labAnalysisId: labAnalysis.id,
          parameterId: entry.parameterId,
          columnId,
          valueType: entry.valueType,
          numericValue: entry.numericValue ?? null,
          boolValue: entry.boolValue ?? null,
          textValue: entry.textValue ?? null,
        },
      });
    }

    if (createdColumns.length === 0) {
      await tx.labAnalysisColumn.create({
        data: {
          labAnalysisId: labAnalysis.id,
          name: 'Raw',
          kind: LabAnalysisColumnKind.RAW_WATER,
          displayOrder: 0,
        },
      });
    }

    return labAnalysis;
  });
}

export async function updateLabAnalysis(input: UpdateLabAnalysisInput) {
  const header = normalizeHeaderStrings({
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

  return await prisma.$transaction(async tx => {
    const labAnalysis = await tx.labAnalysis.update({
      where: { id: input.id },
      data: header,
    });

    const existingColumns = await tx.labAnalysisColumn.findMany({
      where: { labAnalysisId: input.id, deletedAt: null },
      select: { id: true },
    });
    const existingIds = new Set(existingColumns.map(c => c.id));
    const incomingIds = new Set(
      input.columns.map(c => c.id).filter(Boolean) as string[]
    );
    const removedColumnIds = [...existingIds].filter(
      id => !incomingIds.has(id)
    );

    if (removedColumnIds.length > 0) {
      const now = new Date();
      await tx.labAnalysisEntry.updateMany({
        where: { labAnalysisId: input.id, columnId: { in: removedColumnIds } },
        data: { deletedAt: now },
      });
      await tx.labAnalysisColumn.updateMany({
        where: { id: { in: removedColumnIds } },
        data: { deletedAt: now },
      });
    }

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

    const createdColumns = await Promise.all(
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

    const columnIdByTempId = new Map<string, string>();
    const newColumns = input.columns.filter(c => !c.id);
    for (let i = 0; i < newColumns.length; i++) {
      const tempId = newColumns[i].tempId;
      if (tempId) columnIdByTempId.set(tempId, createdColumns[i].id);
    }

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

    return labAnalysis;
  });
}
