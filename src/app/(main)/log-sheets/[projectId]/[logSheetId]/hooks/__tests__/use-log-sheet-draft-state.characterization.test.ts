/** @vitest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { TDetail } from '../../types';
import { useLogSheetDraftState } from '../use-log-sheet-draft-state';

function createMockDetail(overrides?: Partial<TDetail>): TDetail {
  return {
    viewerRole: 'TECHNICIAN',
    logSheet: {
      id: 'ls-1',
      projectId: 'p-1',
      date: '2024-01-15',
      notes: 'Initial notes',
      status: 'DRAFT',
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
      replacedBy: null,
      submittedBy: null,
      approvedBy: null,
      technicianSignedBy: null,
      clientPicSignedBy: null,
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
      coolingTowers: [{ id: 'ct-1', unitNumber: 1, type: 'COOLING_TOWER' }],
    },
    parameters: [
      {
        id: 'param-1',
        name: 'Temperature',
        variableName: 'temperature',
        category: 'UNIT_CONDENSOR',
        valueType: 'NUMBER',
        unit: 'C',
        minValue: 0,
        maxValue: 100,
        displayOrder: 1,
      },
      {
        id: 'param-2',
        name: 'Is Running',
        variableName: 'is_running',
        category: 'GENERAL_CONDITION',
        valueType: 'BOOLEAN',
        unit: null,
        minValue: null,
        maxValue: null,
        displayOrder: 2,
      },
      {
        id: 'param-3',
        name: 'pH',
        variableName: 'ph',
        category: 'COOLING_WATER_QUALITY',
        valueType: 'NUMBER',
        unit: null,
        minValue: 6,
        maxValue: 8,
        rawWaterMinValue: 5,
        rawWaterMaxValue: 9,
        displayOrder: 3,
      },
    ],
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

describe('useLogSheetDraftState (characterization)', () => {
  describe('initialization from detail', () => {
    it('initializes state from detail on mount (main path)', () => {
      const detail = createMockDetail();

      const { result } = renderHook(() => useLogSheetDraftState(detail));

      expect(result.current.notes).toBe('Initial notes');
      expect(result.current.activeChillerIds).toEqual(['ch-1']);
      expect(result.current.activeCTIds).toEqual(['ct-1']);
      expect(result.current.replacedByUserId).toBe(null);
    });

    it('initializes notes to empty string when detail.logSheet.notes is null (edge case)', () => {
      const detail = createMockDetail({
        logSheet: {
          ...createMockDetail().logSheet,
          notes: null,
        },
      });

      const { result } = renderHook(() => useLogSheetDraftState(detail));

      expect(result.current.notes).toBe('');
    });

    it('initializes replacedByUserId from detail.logSheet.replacedBy (main path)', () => {
      const detail = createMockDetail({
        logSheet: {
          ...createMockDetail().logSheet,
          replacedBy: { id: 'user-1', firstName: 'John', lastName: 'Doe' },
        },
      });

      const { result } = renderHook(() => useLogSheetDraftState(detail));

      expect(result.current.replacedByUserId).toBe('user-1');
    });

    it('initializes entryState from detail.entries (main path)', () => {
      const detail = createMockDetail({
        entries: [
          {
            parameterId: 'param-1',
            machineId: 'ch-1',
            role: 'VALUE',
            valueType: 'NUMBER',
            numericValue: 42.5,
            boolValue: null,
            textValue: null,
            fileUrl: null,
          },
        ],
      });

      const { result } = renderHook(() => useLogSheetDraftState(detail));

      const key = 'param-1:ch-1:VALUE';
      expect(result.current.entryState[key]).toBeDefined();
      expect(result.current.entryState[key].numericValue).toBe(42.5);
      expect(result.current.entryState[key].valueType).toBe('NUMBER');
    });

    it('initializes chemicalState from detail.chemicalUsages (main path)', () => {
      const detail = createMockDetail({
        chemicalUsages: [
          {
            id: 'cu-1',
            chemicalId: 'chem-1',
            amount: 10.5,
            chemicalName: 'Chlorine',
            chemicalUnit: 'ml',
          },
        ],
      });

      const { result } = renderHook(() => useLogSheetDraftState(detail));

      expect(result.current.chemicalState).toHaveLength(1);
      expect(result.current.chemicalState[0].chemicalId).toBe('chem-1');
      expect(result.current.chemicalState[0].amount).toBe(10.5);
    });
  });

  describe('BOOLEAN parameter default initialization', () => {
    it('initializes missing BOOLEAN entries for COOLING_WATER_QUALITY with active CT (surprising behavior: auto-creates false values)', () => {
      const detail = createMockDetail({
        parameters: [
          {
            id: 'param-bool-1',
            name: 'Pump Running',
            variableName: 'pump_running',
            category: 'COOLING_WATER_QUALITY',
            valueType: 'BOOLEAN',
            unit: null,
            minValue: null,
            maxValue: null,
            displayOrder: 1,
          },
        ],
        entries: [],
        activeMachineIds: {
          chillers: [],
          coolingTowers: ['ct-1'],
        },
      });

      const { result } = renderHook(() => useLogSheetDraftState(detail));

      const valueKey = 'param-bool-1:ct-1:VALUE';
      const rawKey = 'param-bool-1:null:RAW_WATER';

      expect(result.current.entryState[valueKey]).toEqual({
        valueType: 'BOOLEAN',
        boolValue: false,
      });
      expect(result.current.entryState[rawKey]).toEqual({
        valueType: 'BOOLEAN',
        boolValue: false,
      });
    });

    it('initializes missing BOOLEAN entries for GENERAL_CONDITION with active CT (main path)', () => {
      const detail = createMockDetail({
        parameters: [
          {
            id: 'param-bool-2',
            name: 'General Check',
            variableName: 'general_check',
            category: 'GENERAL_CONDITION',
            valueType: 'BOOLEAN',
            unit: null,
            minValue: null,
            maxValue: null,
            displayOrder: 1,
          },
        ],
        entries: [],
        activeMachineIds: {
          chillers: [],
          coolingTowers: ['ct-1'],
        },
      });

      const { result } = renderHook(() => useLogSheetDraftState(detail));

      const valueKey = 'param-bool-2:ct-1:VALUE';
      expect(result.current.entryState[valueKey]).toEqual({
        valueType: 'BOOLEAN',
        boolValue: false,
      });
    });

    it('initializes missing BOOLEAN entries for JOB_DESCRIPTION with active CT (main path)', () => {
      const detail = createMockDetail({
        parameters: [
          {
            id: 'param-bool-3',
            name: 'Task Completed',
            variableName: 'task_completed',
            category: 'JOB_DESCRIPTION',
            valueType: 'BOOLEAN',
            unit: null,
            minValue: null,
            maxValue: null,
            displayOrder: 1,
          },
        ],
        entries: [],
        activeMachineIds: {
          chillers: [],
          coolingTowers: ['ct-1'],
        },
      });

      const { result } = renderHook(() => useLogSheetDraftState(detail));

      const valueKey = 'param-bool-3:ct-1:VALUE';
      expect(result.current.entryState[valueKey]).toEqual({
        valueType: 'BOOLEAN',
        boolValue: false,
      });
    });

    it('does NOT initialize BOOLEAN entries for UNIT_CONDENSOR (edge case: only CT categories)', () => {
      const detail = createMockDetail({
        parameters: [
          {
            id: 'param-bool-4',
            name: 'Condensor Check',
            variableName: 'condensor_check',
            category: 'UNIT_CONDENSOR',
            valueType: 'BOOLEAN',
            unit: null,
            minValue: null,
            maxValue: null,
            displayOrder: 1,
          },
        ],
        entries: [],
        activeMachineIds: {
          chillers: ['ch-1'],
          coolingTowers: [],
        },
      });

      const { result } = renderHook(() => useLogSheetDraftState(detail));

      const valueKey = 'param-bool-4:ch-1:VALUE';
      expect(result.current.entryState[valueKey]).toBeUndefined();
    });

    it('preserves existing entry state over auto-created defaults (main path)', () => {
      const detail = createMockDetail({
        parameters: [
          {
            id: 'param-bool-5',
            name: 'Existing Value',
            variableName: 'existing_value',
            category: 'GENERAL_CONDITION',
            valueType: 'BOOLEAN',
            unit: null,
            minValue: null,
            maxValue: null,
            displayOrder: 1,
          },
        ],
        entries: [
          {
            parameterId: 'param-bool-5',
            machineId: 'ct-1',
            role: 'VALUE',
            valueType: 'BOOLEAN',
            numericValue: null,
            boolValue: true,
            textValue: null,
            fileUrl: null,
          },
        ],
        activeMachineIds: {
          chillers: [],
          coolingTowers: ['ct-1'],
        },
      });

      const { result } = renderHook(() => useLogSheetDraftState(detail));

      const valueKey = 'param-bool-5:ct-1:VALUE';
      expect(result.current.entryState[valueKey].boolValue).toBe(true);
    });
  });

  describe('state setters', () => {
    it('allows setNotes to update notes state (main path)', () => {
      const detail = createMockDetail();

      const { result } = renderHook(() => useLogSheetDraftState(detail));

      act(() => {
        result.current.setNotes('Updated notes');
      });

      expect(result.current.notes).toBe('Updated notes');
    });

    it('allows setReplacedByUserId to update replacedByUserId (main path)', () => {
      const detail = createMockDetail();

      const { result } = renderHook(() => useLogSheetDraftState(detail));

      act(() => {
        result.current.setReplacedByUserId('user-2');
      });

      expect(result.current.replacedByUserId).toBe('user-2');
    });

    it('allows setEntryState to update entry state (main path)', () => {
      const detail = createMockDetail();

      const { result } = renderHook(() => useLogSheetDraftState(detail));

      act(() => {
        result.current.setEntryState({
          'param-1:ch-1:VALUE': {
            valueType: 'NUMBER',
            numericValue: 100,
          },
        });
      });

      expect(result.current.entryState['param-1:ch-1:VALUE'].numericValue).toBe(
        100
      );
    });

    it('allows setActiveChillerIds to update active chillers (main path)', () => {
      const detail = createMockDetail();

      const { result } = renderHook(() => useLogSheetDraftState(detail));

      act(() => {
        result.current.setActiveChillerIds(['ch-1', 'ch-2']);
      });

      expect(result.current.activeChillerIds).toEqual(['ch-1', 'ch-2']);
    });

    it('allows setActiveCTIds to update active cooling towers (main path)', () => {
      const detail = createMockDetail();

      const { result } = renderHook(() => useLogSheetDraftState(detail));

      act(() => {
        result.current.setActiveCTIds([]);
      });

      expect(result.current.activeCTIds).toEqual([]);
    });

    it('allows setChemicalState to update chemical usages (main path)', () => {
      const detail = createMockDetail();

      const { result } = renderHook(() => useLogSheetDraftState(detail));

      act(() => {
        result.current.setChemicalState([
          {
            id: 'new-1',
            chemicalId: 'chem-2',
            amount: 5,
            chemicalName: 'Acid',
            unit: 'L',
          },
        ]);
      });

      expect(result.current.chemicalState).toHaveLength(1);
      expect(result.current.chemicalState[0].chemicalName).toBe('Acid');
    });
  });

  describe('null/undefined detail handling', () => {
    it('returns default empty state when detail is null (edge case)', () => {
      const { result } = renderHook(() => useLogSheetDraftState(null));

      expect(result.current.notes).toBe('');
      expect(result.current.replacedByUserId).toBe(null);
      expect(result.current.entryState).toEqual({});
      expect(result.current.chemicalState).toEqual([]);
      expect(result.current.activeChillerIds).toEqual([]);
      expect(result.current.activeCTIds).toEqual([]);
    });

    it('does not crash when detail transitions from null to valid (error condition recovery)', () => {
      const { result, rerender } = renderHook(
        ({ detail }: { detail: TDetail | null }) =>
          useLogSheetDraftState(detail),
        { initialProps: { detail: null } }
      );

      expect(result.current.notes).toBe('');

      const detail = createMockDetail();
      rerender({ detail });

      expect(result.current.notes).toBe('Initial notes');
    });
  });
});
