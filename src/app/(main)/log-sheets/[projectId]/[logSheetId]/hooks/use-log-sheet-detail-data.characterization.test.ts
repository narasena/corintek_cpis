/** @vitest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { TDetail } from '../types';
import { useLogSheetDetailData } from './use-log-sheet-detail-data';

const mockGetLogSheetDetailAction = vi.fn();

vi.mock('@/features/log-sheets/actions', () => ({
  getLogSheetDetailAction: (...args: unknown[]) =>
    mockGetLogSheetDetailAction(...args),
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
      chillers: [],
      coolingTowers: [],
    },
    parameters: [],
    entries: [],
    photos: [],
    chemicalUsages: [],
    activeMachineIds: {
      chillers: [],
      coolingTowers: [],
    },
    ...overrides,
  };
}

describe('useLogSheetDetailData (characterization)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('starts with null detail and loading true (main path)', () => {
      mockGetLogSheetDetailAction.mockImplementation(
        () => new Promise(() => {})
      );

      const { result } = renderHook(() => useLogSheetDetailData('ls-1'));

      expect(result.current.detail).toBeNull();
      expect(result.current.loading).toBe(true);
    });
  });

  describe('data fetching', () => {
    it('calls getLogSheetDetailAction with logSheetId on mount (main path)', async () => {
      const mockDetail = createMockDetail();
      mockGetLogSheetDetailAction.mockResolvedValueOnce({
        success: true,
        data: mockDetail,
      });

      renderHook(() => useLogSheetDetailData('ls-1'));

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(mockGetLogSheetDetailAction).toHaveBeenCalledWith('ls-1');
    });

    it('sets detail when fetch succeeds (main path)', async () => {
      const mockDetail = createMockDetail();
      mockGetLogSheetDetailAction.mockResolvedValueOnce({
        success: true,
        data: mockDetail,
      });

      const { result } = renderHook(() => useLogSheetDetailData('ls-1'));

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.detail).toEqual(mockDetail);
      expect(result.current.loading).toBe(false);
    });

    it('sets loading to false after fetch completes (main path)', async () => {
      const mockDetail = createMockDetail();
      mockGetLogSheetDetailAction.mockResolvedValueOnce({
        success: true,
        data: mockDetail,
      });

      const { result } = renderHook(() => useLogSheetDetailData('ls-1'));

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('error handling', () => {
    it('shows error toast when action returns success: false (error condition)', async () => {
      const { toast } = await import('sonner');
      mockGetLogSheetDetailAction.mockResolvedValueOnce({
        success: false,
        error: 'Not found',
      });

      renderHook(() => useLogSheetDetailData('ls-1'));

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(toast.error).toHaveBeenCalledWith(
        'Gagal mengambil detail log sheet',
        {
          description: 'Not found',
        }
      );
    });

    it('keeps detail as null when action fails (error condition)', async () => {
      mockGetLogSheetDetailAction.mockResolvedValueOnce({
        success: false,
        error: 'Not found',
      });

      const { result } = renderHook(() => useLogSheetDetailData('ls-1'));

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.detail).toBeNull();
    });

    it('shows error toast when action throws (error condition)', async () => {
      const { toast } = await import('sonner');
      mockGetLogSheetDetailAction.mockRejectedValueOnce(
        new Error('Network error')
      );

      renderHook(() => useLogSheetDetailData('ls-1'));

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(toast.error).toHaveBeenCalledWith(
        'Terjadi kesalahan saat memuat data'
      );
    });

    it('sets loading to false even when action fails (error condition)', async () => {
      mockGetLogSheetDetailAction.mockRejectedValueOnce(
        new Error('Network error')
      );

      const { result } = renderHook(() => useLogSheetDetailData('ls-1'));

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.loading).toBe(false);
    });

    it('handles action returning null data (edge case)', async () => {
      mockGetLogSheetDetailAction.mockResolvedValueOnce({
        success: true,
        data: null,
      });

      const { result } = renderHook(() => useLogSheetDetailData('ls-1'));

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.detail).toBeNull();
    });

    it('handles action returning undefined data (edge case)', async () => {
      mockGetLogSheetDetailAction.mockResolvedValueOnce({
        success: true,
        data: undefined,
      });

      const { result } = renderHook(() => useLogSheetDetailData('ls-1'));

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.detail).toBeNull();
    });
  });

  describe('reload function', () => {
    it('exposes reload function (main path)', () => {
      mockGetLogSheetDetailAction.mockImplementation(
        () => new Promise(() => {})
      );

      const { result } = renderHook(() => useLogSheetDetailData('ls-1'));

      expect(typeof result.current.reload).toBe('function');
    });

    it('sets loading to true when reload is called (main path)', async () => {
      const mockDetail = createMockDetail();
      mockGetLogSheetDetailAction.mockResolvedValueOnce({
        success: true,
        data: mockDetail,
      });

      const { result } = renderHook(() => useLogSheetDetailData('ls-1'));

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.loading).toBe(false);

      mockGetLogSheetDetailAction.mockResolvedValueOnce({
        success: true,
        data: mockDetail,
      });

      await act(async () => {
        result.current.reload();
        await vi.runAllTimersAsync();
      });

      expect(result.current.loading).toBe(false);
    });

    it('fetches new data on reload (main path)', async () => {
      const mockDetail1 = createMockDetail({
        logSheet: { ...createMockDetail().logSheet, notes: 'First' },
      });
      const mockDetail2 = createMockDetail({
        logSheet: { ...createMockDetail().logSheet, notes: 'Second' },
      });

      mockGetLogSheetDetailAction.mockResolvedValueOnce({
        success: true,
        data: mockDetail1,
      });

      const { result } = renderHook(() => useLogSheetDetailData('ls-1'));

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.detail).toEqual(mockDetail1);

      mockGetLogSheetDetailAction.mockResolvedValueOnce({
        success: true,
        data: mockDetail2,
      });

      await act(async () => {
        await result.current.reload();
        await vi.runAllTimersAsync();
      });

      expect(result.current.detail).toEqual(mockDetail2);
    });

    it('calls action with same logSheetId on reload (main path)', async () => {
      const mockDetail = createMockDetail();
      mockGetLogSheetDetailAction.mockResolvedValue({
        success: true,
        data: mockDetail,
      });

      const { result } = renderHook(() => useLogSheetDetailData('ls-1'));

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(mockGetLogSheetDetailAction).toHaveBeenCalledTimes(1);

      await act(async () => {
        await result.current.reload();
        await vi.runAllTimersAsync();
      });

      expect(mockGetLogSheetDetailAction).toHaveBeenCalledTimes(2);
      expect(mockGetLogSheetDetailAction).toHaveBeenLastCalledWith('ls-1');
    });
  });

  describe('logSheetId changes', () => {
    it('refetches when logSheetId changes (main path)', async () => {
      const mockDetail = createMockDetail();
      mockGetLogSheetDetailAction.mockResolvedValue({
        success: true,
        data: mockDetail,
      });

      const { result, rerender } = renderHook(
        ({ logSheetId }) => useLogSheetDetailData(logSheetId),
        { initialProps: { logSheetId: 'ls-1' } }
      );

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(mockGetLogSheetDetailAction).toHaveBeenCalledWith('ls-1');

      rerender({ logSheetId: 'ls-2' });

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(mockGetLogSheetDetailAction).toHaveBeenCalledWith('ls-2');
    });
  });

  describe('return value structure', () => {
    it('returns detail, loading, and reload', async () => {
      const mockDetail = createMockDetail();
      mockGetLogSheetDetailAction.mockResolvedValueOnce({
        success: true,
        data: mockDetail,
      });

      const { result } = renderHook(() => useLogSheetDetailData('ls-1'));

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current).toHaveProperty('detail');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('reload');
    });
  });
});
