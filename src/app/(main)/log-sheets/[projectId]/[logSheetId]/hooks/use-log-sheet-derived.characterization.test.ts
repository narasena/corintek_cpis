/** @vitest-environment jsdom */
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { TDetail, TMachine, TParameter } from '../types';
import type { TUserResponse } from '@/@types/user.type';
import { useLogSheetDerived } from './use-log-sheet-derived';

function createMockDetail(overrides?: Partial<TDetail>): TDetail {
  return {
    viewerRole: 'TECHNICIAN',
    logSheet: {
      id: 'ls-1',
      projectId: 'p-1',
      date: '2024-01-15',
      notes: null,
      status: 'DRAFT',
      locked: false,
      technicianSignatureUrl: null,
      technicianSignedAt: null,
      technicianSignedByUserId: null,
      clientPicSignatureUrl: null,
      clientPicSignedAt: null,
      clientPicSignedByUserId: null,
      submittedAt: null,
      submittedByUserId: null,
      approvedAt: null,
      approvedByUserId: null,
    },
    project: {
      id: 'p-1',
      name: 'Test Project',
      clientName: 'Test Client',
      assignments: [],
    },
    machines: {
      chillers: [
        { id: 'ch-1', unitNumber: 1, type: 'CHILLER' },
        { id: 'ch-2', unitNumber: 2, type: 'CHILLER' },
      ],
      coolingTowers: [
        { id: 'ct-1', unitNumber: 1, type: 'COOLING_TOWER' },
        { id: 'ct-2', unitNumber: 2, type: 'COOLING_TOWER' },
      ],
    },
    parameters: [
      {
        id: 'param-1',
        name: 'Condensor Temp',
        variableName: 'condensor_temp',
        category: 'UNIT_CONDENSOR',
        valueType: 'NUMBER',
        unit: 'C',
        minValue: 0,
        maxValue: 100,
        displayOrder: 2,
      },
      {
        id: 'param-2',
        name: 'Evaporator Temp',
        variableName: 'evaporator_temp',
        category: 'UNIT_EVAPORATOR',
        valueType: 'NUMBER',
        unit: 'C',
        minValue: 0,
        maxValue: 50,
        displayOrder: 1,
      },
      {
        id: 'param-3',
        name: 'pH Level',
        variableName: 'ph_level',
        category: 'COOLING_WATER_QUALITY',
        valueType: 'NUMBER',
        unit: null,
        minValue: 6,
        maxValue: 8,
        displayOrder: 1,
      },
      {
        id: 'param-4',
        name: 'General Check',
        variableName: 'general_check',
        category: 'GENERAL_CONDITION',
        valueType: 'BOOLEAN',
        unit: null,
        minValue: null,
        maxValue: null,
        displayOrder: 1,
      },
      {
        id: 'param-5',
        name: 'Job Notes',
        variableName: 'job_notes',
        category: 'JOB_DESCRIPTION',
        valueType: 'TEXT',
        unit: null,
        minValue: null,
        maxValue: null,
        displayOrder: 1,
      },
      {
        id: 'param-6',
        name: 'Water Usage',
        variableName: 'water_usage',
        category: 'CONSUMPTION',
        valueType: 'NUMBER',
        unit: 'm3',
        minValue: null,
        maxValue: null,
        displayOrder: 1,
      },
    ],
    entries: [],
    photos: [],
    chemicalUsages: [],
    activeMachineIds: {
      chillers: ['ch-1'],
      coolingTowers: ['ct-1'],
    },
    technicians: [],
    chemicals: [],
    ...overrides,
  };
}

function createMockTechnicians(): TUserResponse[] {
  const base = {
    idNumber: null,
    phoneNumber: '0812345678',
    avatarUrl: null,
    employmentStatus: 'PERMANENT',
    isActive: true,
    isBlocked: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };
  return [
    {
      id: 'tech-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
      role: 'TECHNICIAN',
      ...base,
    },
    {
      id: 'tech-2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@test.com',
      role: 'TECHNICIAN',
      ...base,
    },
  ];
}

