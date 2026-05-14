import { describe, expect, it } from 'vitest';

import type { ILogSheetDetailView } from '@/features/log-sheets/service';
import { validateLogSheetApprovalDetail } from '@/features/log-sheets/approval-validation';

function createBaseDetail(
  overrides?: Partial<ILogSheetDetailView>
): ILogSheetDetailView {
  return {
    logSheet: {
      id: 'ls-1',
      projectId: 'proj-1',
      date: new Date('2024-01-01'),
      notes: null,
      status: 'SUBMITTED',
      technicianSignatureUrl: 'https://example.com/tech-sig.png',
      technicianSignedAt: new Date(),
      technicianSignedByUserId: 'tech-1',
      clientPicSignatureUrl: 'https://example.com/client-sig.png',
      clientPicSignedAt: new Date(),
      clientPicSignedByUserId: 'client-1',
      submittedAt: new Date(),
      submittedByUserId: 'tech-1',
      approvedAt: null,
      approvedByUserId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      locked: false,
    } as any,
    project: {
      id: 'proj-1',
      name: 'Project',
      clientName: 'Client',
      assignments: [],
    },
    machines: {
      chillers: [{ id: 'ch-1', unitNumber: 1, type: 'CHILLER' }],
      coolingTowers: [{ id: 'ct-1', unitNumber: 1, type: 'COOLING_TOWER' }],
    },
    parameters: [
      {
        id: 'param-cw',
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
      {
        id: 'param-cycle',
        name: 'Cycle of concentration',
        variableName: 'cycle_of_concentration',
        category: 'COOLING_WATER_QUALITY',
        valueType: 'NUMBER',
        unit: null,
        minValue: null,
        maxValue: null,
        rawWaterMinValue: null,
        rawWaterMaxValue: null,
        displayOrder: 1,
      },
      {
        id: 'param-gc',
        name: 'General Condition',
        variableName: 'general_condition',
        category: 'GENERAL_CONDITION',
        valueType: 'BOOLEAN',
        unit: null,
        minValue: null,
        maxValue: null,
        rawWaterMinValue: null,
        rawWaterMaxValue: null,
        displayOrder: 2,
      },
      {
        id: 'param-jd',
        name: 'Job Description',
        variableName: 'job_description',
        category: 'JOB_DESCRIPTION',
        valueType: 'TEXT',
        unit: null,
        minValue: null,
        maxValue: null,
        rawWaterMinValue: null,
        rawWaterMaxValue: null,
        displayOrder: 3,
      },
      {
        id: 'param-cond',
        name: 'Condensor Temp',
        variableName: 'condensor_temp',
        category: 'UNIT_CONDENSOR',
        valueType: 'NUMBER',
        unit: 'C',
        minValue: null,
        maxValue: null,
        rawWaterMinValue: null,
        rawWaterMaxValue: null,
        displayOrder: 4,
      },
      {
        id: 'param-evap',
        name: 'Evaporator Temp',
        variableName: 'evaporator_temp',
        category: 'UNIT_EVAPORATOR',
        valueType: 'NUMBER',
        unit: 'C',
        minValue: null,
        maxValue: null,
        rawWaterMinValue: null,
        rawWaterMaxValue: null,
        displayOrder: 5,
      },
      {
        id: 'param-cons',
        name: 'Water Consumption',
        variableName: 'water_consumption',
        category: 'CONSUMPTION',
        valueType: 'NUMBER',
        unit: 'm3',
        minValue: null,
        maxValue: null,
        rawWaterMinValue: null,
        rawWaterMaxValue: null,
        displayOrder: 6,
      },
    ] as any,
    entries: [],
    photos: [],
    chemicalUsages: [],
    activeMachineIds: {
      chillers: ['ch-1'],
      coolingTowers: ['ct-1'],
    },
    ...overrides,
  };
}

describe('validateLogSheetApprovalDetail (characterization)', () => {
  describe('required field validation - COOLING_WATER_QUALITY', () => {
    it('requires VALUE entry for active cooling towers', () => {
      const detail = createBaseDetail({
        entries: [],
      });

      expect(() => validateLogSheetApprovalDetail(detail)).toThrow(
        /pH \(CT #1\) wajib diisi/
      );
    });

    it('requires RAW_WATER entry for cooling water params (except cycle)', () => {
      const detail = createBaseDetail({
        entries: [
          {
            id: 'e-1',
            logSheetId: 'ls-1',
            parameterId: 'param-cw',
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
        ] as any,
      });

      expect(() => validateLogSheetApprovalDetail(detail)).toThrow(
        /pH \(Raw Water\) wajib diisi/
      );
    });

    it('REQUIRES RAW_WATER for cycle of concentration too (SURPRISING: not excluded in approval-validation)', () => {
      const detail = createBaseDetail({
        entries: [
          {
            id: 'e-1',
            logSheetId: 'ls-1',
            parameterId: 'param-cycle',
            machineId: 'ct-1',
            role: 'VALUE',
            valueType: 'NUMBER',
            numericValue: 3,
            boolValue: null,
            textValue: null,
            fileUrl: null,
            checkedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          },
        ] as any,
      });

      expect(() => validateLogSheetApprovalDetail(detail)).toThrow(
        /Cycle of concentration \(Raw Water\) wajib diisi/
      );
    });

    it('does not require raw water when no cooling towers are active', () => {
      const detail = createBaseDetail({
        activeMachineIds: {
          chillers: ['ch-1'],
          coolingTowers: [],
        },
        entries: [
          {
            id: 'e-1',
            logSheetId: 'ls-1',
            parameterId: 'param-cond',
            machineId: 'ch-1',
            role: 'VALUE',
            valueType: 'NUMBER',
            numericValue: 50,
            boolValue: null,
            textValue: null,
            fileUrl: null,
            checkedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          },
          {
            id: 'e-2',
            logSheetId: 'ls-1',
            parameterId: 'param-evap',
            machineId: 'ch-1',
            role: 'VALUE',
            valueType: 'NUMBER',
            numericValue: 10,
            boolValue: null,
            textValue: null,
            fileUrl: null,
            checkedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          },
          {
            id: 'e-3',
            logSheetId: 'ls-1',
            parameterId: 'param-cons',
            machineId: null,
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
        ] as any,
      });

      // No raw water entries, no active CTs → should pass
      expect(() => validateLogSheetApprovalDetail(detail)).not.toThrow(
        /Raw Water.*wajib diisi/
      );
    });
  });

  describe('required field validation - GENERAL_CONDITION', () => {
    it('requires BOOLEAN value for active cooling towers', () => {
      const detail = createBaseDetail({
        entries: [
          {
            id: 'e-1',
            logSheetId: 'ls-1',
            parameterId: 'param-cw',
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
          {
            id: 'e-2',
            logSheetId: 'ls-1',
            parameterId: 'param-cw',
            machineId: null,
            role: 'RAW_WATER',
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
          {
            id: 'e-3',
            logSheetId: 'ls-1',
            parameterId: 'param-cycle',
            machineId: 'ct-1',
            role: 'VALUE',
            valueType: 'NUMBER',
            numericValue: 3,
            boolValue: null,
            textValue: null,
            fileUrl: null,
            checkedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          },
        ] as any,
      });

      expect(() => validateLogSheetApprovalDetail(detail)).toThrow(
        /General Condition \(CT #1\) wajib diisi/
      );
    });

    it('requires NOTE entry for GENERAL_CONDITION', () => {
      const detail = createBaseDetail({
        entries: [
          {
            id: 'e-1',
            logSheetId: 'ls-1',
            parameterId: 'param-gc',
            machineId: 'ct-1',
            role: 'VALUE',
            valueType: 'BOOLEAN',
            numericValue: null,
            boolValue: true,
            textValue: null,
            fileUrl: null,
            checkedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          },
        ] as any,
      });

      expect(() => validateLogSheetApprovalDetail(detail)).toThrow(
        /General Condition \(Catatan\) wajib diisi/
      );
    });
  });

  describe('required field validation - UNIT_CONDENSOR/UNIT_EVAPORATOR', () => {
    it('requires entries for active chillers', () => {
      const detail = createBaseDetail({
        entries: [
          {
            id: 'e-1',
            logSheetId: 'ls-1',
            parameterId: 'param-cond',
            machineId: 'ch-1',
            role: 'VALUE',
            valueType: 'NUMBER',
            numericValue: 50,
            boolValue: null,
            textValue: null,
            fileUrl: null,
            checkedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          },
        ] as any,
      });

      expect(() => validateLogSheetApprovalDetail(detail)).toThrow(
        /Evaporator Temp \(Chiller #1\) wajib diisi/
      );
    });
  });

  describe('required field validation - CONSUMPTION', () => {
    it('requires consumption value', () => {
      const detail = createBaseDetail();

      expect(() => validateLogSheetApprovalDetail(detail)).toThrow(
        /Water Consumption \(Nilai\) wajib diisi/
      );
    });
  });

  describe('machine filtering', () => {
    it('still requires CONSUMPTION even when no active machines (SURPRISING)', () => {
      const detail = createBaseDetail({
        activeMachineIds: {
          chillers: [],
          coolingTowers: [],
        },
        entries: [],
      });

      expect(() => validateLogSheetApprovalDetail(detail)).toThrow(
        /Water Consumption \(Nilai\) wajib diisi/
      );
    });

    it('validates for all active machines when multiple exist', () => {
      const detail = createBaseDetail({
        machines: {
          chillers: [
            { id: 'ch-1', unitNumber: 1, type: 'CHILLER' },
            { id: 'ch-2', unitNumber: 2, type: 'CHILLER' },
          ],
          coolingTowers: [{ id: 'ct-1', unitNumber: 1, type: 'COOLING_TOWER' }],
        },
        activeMachineIds: {
          chillers: ['ch-1', 'ch-2'],
          coolingTowers: ['ct-1'],
        },
        entries: [
          {
            id: 'e-1',
            logSheetId: 'ls-1',
            parameterId: 'param-cond',
            machineId: 'ch-1',
            role: 'VALUE',
            valueType: 'NUMBER',
            numericValue: 50,
            boolValue: null,
            textValue: null,
            fileUrl: null,
            checkedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          },
        ] as any,
      });

      expect(() => validateLogSheetApprovalDetail(detail)).toThrow(
        /Evaporator Temp \(Chiller #1\) wajib diisi/
      );
    });
  });

  describe('entry completeness checks', () => {
    it('considers NUMBER complete with any numeric value (including 0)', () => {
      const detail = createBaseDetail({
        entries: [
          {
            id: 'e-1',
            logSheetId: 'ls-1',
            parameterId: 'param-cw',
            machineId: 'ct-1',
            role: 'VALUE',
            valueType: 'NUMBER',
            numericValue: 0,
            boolValue: null,
            textValue: null,
            fileUrl: null,
            checkedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          },
          {
            id: 'e-2',
            logSheetId: 'ls-1',
            parameterId: 'param-cw',
            machineId: null,
            role: 'RAW_WATER',
            valueType: 'NUMBER',
            numericValue: 0,
            boolValue: null,
            textValue: null,
            fileUrl: null,
            checkedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          },
        ] as any,
      });

      expect(() => validateLogSheetApprovalDetail(detail)).not.toThrow(
        /pH.*wajib diisi/
      );
    });

    it('considers BOOLEAN complete with false value', () => {
      const detail = createBaseDetail({
        entries: [
          {
            id: 'e-1',
            logSheetId: 'ls-1',
            parameterId: 'param-gc',
            machineId: 'ct-1',
            role: 'VALUE',
            valueType: 'BOOLEAN',
            numericValue: null,
            boolValue: false,
            textValue: null,
            fileUrl: null,
            checkedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          },
          {
            id: 'e-2',
            logSheetId: 'ls-1',
            parameterId: 'param-gc',
            machineId: null,
            role: 'NOTE',
            valueType: 'TEXT',
            numericValue: null,
            boolValue: null,
            textValue: 'Note',
            fileUrl: null,
            checkedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          },
        ] as any,
      });

      expect(() => validateLogSheetApprovalDetail(detail)).not.toThrow(
        /General Condition.*wajib diisi/
      );
    });

    it('considers TEXT incomplete with empty string', () => {
      const detail = createBaseDetail({
        entries: [
          {
            id: 'e-1',
            logSheetId: 'ls-1',
            parameterId: 'param-jd',
            machineId: null,
            role: 'NOTE',
            valueType: 'TEXT',
            numericValue: null,
            boolValue: null,
            textValue: '',
            fileUrl: null,
            checkedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          },
        ] as any,
      });

      expect(() => validateLogSheetApprovalDetail(detail)).toThrow(
        /wajib diisi/
      );
    });

    it('considers TEXT incomplete with whitespace-only string', () => {
      const detail = createBaseDetail({
        entries: [
          {
            id: 'e-1',
            logSheetId: 'ls-1',
            parameterId: 'param-jd',
            machineId: null,
            role: 'NOTE',
            valueType: 'TEXT',
            numericValue: null,
            boolValue: null,
            textValue: '   ',
            fileUrl: null,
            checkedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          },
        ] as any,
      });

      expect(() => validateLogSheetApprovalDetail(detail)).toThrow(
        /wajib diisi/
      );
    });
  });

  describe('error message format', () => {
    it('joins multiple errors with newline', () => {
      const detail = createBaseDetail({
        entries: [],
      });

      try {
        validateLogSheetApprovalDetail(detail);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const message = (error as Error).message;
        expect(message).toContain('Validasi gagal:');
        expect(message).toContain('\n');
      }
    });
  });
});
