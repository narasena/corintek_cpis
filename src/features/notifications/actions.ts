'use server';

import { revalidatePath } from 'next/cache';
import { notificationService } from './service';
import { actionFactory } from '@/lib/action-factory';
import { RbacResource } from '@/lib/rbac';
import { z } from 'zod/v4';

/**
 * Server Action: Get user notifications with pagination
 */
export const getNotificationsAction = actionFactory.protected(
  async ({ input, actor }) => {
    return notificationService.listUserNotifications({
      userId: actor.id,
      page: input.page,
      pageSize: input.pageSize,
    });
  },
  {
    schema: z.object({
      page: z.number().int().positive().default(1),
      pageSize: z.number().int().positive().default(5),
    }),
    metadata: { rbac: { resource: RbacResource.PUBLIC, capability: 'read' } },
  }
);

/**
 * Server Action: Get unread notification count
 */
export const getUnreadCountAction = actionFactory.protected(
  async ({ actor }) => {
    const result = await notificationService.getUserUnreadCount({
      userId: actor.id,
    });
    return result.unreadCount;
  },
  {
    metadata: { rbac: { resource: RbacResource.PUBLIC, capability: 'read' } },
  }
);

/**
 * Server Action: Mark a single notification as read
 */
export const markNotificationReadAction = actionFactory.protected(
  async ({ input, actor }) => {
    await notificationService.markNotificationAsRead({
      userId: actor.id,
      notificationId: input,
    });

    revalidatePath('/(main)', 'layout');
    return { success: true };
  },
  {
    schema: z.string().min(1, 'ID notifikasi wajib diisi'),
    metadata: { rbac: { resource: RbacResource.PUBLIC, capability: 'update' } },
  }
);

/**
 * Server Action: Mark all notifications as read
 */
export const markAllNotificationsReadAction = actionFactory.protected(
  async ({ actor }) => {
    await notificationService.markAllNotificationsAsRead({
      userId: actor.id,
    });

    revalidatePath('/(main)', 'layout');
    return { success: true };
  },
  {
    metadata: { rbac: { resource: RbacResource.PUBLIC, capability: 'update' } },
  }
);
