'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  getNotificationsAction,
  getUnreadCountAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from '../actions';
import type { INotification } from '../types';

export function useNotifications() {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetch = useCallback(async () => {
    try {
      const [notifsResult, countResult] = await Promise.all([
        getNotificationsAction({ page: 1, pageSize: 10 }),
        getUnreadCountAction({}),
      ]);

      if (notifsResult.success && notifsResult.data) {
        setNotifications(notifsResult.data.items);
      }
      if (countResult.success && typeof countResult.data === 'number') {
        setUnreadCount(countResult.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, []);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 60000);

    const handleRefresh = () => fetch();
    window.addEventListener('refresh-notifications', handleRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener('refresh-notifications', handleRefresh);
    };
  }, [fetch]);

  const markRead = async (id: string) => {
    // Optimistic update
    const previousNotifications = [...notifications];
    const previousUnreadCount = unreadCount;

    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await markNotificationReadAction(id);
      await fetch(); // Re-fetch to ensure sync
    } catch {
      // Revert on failure
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
      toast.error('Gagal menandai notifikasi sudah dibaca');
    }
  };

  const markAllRead = async () => {
    // Optimistic update
    const previousNotifications = [...notifications];
    const previousUnreadCount = unreadCount;

    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await markAllNotificationsReadAction({});
      await fetch();
      toast.success('Semua notifikasi ditandai sudah dibaca');
    } catch {
      // Revert on failure
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
      toast.error('Gagal menandai semua notifikasi sudah dibaca');
    }
  };

  return {
    notifications,
    unreadCount,
    isOpen,
    setIsOpen,
    markRead,
    markAllRead,
  };
}
