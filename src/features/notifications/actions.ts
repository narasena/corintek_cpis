'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUserDetails } from '@/lib/auth-helpers';
import { notificationService } from './service';
import type { TListNotificationsResult } from './types';

export async function getNotificationsAction(
  page = 1,
  pageSize = 5
): Promise<TListNotificationsResult> {
  const user = await getCurrentUserDetails();
  if (!user) throw new Error('Unauthorized');

  try {
    const result = await notificationService.listUserNotifications({
      userId: user.id,
      page,
      pageSize,
    });
    return result;
  } catch (error) {
    console.error('[DEBUG] getNotificationsAction error:', error);
    throw error;
  }
}

export async function getUnreadCountAction(): Promise<number> {
  const user = await getCurrentUserDetails();
  if (!user) return 0;

  const result = await notificationService.getUserUnreadCount({
    userId: user.id,
  });
  return result.unreadCount;
}

export async function markNotificationReadAction(notificationId: string) {
  const user = await getCurrentUserDetails();
  if (!user) throw new Error('Unauthorized');

  await notificationService.markNotificationAsRead({
    userId: user.id,
    notificationId,
  });

  revalidatePath('/(main)', 'layout');
}

export async function markAllNotificationsReadAction() {
  const user = await getCurrentUserDetails();
  if (!user) throw new Error('Unauthorized');

  await notificationService.markAllNotificationsAsRead({
    userId: user.id,
  });

  revalidatePath('/(main)', 'layout');
}
