import { describe, it, expect } from 'vitest';

import type { ILogSheetDetailView } from './service';
import { validateLogSheetApprovalDetail } from './approval-validation';

function createBaseDetail(): ILogSheetDetailView {
  return {
    logSheet: {
      id: 'ls-1',
      projectId: 'proj-1',
      date: new Date('2024-01-01'),
      notes: null,
      status: 'SUBMITTED',
      technicianSignatureUrl: null,
      technicianSignedAt: null,
      technicianSignedByUserId: null,
      clientPicSignatureUrl: null,
      clientPicSignedAt: null,
      clientPicSignedByUserId: null,
      submittedAt: new Date('2024-01-02'),
      submittedByUserId: 'tech-1',
      approvedAt: null,
      approvedByUserId: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
      deletedAt: null,
      project: {
        id: 'proj-1',
        name: 'Project',
      },
      replacedBy: null,
      submittedBy: null,
      approvedBy: null,
      technicianSignedBy: null,
      clientPicSignedBy: null,
    } as any,
    project: {
      id: 'proj-1',
      name: 'Project',
      clientName: null,
      assignments: [],
    },
    machines: {
      chillers: [],
      coolingTowers: [
        {
          id: 'ct-1',
          unitNumber: 1,
          type: 'COOLING_TOWER',
        },
      ],
    },
    parameters: [
      {
        id: 'param-1',
        name: 'Cooling Water Temp',
        variableName: 'cooling_temp',
        category: 'COOLING_WATER_QUALITY',
        valueType: 'NUMBER',
        unit: 'C',
        minValue: 10,
        maxValue: 20,
        rawWaterMinValue: 5,
        rawWaterMaxValue: 15,
        displayOrder: 0,
      },
      {
        id: 'param-2',
        name: 'General Condition',
        variableName: 'general_condition',
        category: 'GENERAL_CONDITION',
        valueType: 'TEXT',
        unit: null,
        minValue: null,
        maxValue: null,
        rawWaterMinValue: null,
        rawWaterMaxValue: null,
        displayOrder: 1,
      },
      {
        id: 'param-3',
        name: 'Consumption',
        variableName: 'consumption',
        category: 'CONSUMPTION',
        valueType: 'NUMBER',
        unit: 'm3',
        minValue: null,
        maxValue: null,
        rawWaterMinValue: null,
        rawWaterMaxValue: null,
        displayOrder: 2,
      },
    ] as any,
    entries: [
      {
        id: 'e-1',
        logSheetId: 'ls-1',
        parameterId: 'param-1',
        machineId: 'ct-1',
        role: 'VALUE',
        valueType: 'NUMBER',
        numericValue: 12,
        boolValue: null,
        textValue: null,
        fileUrl: null,
        checkedAt: new Date('2024-01-02'),
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
        deletedAt: null,
      },
      {
        id: 'e-2',
        logSheetId: 'ls-1',
        parameterId: 'param-1',
        machineId: null,
        role: 'RAW_WATER',
        valueType: 'NUMBER',
        numericValue: 10,
        boolValue: null,
        textValue: null,
        fileUrl: null,
        checkedAt: new Date('2024-01-02'),
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
        deletedAt: null,
      },
      {
        id: 'e-3',
        logSheetId: 'ls-1',
        parameterId: 'param-2',
        machineId: 'ct-1',
        role: 'VALUE',
        valueType: 'TEXT',
        numericValue: null,
        boolValue: null,
        textValue: 'OK',
        fileUrl: null,
        checkedAt: new Date('2024-01-02'),
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
        deletedAt: null,
      },
      {
        id: 'e-4',
        logSheetId: 'ls-1',
        parameterId: 'param-2',
        machineId: null,
        role: 'NOTE',
        valueType: 'TEXT',
        numericValue: null,
        boolValue: null,
        textValue: 'Note',
        fileUrl: null,
        checkedAt: new Date('2024-01-02'),
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
        deletedAt: null,
      },
      {
        id: 'e-5',
        logSheetId: 'ls-1',
        parameterId: 'param-3',
        machineId: null,
        role: 'VALUE',
        valueType: 'NUMBER',
        numericValue: 1,
        boolValue: null,
        textValue: null,
        fileUrl: null,
        checkedAt: new Date('2024-01-02'),
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
        deletedAt: null,
      },
    ] as any,
    photos: [],
    chemicalUsages: [],
    activeMachineIds: {
      chillers: [],
      coolingTowers: ['ct-1'],
    },
  };
}

describe('validateLogSheetApprovalDetail', () => {
  it('passes when all required values are present and within range', () => {
    const detail: ILogSheetDetailView = createBaseDetail();
    expect(() => validateLogSheetApprovalDetail(detail)).not.toThrow();
  });

  it('fails when a numeric value is below minimum limit', () => {
    const detail: ILogSheetDetailView = createBaseDetail();
    const entry = detail.entries.find(
      e => e.parameterId === 'param-1' && e.machineId === 'ct-1'
    ) as any;
    entry.numericValue = 5;

    expect(() => validateLogSheetApprovalDetail(detail)).toThrow(
      /di bawah minimum 10/
    );
  });

  it('fails when cooling water value for an active tower is missing', () => {
    const detail: ILogSheetDetailView = createBaseDetail();
    detail.entries = detail.entries.filter(
      e => !(e.parameterId === 'param-1' && e.machineId === 'ct-1')
    ) as any;

    expect(() => validateLogSheetApprovalDetail(detail)).toThrow(
      /Cooling Water Temp \(CT #1\) wajib diisi/
    );
  });

  it('fails when raw water value is missing for cooling water parameter', () => {
    const detail: ILogSheetDetailView = createBaseDetail();
    detail.entries = detail.entries.filter(
      e =>
        !(
          e.parameterId === 'param-1' &&
          e.machineId === null &&
          e.role === 'RAW_WATER'
        )
    ) as any;

    expect(() => validateLogSheetApprovalDetail(detail)).toThrow(
      /Cooling Water Temp \(Raw Water\) wajib diisi/
    );
  });

  it('fails when general condition note is missing for active cooling tower', () => {
    const detail: ILogSheetDetailView = createBaseDetail();
    detail.entries = detail.entries.filter(
      e =>
        !(
          e.parameterId === 'param-2' &&
          e.machineId === null &&
          e.role === 'NOTE'
        )
    ) as any;

    expect(() => validateLogSheetApprovalDetail(detail)).toThrow(
      /General Condition \(Catatan\) wajib diisi/
    );
  });
});