describe('useLogSheetDerived (characterization)', () => {
  describe('categories derivation', () => {
    it('extracts unique categories from parameters (main path)', () => {
      const detail = createMockDetail();
      const technicians = createMockTechnicians();

      const { result } = renderHook(() =>
        useLogSheetDerived({
          detail,
          activeChillerIds: ['ch-1'],
          activeCTIds: ['ct-1'],
          technicians,
          replacedByUserId: null,
        })
      );

      const categories = result.current.categories;
      expect(categories).toContain('UNIT_CONDENSOR');
      expect(categories).toContain('UNIT_EVAPORATOR');
      expect(categories).toContain('COOLING_WATER_QUALITY');
      expect(categories).toContain('GENERAL_CONDITION');
      expect(categories).toContain('JOB_DESCRIPTION');
      expect(categories).toContain('CONSUMPTION');
    });

    it('sorts categories according to CATEGORY_ORDER (main path)', () => {
      const detail = createMockDetail();
      const technicians = createMockTechnicians();

      const { result } = renderHook(() =>
        useLogSheetDerived({
          detail,
          activeChillerIds: ['ch-1'],
          activeCTIds: ['ct-1'],
          technicians,
          replacedByUserId: null,
        })
      );

      const categories = result.current.categories;
      const condensorIdx = categories.indexOf('UNIT_CONDENSOR');
      const evaporatorIdx = categories.indexOf('UNIT_EVAPORATOR');
      const cqwIdx = categories.indexOf('COOLING_WATER_QUALITY');

      expect(condensorIdx).toBeLessThan(evaporatorIdx);
      expect(evaporatorIdx).toBeLessThan(cqwIdx);
    });

    it('returns empty array when detail is null (edge case)', () => {
      const technicians = createMockTechnicians();

      const { result } = renderHook(() =>
        useLogSheetDerived({
          detail: null,
          activeChillerIds: [],
          activeCTIds: [],
          technicians,
          replacedByUserId: null,
        })
      );

      expect(result.current.categories).toEqual([]);
    });
  });

  describe('parametersByCategory derivation', () => {
    it('groups parameters by category (main path)', () => {
      const detail = createMockDetail();
      const technicians = createMockTechnicians();

      const { result } = renderHook(() =>
        useLogSheetDerived({
          detail,
          activeChillerIds: ['ch-1'],
          activeCTIds: ['ct-1'],
          technicians,
          replacedByUserId: null,
        })
      );

      const map = result.current.parametersByCategory;

      expect(map.get('UNIT_CONDENSOR')).toHaveLength(1);
      expect(map.get('UNIT_CONDENSOR')![0].name).toBe('Condensor Temp');
      expect(map.get('COOLING_WATER_QUALITY')).toHaveLength(1);
    });

    it('sorts parameters within category by displayOrder (main path)', () => {
      const detail = createMockDetail({
        parameters: [
          {
            id: 'param-1',
            name: 'Second',
            variableName: 'second',
            category: 'UNIT_CONDENSOR',
            valueType: 'NUMBER',
            unit: null,
            minValue: null,
            maxValue: null,
            displayOrder: 2,
          },
          {
            id: 'param-2',
            name: 'First',
            variableName: 'first',
            category: 'UNIT_CONDENSOR',
            valueType: 'NUMBER',
            unit: null,
            minValue: null,
            maxValue: null,
            displayOrder: 1,
          },
        ],
      });
      const technicians = createMockTechnicians();

      const { result } = renderHook(() =>
        useLogSheetDerived({
          detail,
          activeChillerIds: ['ch-1'],
          activeCTIds: ['ct-1'],
          technicians,
          replacedByUserId: null,
        })
      );

      const params = result.current.parametersByCategory.get('UNIT_CONDENSOR');
      expect(params![0].name).toBe('First');
      expect(params![1].name).toBe('Second');
    });

    it('returns empty Map when detail is null (edge case)', () => {
      const technicians = createMockTechnicians();

      const { result } = renderHook(() =>
        useLogSheetDerived({
          detail: null,
          activeChillerIds: [],
          activeCTIds: [],
          technicians,
          replacedByUserId: null,
        })
      );

      expect(result.current.parametersByCategory.size).toBe(0);
    });
  });

  describe('machinesForCategory', () => {
    it('returns active chillers for UNIT_CONDENSOR (main path)', () => {
      const detail = createMockDetail();
      const technicians = createMockTechnicians();

      const { result } = renderHook(() =>
        useLogSheetDerived({
          detail,
          activeChillerIds: ['ch-1'],
          activeCTIds: ['ct-1'],
          technicians,
          replacedByUserId: null,
        })
      );

      const { machines, label } =
        result.current.machinesForCategory('UNIT_CONDENSOR');

      expect(label).toBe('Chiller');
      expect(machines).toHaveLength(1);
      expect(machines[0].id).toBe('ch-1');
    });

    it('returns active chillers for UNIT_EVAPORATOR (main path)', () => {
      const detail = createMockDetail();
      const technicians = createMockTechnicians();

      const { result } = renderHook(() =>
        useLogSheetDerived({
          detail,
          activeChillerIds: ['ch-1', 'ch-2'],
          activeCTIds: [],
          technicians,
          replacedByUserId: null,
        })
      );

      const { machines, label } =
        result.current.machinesForCategory('UNIT_EVAPORATOR');

      expect(label).toBe('Chiller');
      expect(machines).toHaveLength(2);
    });

    it('returns active cooling towers for COOLING_WATER_QUALITY (main path)', () => {
      const detail = createMockDetail();
      const technicians = createMockTechnicians();

      const { result } = renderHook(() =>
        useLogSheetDerived({
          detail,
          activeChillerIds: [],
          activeCTIds: ['ct-1', 'ct-2'],
          technicians,
          replacedByUserId: null,
        })
      );

      const { machines, label } = result.current.machinesForCategory(
        'COOLING_WATER_QUALITY'
      );

      expect(label).toBe('Cooling Tower');
      expect(machines).toHaveLength(2);
    });

    it('returns active cooling towers for GENERAL_CONDITION (main path)', () => {
      const detail = createMockDetail();
      const technicians = createMockTechnicians();

      const { result } = renderHook(() =>
        useLogSheetDerived({
          detail,
          activeChillerIds: [],
          activeCTIds: ['ct-1'],
          technicians,
          replacedByUserId: null,
        })
      );

      const { machines, label } =
        result.current.machinesForCategory('GENERAL_CONDITION');

      expect(label).toBe('Cooling Tower');
      expect(machines).toHaveLength(1);
    });

    it('returns active cooling towers for JOB_DESCRIPTION (main path)', () => {
      const detail = createMockDetail();
      const technicians = createMockTechnicians();

      const { result } = renderHook(() =>
        useLogSheetDerived({
          detail,
          activeChillerIds: [],
          activeCTIds: ['ct-1'],
          technicians,
          replacedByUserId: null,
        })
      );

      const { machines, label } =
        result.current.machinesForCategory('JOB_DESCRIPTION');

      expect(label).toBe('Cooling Tower');
      expect(machines).toHaveLength(1);
    });

    it('returns empty array for CONSUMPTION category (edge case: no machines)', () => {
      const detail = createMockDetail();
      const technicians = createMockTechnicians();

      const { result } = renderHook(() =>
        useLogSheetDerived({
          detail,
          activeChillerIds: ['ch-1'],
          activeCTIds: ['ct-1'],
          technicians,
          replacedByUserId: null,
        })
      );

      const { machines, label } =
        result.current.machinesForCategory('CONSUMPTION');

      expect(label).toBe('');
      expect(machines).toEqual([]);
    });

    it('returns empty array and label when detail is null (edge case)', () => {
      const technicians = createMockTechnicians();

      const { result } = renderHook(() =>
        useLogSheetDerived({
          detail: null,
          activeChillerIds: [],
          activeCTIds: [],
          technicians,
          replacedByUserId: null,
        })
      );

      const { machines, label } =
        result.current.machinesForCategory('UNIT_CONDENSOR');

      expect(label).toBe('');
      expect(machines).toEqual([]);
    });
  });

  describe('activeMachines derivation', () => {
    it('filters machines by active IDs (main path)', () => {
      const detail = createMockDetail();
      const technicians = createMockTechnicians();

      const { result } = renderHook(() =>
        useLogSheetDerived({
          detail,
          activeChillerIds: ['ch-2'],
          activeCTIds: ['ct-2'],
          technicians,
          replacedByUserId: null,
        })
      );

      const { chillers, coolingTowers } = result.current.activeMachines;

      expect(chillers).toHaveLength(1);
      expect(chillers[0].id).toBe('ch-2');
      expect(coolingTowers).toHaveLength(1);
      expect(coolingTowers[0].id).toBe('ct-2');
    });

    it('returns empty arrays when detail is null (edge case)', () => {
      const technicians = createMockTechnicians();

      const { result } = renderHook(() =>
        useLogSheetDerived({
          detail: null,
          activeChillerIds: ['ch-1'],
          activeCTIds: ['ct-1'],
          technicians,
          replacedByUserId: null,
        })
      );

      expect(result.current.activeMachines.chillers).toEqual([]);
      expect(result.current.activeMachines.coolingTowers).toEqual([]);
    });
  });

  describe('replacedByName derivation', () => {
    it('returns null when replacedByUserId is null (main path)', () => {
      const detail = createMockDetail();
      const technicians = createMockTechnicians();

      const { result } = renderHook(() =>
        useLogSheetDerived({
          detail,
          activeChillerIds: [],
          activeCTIds: [],
          technicians,
          replacedByUserId: null,
        })
      );

      expect(result.current.replacedByName).toBe(null);
    });

    it('finds technician name from technicians list (main path)', () => {
      const detail = createMockDetail();
      const technicians = createMockTechnicians();

      const { result } = renderHook(() =>
        useLogSheetDerived({
          detail,
          activeChillerIds: [],
          activeCTIds: [],
          technicians,
          replacedByUserId: 'tech-1',
        })
      );

      expect(result.current.replacedByName).toBe('John Doe');
    });

    it('finds technician name from detail.logSheet.replacedBy when not in technicians list (fallback)', () => {
      const detail = createMockDetail({
        logSheet: {
          ...createMockDetail().logSheet,
          replacedBy: {
            id: 'external-1',
            firstName: 'External',
            lastName: 'User',
          },
        },
      });
      const technicians = createMockTechnicians();

      const { result } = renderHook(() =>
        useLogSheetDerived({
          detail,
          activeChillerIds: [],
          activeCTIds: [],
          technicians,
          replacedByUserId: 'external-1',
        })
      );

      expect(result.current.replacedByName).toBe('External User');
    });

    it('returns null when technician not found in either list (edge case)', () => {
      const detail = createMockDetail();
      const technicians = createMockTechnicians();

      const { result } = renderHook(() =>
        useLogSheetDerived({
          detail,
          activeChillerIds: [],
          activeCTIds: [],
          technicians,
          replacedByUserId: 'non-existent',
        })
      );

      expect(result.current.replacedByName).toBe(null);
    });

    it('handles lastName being null (edge case)', () => {
      const detail = createMockDetail();
      const technicians: TUserResponse[] = [
        {
          id: 'tech-no-last',
          firstName: 'Solo',
          lastName: null,
          email: 'solo@test.com',
          role: 'TECHNICIAN',
          idNumber: null,
          phoneNumber: '0812345678',
          avatarUrl: null,
          employmentStatus: 'PERMANENT',
          isActive: true,
          isBlocked: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];

      const { result } = renderHook(() =>
        useLogSheetDerived({
          detail,
          activeChillerIds: [],
          activeCTIds: [],
          technicians,
          replacedByUserId: 'tech-no-last',
        })
      );

      expect(result.current.replacedByName).toBe('Solo');
    });
  });
});
