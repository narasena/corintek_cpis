import { prisma } from '@/lib/prisma';
import type {
  Notification as PrismaNotification,
  Prisma,
} from '@/generated/prisma/client';
import type {
  INotification,
  INotificationRepository,
  TListNotificationsInput,
  TListNotificationsResult,
  TNewNotification,
  TUnreadCountInput,
  TMarkNotificationReadInput,
  TMarkAllNotificationsReadInput,
} from './types';

function mapRowToNotification(row: PrismaNotification): INotification {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    message: row.message,
    severity: row.severity,
    source: row.source as unknown as INotification['source'],
    isRead: row.isRead,
    readAt: row.readAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function createPrismaNotificationRepository(): INotificationRepository {
  return {
    async createMany(notifications) {
      if (notifications.length === 0) {
        return [];
      }

      const created = await prisma.$transaction(async tx => {
        const rows: PrismaNotification[] = [];

        for (const notification of notifications) {
          const row = await tx.notification.create({
            data: {
              userId: notification.userId,
              title: notification.title,
              message: notification.message,
              severity: notification.severity,
              source: JSON.parse(JSON.stringify(notification.source)),
            },
          });
          rows.push(row);
        }

        return rows;
      });

      return created.map(mapRowToNotification);
    },

    async findByUser(
      input: TListNotificationsInput
    ): Promise<TListNotificationsResult> {
      const page = input.page && input.page > 0 ? input.page : 1;
      const pageSize =
        input.pageSize && input.pageSize > 0 ? input.pageSize : 10;
      const where: Prisma.NotificationWhereInput = {
        userId: input.userId,
      };

      if (input.onlyUnread) {
        where.isRead = false;
      }

      const [items, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.notification.count({ where }),
      ]);

      return {
        items: items.map(mapRowToNotification),
        total,
        page,
        pageSize,
      };
    },

    async countUnreadByUser(input: TUnreadCountInput): Promise<number> {
      return prisma.notification.count({
        where: {
          userId: input.userId,
          isRead: false,
        },
      });
    },

    async findById(notificationId: string): Promise<INotification | null> {
      const row = await prisma.notification.findUnique({
        where: { id: notificationId },
      });

      if (!row) {
        return null;
      }

      return mapRowToNotification(row);
    },

    async markAsRead(
      input: TMarkNotificationReadInput
    ): Promise<INotification> {
      const existing = await prisma.notification.findUnique({
        where: { id: input.notificationId },
      });

      if (!existing) {
        throw new Error('NOTIFICATION_NOT_FOUND');
      }

      if (existing.userId !== input.userId) {
        throw new Error('NOTIFICATION_ACCESS_DENIED');
      }

      if (existing.isRead && existing.readAt) {
        return mapRowToNotification(existing);
      }

      const updated = await prisma.notification.update({
        where: { id: input.notificationId },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return mapRowToNotification(updated);
    },

    async markAllAsRead(
      input: TMarkAllNotificationsReadInput
    ): Promise<number> {
      const result = await prisma.notification.updateMany({
        where: {
          userId: input.userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return result.count;
    },
  };
}
