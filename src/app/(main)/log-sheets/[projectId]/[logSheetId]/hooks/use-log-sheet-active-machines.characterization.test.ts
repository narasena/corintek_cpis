/** @vitest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import type { TransitionStartFunction } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TDetail } from '../types';
import { useLogSheetActiveMachines } from './use-log-sheet-active-machines';

const mockSaveLogSheetMachinesAction = vi.fn();

vi.mock('@/features/log-sheets/actions', () => ({
  saveLogSheetMachinesAction: (...args: unknown[]) =>
    mockSaveLogSheetMachinesAction(...args),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
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
      chillers: [
        { id: 'ch-1', unitNumber: 1, type: 'CHILLER' },
        { id: 'ch-2', unitNumber: 2, type: 'CHILLER' },
      ],
      coolingTowers: [
        { id: 'ct-1', unitNumber: 1, type: 'COOLING_TOWER' },
        { id: 'ct-2', unitNumber: 2, type: 'COOLING_TOWER' },
      ],
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

function createMockStartTransition() {
  const pendingCallbacks: Array<() => void> = [];
  const startTransition = ((callback: () => void) => {
    pendingCallbacks.push(callback);
  }) as TransitionStartFunction;
  const flushTransitions = async () => {
    while (pendingCallbacks.length > 0) {
      const cb = pendingCallbacks.shift();
      if (cb) await cb();
    }
  };
  return { startTransition, flushTransitions };
}

describe('useLogSheetActiveMachines (characterization)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSaveLogSheetMachinesAction.mockResolvedValue({ success: true });
  });

  describe('handleToggleMachine', () => {
    it('adds chiller to active list when toggling on (main path)', async () => {
      const detail = createMockDetail();
      const { startTransition, flushTransitions } = createMockStartTransition();
      const setActiveChillerIds = vi.fn();
      const setActiveCTIds = vi.fn();

      const { result } = renderHook(() =>
        useLogSheetActiveMachines({
          detail,
          logSheetId: 'ls-1',
          activeChillerIds: ['ch-1'],
          setActiveChillerIds,
          activeCTIds: ['ct-1'],
          setActiveCTIds,
          startTransition,
        })
      );

      act(() => {
        result.current.handleToggleMachine('ch-2', 'CHILLER');
      });

      await flushTransitions();

      expect(setActiveChillerIds).toHaveBeenCalledWith(['ch-1', 'ch-2']);
    });

    it('removes chiller from active list when toggling off (main path)', async () => {
      const detail = createMockDetail();
      const { startTransition, flushTransitions } = createMockStartTransition();
      const setActiveChillerIds = vi.fn();
      const setActiveCTIds = vi.fn();

      const { result } = renderHook(() =>
        useLogSheetActiveMachines({
          detail,
          logSheetId: 'ls-1',
          activeChillerIds: ['ch-1', 'ch-2'],
          setActiveChillerIds,
          activeCTIds: ['ct-1'],
          setActiveCTIds,
          startTransition,
        })
      );

      act(() => {
        result.current.handleToggleMachine('ch-1', 'CHILLER');
      });

      await flushTransitions();

      expect(setActiveChillerIds).toHaveBeenCalledWith(['ch-2']);
    });

    it('adds cooling tower to active list when toggling on (main path)', async () => {
      const detail = createMockDetail();
      const { startTransition, flushTransitions } = createMockStartTransition();
      const setActiveChillerIds = vi.fn();
      const setActiveCTIds = vi.fn();

      const { result } = renderHook(() =>
        useLogSheetActiveMachines({
          detail,
          logSheetId: 'ls-1',
          activeChillerIds: ['ch-1'],
          setActiveChillerIds,
          activeCTIds: ['ct-1'],
          setActiveCTIds,
          startTransition,
        })
      );

      act(() => {
        result.current.handleToggleMachine('ct-2', 'COOLING_TOWER');
      });

      await flushTransitions();

      expect(setActiveCTIds).toHaveBeenCalledWith(['ct-1', 'ct-2']);
    });

    it('removes cooling tower from active list when toggling off (main path)', async () => {
      const detail = createMockDetail();
      const { startTransition, flushTransitions } = createMockStartTransition();
      const setActiveChillerIds = vi.fn();
      const setActiveCTIds = vi.fn();

      const { result } = renderHook(() =>
        useLogSheetActiveMachines({
          detail,
          logSheetId: 'ls-1',
          activeChillerIds: ['ch-1'],
          setActiveChillerIds,
          activeCTIds: ['ct-1', 'ct-2'],
          setActiveCTIds,
          startTransition,
        })
      );

      act(() => {
        result.current.handleToggleMachine('ct-1', 'COOLING_TOWER');
      });

      await flushTransitions();

      expect(setActiveCTIds).toHaveBeenCalledWith(['ct-2']);
    });

    it('calls saveLogSheetMachinesAction with combined machine IDs for chiller toggle (main path)', async () => {
      const detail = createMockDetail();
      const { startTransition, flushTransitions } = createMockStartTransition();
      const setActiveChillerIds = vi.fn();
      const setActiveCTIds = vi.fn();

      const { result } = renderHook(() =>
        useLogSheetActiveMachines({
          detail,
          logSheetId: 'ls-1',
          activeChillerIds: ['ch-1'],
          setActiveChillerIds,
          activeCTIds: ['ct-1'],
          setActiveCTIds,
          startTransition,
        })
      );

      act(() => {
        result.current.handleToggleMachine('ch-2', 'CHILLER');
      });

      await flushTransitions();

      expect(mockSaveLogSheetMachinesAction).toHaveBeenCalledWith({
        logSheetId: 'ls-1',
        machineIds: ['ch-1', 'ch-2', 'ct-1'],
        adminOverride: undefined,
      });
    });

    it('reverts state on save failure (error condition)', async () => {
      mockSaveLogSheetMachinesAction.mockResolvedValueOnce({
        success: false,
        error: 'Failed to save',
      });

      const detail = createMockDetail();
      const { startTransition, flushTransitions } = createMockStartTransition();
      const setActiveChillerIds = vi.fn();
      const setActiveCTIds = vi.fn();

      const { result } = renderHook(() =>
        useLogSheetActiveMachines({
          detail,
          logSheetId: 'ls-1',
          activeChillerIds: ['ch-1'],
          setActiveChillerIds,
          activeCTIds: ['ct-1'],
          setActiveCTIds,
          startTransition,
        })
      );

      act(() => {
        result.current.handleToggleMachine('ch-2', 'CHILLER');
      });

      await flushTransitions();

      expect(setActiveChillerIds).toHaveBeenCalledTimes(2);
      expect(setActiveChillerIds).toHaveBeenLastCalledWith(['ch-1']);
    });
  });

  describe('handleSelectAllMachines', () => {
    it('selects all chillers when called with CHILLER type (main path)', async () => {
      const detail = createMockDetail();
      const { startTransition, flushTransitions } = createMockStartTransition();
      const setActiveChillerIds = vi.fn();
      const setActiveCTIds = vi.fn();

      const { result } = renderHook(() =>
        useLogSheetActiveMachines({
          detail,
          logSheetId: 'ls-1',
          activeChillerIds: [],
          setActiveChillerIds,
          activeCTIds: ['ct-1'],
          setActiveCTIds,
          startTransition,
        })
      );

      act(() => {
        result.current.handleSelectAllMachines('CHILLER');
      });

      await flushTransitions();

      expect(setActiveChillerIds).toHaveBeenCalledWith(['ch-1', 'ch-2']);
    });

    it('selects all cooling towers when called with COOLING_TOWER type (main path)', async () => {
      const detail = createMockDetail();
      const { startTransition, flushTransitions } = createMockStartTransition();
      const setActiveChillerIds = vi.fn();
      const setActiveCTIds = vi.fn();

      const { result } = renderHook(() =>
        useLogSheetActiveMachines({
          detail,
          logSheetId: 'ls-1',
          activeChillerIds: ['ch-1'],
          setActiveChillerIds,
          activeCTIds: [],
          setActiveCTIds,
          startTransition,
        })
      );

      act(() => {
        result.current.handleSelectAllMachines('COOLING_TOWER');
      });

      await flushTransitions();

      expect(setActiveCTIds).toHaveBeenCalledWith(['ct-1', 'ct-2']);
    });

    it('does nothing when detail is null (edge case)', async () => {
      const { startTransition, flushTransitions } = createMockStartTransition();
      const setActiveChillerIds = vi.fn();
      const setActiveCTIds = vi.fn();

      const { result } = renderHook(() =>
        useLogSheetActiveMachines({
          detail: null,
          logSheetId: 'ls-1',
          activeChillerIds: [],
          setActiveChillerIds,
          activeCTIds: [],
          setActiveCTIds,
          startTransition,
        })
      );

      act(() => {
        result.current.handleSelectAllMachines('CHILLER');
      });

      await flushTransitions();

      expect(setActiveChillerIds).not.toHaveBeenCalled();
    });

    it('passes adminOverride to save action when set (main path)', async () => {
      const detail = createMockDetail();
      const { startTransition, flushTransitions } = createMockStartTransition();
      const setActiveChillerIds = vi.fn();
      const setActiveCTIds = vi.fn();

      const { result } = renderHook(() =>
        useLogSheetActiveMachines({
          detail,
          logSheetId: 'ls-1',
          activeChillerIds: [],
          setActiveChillerIds,
          activeCTIds: ['ct-1'],
          setActiveCTIds,
          startTransition,
          allowAdminOverride: true,
        })
      );

      act(() => {
        result.current.handleSelectAllMachines('CHILLER');
      });

      await flushTransitions();

      expect(mockSaveLogSheetMachinesAction).toHaveBeenCalledWith(
        expect.objectContaining({
          adminOverride: true,
        })
      );
    });
  });

  describe('handleClearMachines', () => {
    it('clears all chillers when called with CHILLER type (main path)', async () => {
      const detail = createMockDetail();
      const { startTransition, flushTransitions } = createMockStartTransition();
      const setActiveChillerIds = vi.fn();
      const setActiveCTIds = vi.fn();

      const { result } = renderHook(() =>
        useLogSheetActiveMachines({
          detail,
          logSheetId: 'ls-1',
          activeChillerIds: ['ch-1', 'ch-2'],
          setActiveChillerIds,
          activeCTIds: ['ct-1'],
          setActiveCTIds,
          startTransition,
        })
      );

      act(() => {
        result.current.handleClearMachines('CHILLER');
      });

      await flushTransitions();

      expect(setActiveChillerIds).toHaveBeenCalledWith([]);
    });

    it('clears all cooling towers when called with COOLING_TOWER type (main path)', async () => {
      const detail = createMockDetail();
      const { startTransition, flushTransitions } = createMockStartTransition();
      const setActiveChillerIds = vi.fn();
      const setActiveCTIds = vi.fn();

      const { result } = renderHook(() =>
        useLogSheetActiveMachines({
          detail,
          logSheetId: 'ls-1',
          activeChillerIds: ['ch-1'],
          setActiveChillerIds,
          activeCTIds: ['ct-1', 'ct-2'],
          setActiveCTIds,
          startTransition,
        })
      );

      act(() => {
        result.current.handleClearMachines('COOLING_TOWER');
      });

      await flushTransitions();

      expect(setActiveCTIds).toHaveBeenCalledWith([]);
    });

    it('preserves other machine type when clearing (main path)', async () => {
      const detail = createMockDetail();
      const { startTransition, flushTransitions } = createMockStartTransition();
      const setActiveChillerIds = vi.fn();
      const setActiveCTIds = vi.fn();

      const { result } = renderHook(() =>
        useLogSheetActiveMachines({
          detail,
          logSheetId: 'ls-1',
          activeChillerIds: ['ch-1'],
          setActiveChillerIds,
          activeCTIds: ['ct-1', 'ct-2'],
          setActiveCTIds,
          startTransition,
        })
      );

      act(() => {
        result.current.handleClearMachines('CHILLER');
      });

      await flushTransitions();

      expect(mockSaveLogSheetMachinesAction).toHaveBeenCalledWith(
        expect.objectContaining({
          machineIds: ['ct-1', 'ct-2'],
        })
      );
    });
  });

  describe('return value structure', () => {
    it('returns handleToggleMachine, handleSelectAllMachines, and handleClearMachines', () => {
      const detail = createMockDetail();
      const { startTransition } = createMockStartTransition();

      const { result } = renderHook(() =>
        useLogSheetActiveMachines({
          detail,
          logSheetId: 'ls-1',
          activeChillerIds: [],
          setActiveChillerIds: vi.fn(),
          activeCTIds: [],
          setActiveCTIds: vi.fn(),
          startTransition,
        })
      );

      expect(typeof result.current.handleToggleMachine).toBe('function');
      expect(typeof result.current.handleSelectAllMachines).toBe('function');
      expect(typeof result.current.handleClearMachines).toBe('function');
    });
  });
});
