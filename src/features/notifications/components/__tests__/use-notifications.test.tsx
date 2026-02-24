/**
 * @vitest-environment jsdom
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useNotifications } from '../use-notifications';
import * as actions from '../../actions';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('../../actions', () => ({
  getNotificationsAction: vi.fn(),
  getUnreadCountAction: vi.fn(),
  markNotificationReadAction: vi.fn(),
  markAllNotificationsReadAction: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useNotifications', () => {
  const mockNotifications = [
    {
      id: '1',
      title: 'Test',
      message: 'Test msg',
      isRead: false,
      createdAt: new Date().toISOString(),
      type: 'limit_breach',
      userId: 'user-1',
      metadata: {},
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fetches notifications and unread count on mount', async () => {
    vi.mocked(actions.getNotificationsAction).mockResolvedValue({
      items: mockNotifications,
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });
    vi.mocked(actions.getUnreadCountAction).mockResolvedValue(5);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.notifications).toEqual(mockNotifications);
      expect(result.current.unreadCount).toBe(5);
    });
  });

  it('handles fetch errors gracefully (silent failure)', async () => {
    vi.mocked(actions.getNotificationsAction).mockRejectedValue(new Error('Network error'));
    
    const { result } = renderHook(() => useNotifications());

    // Should not throw and maintain initial state
    await waitFor(() => {
      expect(actions.getNotificationsAction).toHaveBeenCalled();
    });
    
    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
    // Ensure no toast error for background fetch
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('polls for updates every 60 seconds', async () => {
    vi.useFakeTimers();
    vi.mocked(actions.getNotificationsAction).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
    });
    vi.mocked(actions.getUnreadCountAction).mockResolvedValue(0);

    renderHook(() => useNotifications());

    // Initial fetch
    expect(actions.getNotificationsAction).toHaveBeenCalledTimes(1);

    // Advance time to trigger interval
    await act(async () => {
      vi.advanceTimersByTime(60000);
    });
    
    // Check if called again
    expect(actions.getNotificationsAction).toHaveBeenCalledTimes(2);
  });

  it('marks a notification as read and refreshes', async () => {
    vi.mocked(actions.getNotificationsAction).mockResolvedValue({
      items: mockNotifications,
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });
    vi.mocked(actions.markNotificationReadAction).mockResolvedValue(undefined);

    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await result.current.markRead('1');
    });

    expect(actions.markNotificationReadAction).toHaveBeenCalledWith('1');
    // Should refresh data
    expect(actions.getNotificationsAction).toHaveBeenCalledTimes(2);
  });

  it('handles mark as read error', async () => {
    vi.mocked(actions.markNotificationReadAction).mockRejectedValue(new Error('Failed'));

    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await result.current.markRead('1');
    });

    expect(toast.error).toHaveBeenCalledWith('Gagal menandai notifikasi sudah dibaca');
  });

  it('marks all notifications as read and refreshes', async () => {
    vi.mocked(actions.markAllNotificationsReadAction).mockResolvedValue(undefined);

    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await result.current.markAllRead();
    });

    expect(actions.markAllNotificationsReadAction).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Semua notifikasi ditandai sudah dibaca');
    // Should refresh data
    expect(actions.getNotificationsAction).toHaveBeenCalledTimes(2);
  });

  it('handles mark all read error', async () => {
    vi.mocked(actions.markAllNotificationsReadAction).mockRejectedValue(new Error('Failed'));

    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await result.current.markAllRead();
    });

    expect(toast.error).toHaveBeenCalledWith('Gagal menandai semua notifikasi sudah dibaca');
  });
});
