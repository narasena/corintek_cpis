import { describe, it, expect } from 'vitest';

import { buildLimitEvaluationInput } from '../limit-breach-adapter';
import type { ILogSheetDetailView } from '../service';

function createDetail(
  entries: ILogSheetDetailView['entries'],
  parameters: ILogSheetDetailView['parameters']
): ILogSheetDetailView {
  return {
    logSheet: {
      id: 'ls-1',
      projectId: 'proj-1',
    },
    project: {
      id: 'proj-1',
      name: 'Project',
      clientName: 'Client',
      assignments: [],
    },
    machines: {
      chillers: [],
      coolingTowers: [],
    },
    parameters,
    entries,
    photos: [],
    chemicalUsages: [],
    activeMachineIds: {
      chillers: [],
      coolingTowers: [],
    },
  } as unknown as ILogSheetDetailView;
}

describe('buildLimitEvaluationInput', () => {
  it('maps numeric VALUE entries with normal limits', () => {
    const parameters = [
      {
        id: 'param-1',
        name: 'pH',
        variableName: 'ph',
        category: 'COOLING_WATER_QUALITY',
        valueType: 'NUMBER',
        unit: null,
        minValue: 6,
        maxValue: 9,
        rawWaterMinValue: 5,
        rawWaterMaxValue: 10,
        displayOrder: 0,
      },
    ] as unknown as ILogSheetDetailView['parameters'];

    const entries = [
      {
        id: 'e-1',
        logSheetId: 'ls-1',
        parameterId: 'param-1',
        machineId: 'ct-1',
        role: 'VALUE',
        valueType: 'NUMBER',
        numericValue: 7,
        boolValue: null,
        textValue: null,
        fileUrl: null,
        checkedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ] as unknown as ILogSheetDetailView['entries'];

    const detail = createDetail(entries, parameters);

    const snapshots = buildLimitEvaluationInput(detail);

    expect(snapshots).toHaveLength(1);
    const snapshot = snapshots[0];
    expect(snapshot.logSheetId).toBe('ls-1');
    expect(snapshot.projectId).toBe('proj-1');
    expect(snapshot.parameterId).toBe('param-1');
    expect(snapshot.parameterName).toBe('pH');
    expect(snapshot.value).toBe(7);
    expect(snapshot.minLimit).toBe(6);
    expect(snapshot.maxLimit).toBe(9);
  });

  it('uses raw water limits for RAW_WATER role', () => {
    const parameters = [
      {
        id: 'param-1',
        name: 'pH',
        variableName: 'ph',
        category: 'COOLING_WATER_QUALITY',
        valueType: 'NUMBER',
        unit: null,
        minValue: 6,
        maxValue: 9,
        rawWaterMinValue: 5,
        rawWaterMaxValue: 10,
        displayOrder: 0,
      },
    ] as unknown as ILogSheetDetailView['parameters'];

    const entries = [
      {
        id: 'e-raw',
        logSheetId: 'ls-1',
        parameterId: 'param-1',
        machineId: null,
        role: 'RAW_WATER',
        valueType: 'NUMBER',
        numericValue: 4,
        boolValue: null,
        textValue: null,
        fileUrl: null,
        checkedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ] as unknown as ILogSheetDetailView['entries'];

    const detail = createDetail(entries, parameters);

    const snapshots = buildLimitEvaluationInput(detail);

    expect(snapshots).toHaveLength(1);
    const snapshot = snapshots[0];
    expect(snapshot.minLimit).toBe(5);
    expect(snapshot.maxLimit).toBe(10);
  });

  it('skips entries with null or non-finite numeric values', () => {
    const parameters = [
      {
        id: 'param-1',
        name: 'pH',
        variableName: 'ph',
        category: 'COOLING_WATER_QUALITY',
        valueType: 'NUMBER',
        unit: null,
        minValue: 6,
        maxValue: 9,
        rawWaterMinValue: null,
        rawWaterMaxValue: null,
        displayOrder: 0,
      },
    ] as unknown as ILogSheetDetailView['parameters'];

    const entries = [
      {
        id: 'e-null',
        logSheetId: 'ls-1',
        parameterId: 'param-1',
        machineId: 'ct-1',
        role: 'VALUE',
        valueType: 'NUMBER',
        numericValue: null,
        boolValue: null,
        textValue: null,
        fileUrl: null,
        checkedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: 'e-nan',
        logSheetId: 'ls-1',
        parameterId: 'param-1',
        machineId: 'ct-1',
        role: 'VALUE',
        valueType: 'NUMBER',
        numericValue: Number.NaN,
        boolValue: null,
        textValue: null,
        fileUrl: null,
        checkedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ] as unknown as ILogSheetDetailView['entries'];

    const detail = createDetail(entries, parameters);

    const snapshots = buildLimitEvaluationInput(detail);

    expect(snapshots).toHaveLength(0);
  });

  it('skips entries whose parameter is not found', () => {
    const parameters = [
      {
        id: 'param-1',
        name: 'pH',
        variableName: 'ph',
        category: 'COOLING_WATER_QUALITY',
        valueType: 'NUMBER',
        unit: null,
        minValue: 6,
        maxValue: 9,
        rawWaterMinValue: null,
        rawWaterMaxValue: null,
        displayOrder: 0,
      },
    ] as unknown as ILogSheetDetailView['parameters'];

    const entries = [
      {
        id: 'e-1',
        logSheetId: 'ls-1',
        parameterId: 'unknown-param',
        machineId: 'ct-1',
        role: 'VALUE',
        valueType: 'NUMBER',
        numericValue: 100,
        boolValue: null,
        textValue: null,
        fileUrl: null,
        checkedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ] as unknown as ILogSheetDetailView['entries'];

    const detail = createDetail(entries, parameters);

    const snapshots = buildLimitEvaluationInput(detail);

    expect(snapshots).toHaveLength(0);
  });
});
