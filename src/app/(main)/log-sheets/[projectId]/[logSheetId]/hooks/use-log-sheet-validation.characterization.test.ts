/** @vitest-environment jsdom */
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TDetail, TEntryState, TParameter } from '../types';
import { useLogSheetValidation } from './use-log-sheet-validation';

const mockValidateLogSheetEntries = vi.fn();

vi.mock('@/features/log-sheets/validation', () => ({
  validateLogSheetEntries: (...args: unknown[]) =>
    mockValidateLogSheetEntries(...args),
}));

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
      chillers: [{ id: 'ch-1', unitNumber: 1, type: 'CHILLER' }],
      coolingTowers: [{ id: 'ct-1', unitNumber: 1, type: 'COOLING_TOWER' }],
    },
    parameters: [],
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

describe('useLogSheetValidation (characterization)', () => {
  beforeEach(() => {
    mockValidateLogSheetEntries.mockReset();
    mockValidateLogSheetEntries.mockReturnValue({
      valid: true,
      errors: [],
      missingFields: [],
    });
  });

  describe('validateEntries callback', () => {
    it('calls validateLogSheetEntries when invoked (main path)', () => {
      const detail = createMockDetail();
      const entryState: Record<string, TEntryState> = {
        'param-1:ch-1:VALUE': { valueType: 'NUMBER', numericValue: 42 },
      };
      const parametersByCategory = new Map<string, TParameter[]>();
      parametersByCategory.set('UNIT_CONDENSOR', [
        {
          id: 'param-1',
          name: 'Test',
          variableName: 'test',
          category: 'UNIT_CONDENSOR',
          valueType: 'NUMBER',
          unit: null,
          minValue: null,
          maxValue: null,
          displayOrder: 1,
        },
      ]);

      const machinesForCategory = vi.fn().mockReturnValue({
        machines: [{ id: 'ch-1', unitNumber: 1, type: 'CHILLER' as const }],
        label: 'Chiller',
      });

      const { result } = renderHook(() =>
        useLogSheetValidation({
          detail,
          entryState,
          activeChillerIds: ['ch-1'],
          activeCTIds: ['ct-1'],
          parametersByCategory,
          machinesForCategory,
        })
      );

      result.current.validateEntries();

      expect(mockValidateLogSheetEntries).toHaveBeenCalled();
    });

    it('passes null detail when detail is null (edge case)', () => {
      const parametersByCategory = new Map<string, TParameter[]>();
      const machinesForCategory = vi
        .fn()
        .mockReturnValue({ machines: [], label: '' });

      const { result } = renderHook(() =>
        useLogSheetValidation({
          detail: null,
          entryState: {},
          activeChillerIds: [],
          activeCTIds: [],
          parametersByCategory,
          machinesForCategory,
        })
      );

      result.current.validateEntries();

      expect(mockValidateLogSheetEntries).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: null,
        })
      );
    });

    it('maps parametersByCategory to validation format (main path)', () => {
      const detail = createMockDetail();
      const parametersByCategory = new Map<string, TParameter[]>();
      parametersByCategory.set('UNIT_CONDENSOR', [
        {
          id: 'param-1',
          name: 'Test Param',
          variableName: 'test_param',
          category: 'UNIT_CONDENSOR',
          valueType: 'NUMBER',
          unit: 'C',
          minValue: 0,
          maxValue: 100,
          displayOrder: 1,
        },
      ]);
      const machinesForCategory = vi
        .fn()
        .mockReturnValue({ machines: [], label: '' });

      const { result } = renderHook(() =>
        useLogSheetValidation({
          detail,
          entryState: {},
          activeChillerIds: ['ch-1'],
          activeCTIds: ['ct-1'],
          parametersByCategory,
          machinesForCategory,
        })
      );

      result.current.validateEntries();

      const callArg = mockValidateLogSheetEntries.mock.calls[0][0];
      const mappedParams = callArg.parametersByCategory;

      expect(mappedParams.get('UNIT_CONDENSOR')).toBeDefined();
      expect(mappedParams.get('UNIT_CONDENSOR')![0]).toMatchObject({
        id: 'param-1',
        name: 'Test Param',
        variableName: 'test_param',
        category: 'UNIT_CONDENSOR',
        valueType: 'NUMBER',
      });
    });

    it('returns validation result from validateLogSheetEntries (main path)', () => {
      mockValidateLogSheetEntries.mockReturnValueOnce({
        valid: false,
        errors: ['Test error'],
        missingFields: ['Field 1'],
      });

      const detail = createMockDetail();
      const parametersByCategory = new Map<string, TParameter[]>();
      const machinesForCategory = vi
        .fn()
        .mockReturnValue({ machines: [], label: '' });

      const { result } = renderHook(() =>
        useLogSheetValidation({
          detail,
          entryState: {},
          activeChillerIds: [],
          activeCTIds: [],
          parametersByCategory,
          machinesForCategory,
        })
      );

      const validationResult = result.current.validateEntries();
      expect(validationResult.valid).toBe(false);
      expect(validationResult.errors).toContain('Test error');
      expect(validationResult.missingFields).toContain('Field 1');
    });

    it('includes machines from detail in validation input (main path)', () => {
      const detail = createMockDetail({
        machines: {
          chillers: [
            { id: 'ch-1', unitNumber: 1, type: 'CHILLER' },
            { id: 'ch-2', unitNumber: 2, type: 'CHILLER' },
          ],
          coolingTowers: [{ id: 'ct-1', unitNumber: 1, type: 'COOLING_TOWER' }],
        },
      });
      const parametersByCategory = new Map<string, TParameter[]>();
      const machinesForCategory = vi
        .fn()
        .mockReturnValue({ machines: [], label: '' });

      const { result } = renderHook(() =>
        useLogSheetValidation({
          detail,
          entryState: {},
          activeChillerIds: ['ch-1'],
          activeCTIds: ['ct-1'],
          parametersByCategory,
          machinesForCategory,
        })
      );

      result.current.validateEntries();

      const callArg = mockValidateLogSheetEntries.mock.calls[0][0];

      expect(callArg.detail.machines.chillers).toHaveLength(2);
      expect(callArg.detail.machines.coolingTowers).toHaveLength(1);
    });

    it('passes entryState to validation (main path)', () => {
      const detail = createMockDetail();
      const entryState: Record<string, TEntryState> = {
        'param-1:ch-1:VALUE': { valueType: 'NUMBER', numericValue: 42 },
      };
      const parametersByCategory = new Map<string, TParameter[]>();
      const machinesForCategory = vi
        .fn()
        .mockReturnValue({ machines: [], label: '' });

      const { result } = renderHook(() =>
        useLogSheetValidation({
          detail,
          entryState,
          activeChillerIds: ['ch-1'],
          activeCTIds: ['ct-1'],
          parametersByCategory,
          machinesForCategory,
        })
      );

      result.current.validateEntries();

      const callArg = mockValidateLogSheetEntries.mock.calls[0][0];

      expect(callArg.entryState).toEqual(entryState);
    });

    it('passes activeChillerIds and activeCTIds to validation (main path)', () => {
      const detail = createMockDetail();
      const parametersByCategory = new Map<string, TParameter[]>();
      const machinesForCategory = vi
        .fn()
        .mockReturnValue({ machines: [], label: '' });

      const { result } = renderHook(() =>
        useLogSheetValidation({
          detail,
          entryState: {},
          activeChillerIds: ['ch-1', 'ch-2'],
          activeCTIds: ['ct-1', 'ct-2'],
          parametersByCategory,
          machinesForCategory,
        })
      );

      result.current.validateEntries();

      const callArg = mockValidateLogSheetEntries.mock.calls[0][0];

      expect(callArg.activeChillerIds).toEqual(['ch-1', 'ch-2']);
      expect(callArg.activeCTIds).toEqual(['ct-1', 'ct-2']);
    });
  });

  describe('memoization behavior', () => {
    it('validateEntries changes when entryState reference changes (dependency tracking)', () => {
      const detail = createMockDetail();
      const entryState1: Record<string, TEntryState> = {};
      const entryState2: Record<string, TEntryState> = {
        'param-1:ch-1:VALUE': { valueType: 'NUMBER', numericValue: 10 },
      };
      const parametersByCategory = new Map<string, TParameter[]>();
      const machinesForCategory = vi
        .fn()
        .mockReturnValue({ machines: [], label: '' });

      const { result, rerender } = renderHook(
        ({ entryState }) =>
          useLogSheetValidation({
            detail,
            entryState,
            activeChillerIds: ['ch-1'],
            activeCTIds: ['ct-1'],
            parametersByCategory,
            machinesForCategory,
          }),
        { initialProps: { entryState: entryState1 } }
      );

      const firstRef = result.current.validateEntries;
      rerender({ entryState: entryState2 });
      const secondRef = result.current.validateEntries;

      expect(firstRef).not.toBe(secondRef);
    });

    it('validateEntries changes when activeChillerIds changes (dependency tracking)', () => {
      const detail = createMockDetail();
      const entryState: Record<string, TEntryState> = {};
      const parametersByCategory = new Map<string, TParameter[]>();
      const machinesForCategory = vi
        .fn()
        .mockReturnValue({ machines: [], label: '' });

      const { result, rerender } = renderHook(
        ({ activeChillerIds }) =>
          useLogSheetValidation({
            detail,
            entryState,
            activeChillerIds,
            activeCTIds: ['ct-1'],
            parametersByCategory,
            machinesForCategory,
          }),
        { initialProps: { activeChillerIds: ['ch-1'] } }
      );

      const firstRef = result.current.validateEntries;
      rerender({ activeChillerIds: ['ch-1', 'ch-2'] });
      const secondRef = result.current.validateEntries;

      expect(firstRef).not.toBe(secondRef);
    });

    it('validateEntries changes when activeCTIds changes (dependency tracking)', () => {
      const detail = createMockDetail();
      const entryState: Record<string, TEntryState> = {};
      const parametersByCategory = new Map<string, TParameter[]>();
      const machinesForCategory = vi
        .fn()
        .mockReturnValue({ machines: [], label: '' });

      const { result, rerender } = renderHook(
        ({ activeCTIds }) =>
          useLogSheetValidation({
            detail,
            entryState,
            activeChillerIds: ['ch-1'],
            activeCTIds,
            parametersByCategory,
            machinesForCategory,
          }),
        { initialProps: { activeCTIds: ['ct-1'] } }
      );

      const firstRef = result.current.validateEntries;
      rerender({ activeCTIds: ['ct-1', 'ct-2'] });
      const secondRef = result.current.validateEntries;

      expect(firstRef).not.toBe(secondRef);
    });

    it('machinesForCategory is in dependency array (surprising behavior: callback in deps)', () => {
      const detail = createMockDetail();
      const entryState: Record<string, TEntryState> = {};
      const parametersByCategory = new Map<string, TParameter[]>();
      const machinesForCategory1 = vi
        .fn()
        .mockReturnValue({ machines: [], label: '' });
      const machinesForCategory2 = vi
        .fn()
        .mockReturnValue({ machines: [], label: '' });

      const { result, rerender } = renderHook(
        ({ machinesForCategory }) =>
          useLogSheetValidation({
            detail,
            entryState,
            activeChillerIds: ['ch-1'],
            activeCTIds: ['ct-1'],
            parametersByCategory,
            machinesForCategory,
          }),
        { initialProps: { machinesForCategory: machinesForCategory1 } }
      );

      const firstRef = result.current.validateEntries;
      rerender({ machinesForCategory: machinesForCategory2 });
      const secondRef = result.current.validateEntries;

      expect(firstRef).not.toBe(secondRef);
    });
  });
});
