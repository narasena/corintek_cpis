/** @vitest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { TUserResponse } from '@/@types/user.type';
import { useLogSheetTechnicians } from './use-log-sheet-technicians';

const mockGetAllUsersAction = vi.fn();

vi.mock('@/features/users/actions', () => ({
  getAllUsersAction: (...args: unknown[]) => mockGetAllUsersAction(...args),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

function createMockUser(overrides?: Partial<TUserResponse>): TUserResponse {
  return {
    id: 'user-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: 'TECHNICIAN',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  } as TUserResponse;
}

describe('useLogSheetTechnicians (characterization)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('starts with empty technicians array (main path)', () => {
      mockGetAllUsersAction.mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useLogSheetTechnicians());

      expect(result.current.technicians).toEqual([]);
    });
  });

  describe('data fetching', () => {
    it('calls getAllUsersAction on mount (main path)', async () => {
      mockGetAllUsersAction.mockResolvedValueOnce({
        success: true,
        data: [],
      });

      renderHook(() => useLogSheetTechnicians());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(mockGetAllUsersAction).toHaveBeenCalledTimes(1);
    });

    it('sets technicians when fetch succeeds (main path)', async () => {
      const mockUsers = [
        createMockUser({ id: 'user-1', firstName: 'John' }),
        createMockUser({ id: 'user-2', firstName: 'Jane' }),
      ];
      mockGetAllUsersAction.mockResolvedValueOnce({
        success: true,
        data: mockUsers,
      });

      const { result } = renderHook(() => useLogSheetTechnicians());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.technicians).toEqual(mockUsers);
    });

    it('sets technicians to empty array when data is null (edge case)', async () => {
      mockGetAllUsersAction.mockResolvedValueOnce({
        success: true,
        data: null,
      });

      const { result } = renderHook(() => useLogSheetTechnicians());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.technicians).toEqual([]);
    });

    it('sets technicians to empty array when data is undefined (edge case)', async () => {
      mockGetAllUsersAction.mockResolvedValueOnce({
        success: true,
        data: undefined,
      });

      const { result } = renderHook(() => useLogSheetTechnicians());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.technicians).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('shows error toast when action returns success: false (error condition)', async () => {
      const { toast } = await import('sonner');
      mockGetAllUsersAction.mockResolvedValueOnce({
        success: false,
        error: 'Failed to fetch',
      });

      renderHook(() => useLogSheetTechnicians());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(toast.error).toHaveBeenCalledWith('Gagal memuat daftar teknisi');
    });

    it('keeps technicians as empty array on error (error condition)', async () => {
      mockGetAllUsersAction.mockResolvedValueOnce({
        success: false,
        error: 'Failed to fetch',
      });

      const { result } = renderHook(() => useLogSheetTechnicians());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.technicians).toEqual([]);
    });

    it('shows error toast when action throws (error condition)', async () => {
      const { toast } = await import('sonner');
      mockGetAllUsersAction.mockRejectedValueOnce(new Error('Network error'));

      renderHook(() => useLogSheetTechnicians());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(toast.error).toHaveBeenCalledWith(
        'Terjadi kesalahan saat memuat teknisi'
      );
    });

    it('keeps technicians as empty array on throw (error condition)', async () => {
      mockGetAllUsersAction.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useLogSheetTechnicians());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.technicians).toEqual([]);
    });
  });

  describe('cleanup', () => {
    it('does not set state if unmounted during fetch (main path)', async () => {
      let resolvePromise: (value: any) => void;
      mockGetAllUsersAction.mockImplementation(
        () =>
          new Promise(resolve => {
            resolvePromise = resolve;
          })
      );

      const { result, unmount } = renderHook(() => useLogSheetTechnicians());

      expect(result.current.technicians).toEqual([]);

      unmount();

      await act(async () => {
        resolvePromise!({ success: true, data: [createMockUser()] });
        await vi.runAllTimersAsync();
      });
    });
  });

  describe('return value structure', () => {
    it('returns technicians array', async () => {
      mockGetAllUsersAction.mockResolvedValueOnce({
        success: true,
        data: [],
      });

      const { result } = renderHook(() => useLogSheetTechnicians());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current).toHaveProperty('technicians');
      expect(Array.isArray(result.current.technicians)).toBe(true);
    });
  });

  describe('user data structure', () => {
    it('preserves all user properties from action (main path)', async () => {
      const mockUsers = [
        createMockUser({
          id: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          role: 'TECHNICIAN',
        }),
        createMockUser({
          id: 'user-2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          role: 'ADMIN',
        }),
      ];
      mockGetAllUsersAction.mockResolvedValueOnce({
        success: true,
        data: mockUsers,
      });

      const { result } = renderHook(() => useLogSheetTechnicians());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.technicians).toHaveLength(2);
      expect(result.current.technicians[0]).toHaveProperty('id', 'user-1');
      expect(result.current.technicians[0]).toHaveProperty('firstName', 'John');
      expect(result.current.technicians[0]).toHaveProperty('lastName', 'Doe');
      expect(result.current.technicians[0]).toHaveProperty(
        'email',
        'john@example.com'
      );
      expect(result.current.technicians[0]).toHaveProperty(
        'role',
        'TECHNICIAN'
      );
    });

    it('handles users with null lastName (edge case)', async () => {
      const mockUsers = [
        createMockUser({
          id: 'user-1',
          firstName: 'John',
          lastName: null as any,
        }),
      ];
      mockGetAllUsersAction.mockResolvedValueOnce({
        success: true,
        data: mockUsers,
      });

      const { result } = renderHook(() => useLogSheetTechnicians());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.technicians[0].lastName).toBeNull();
    });

    it('handles empty users array (edge case)', async () => {
      mockGetAllUsersAction.mockResolvedValueOnce({
        success: true,
        data: [],
      });

      const { result } = renderHook(() => useLogSheetTechnicians());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.technicians).toEqual([]);
    });
  });
});
