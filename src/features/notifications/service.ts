import type {
  ILimitBreachDetector,
  INotification,
  INotificationRepository,
  INotificationService,
  NotificationError,
  TLimitBreach,
  TLimitBreachDirection,
  TLimitEvaluationEntrySnapshot,
  TLimitEvaluationInput,
  TListNotificationsInput,
  TListNotificationsResult,
  TMarkAllNotificationsReadInput,
  TMarkAllNotificationsReadResult,
  TMarkNotificationReadInput,
  TMarkNotificationReadResult,
  TNewNotification,
  TNotificationErrorCode,
  TNotificationSeverity,
  TNotificationSource,
  TUnreadCountInput,
  TUnreadCountResult,
  TEvaluateLimitBreachesInput,
  TEvaluateLimitBreachesResult,
} from './types';
import { NotificationError as NotificationErrorClass } from './types';
import { createPrismaNotificationRepository } from './notification-repository-prisma';

function createNotificationError(params: {
  message: string;
  code: TNotificationErrorCode;
  userId?: string;
  notificationId?: string;
  details?: Record<string, unknown>;
}): NotificationError {
  return new NotificationErrorClass(params);
}

class LimitBreachDetector implements ILimitBreachDetector {
  detectBreaches(input: TLimitEvaluationInput): TLimitBreach[] {
    const breaches: TLimitBreach[] = [];

    for (const entry of input.entries) {
      const value = entry.value;
      if (value === null || !Number.isFinite(value)) {
        continue;
      }

      const min = entry.minLimit;
      const max = entry.maxLimit;

      let direction: TLimitBreachDirection | null = null;

      if (min !== null && min !== undefined && value < min) {
        direction = 'BELOW_MIN';
      } else if (max !== null && max !== undefined && value > max) {
        direction = 'ABOVE_MAX';
      }

      if (!direction) {
        continue;
      }

      const severity: TNotificationSeverity = 'WARNING';

      breaches.push({
        entry,
        breachDirection: direction,
        severity,
      });
    }

    return breaches;
  }
}

function buildLimitBreachNotifications(params: {
  breaches: TLimitBreach[];
  technicianUserIds: string[];
}): TNewNotification[] {
  const notifications: TNewNotification[] = [];

  for (const breach of params.breaches) {
    for (const userId of params.technicianUserIds) {
      const { entry, severity, breachDirection } = breach;
      const source: TNotificationSource = {
        type: 'LOG_SHEET_LIMIT_BREACH',
        logSheetId: entry.logSheetId,
        projectId: entry.projectId,
        parameterId: entry.parameterId,
        parameterName: entry.parameterName,
        value: entry.value as number,
        minLimit: entry.minLimit,
        maxLimit: entry.maxLimit,
        breachDirection,
      };

      const isAbove = breachDirection === 'ABOVE_MAX';
      const limit =
        breachDirection === 'ABOVE_MAX' ? entry.maxLimit : entry.minLimit;

      const title = 'Peringatan batas parameter log sheet';

      const messageParts = [];
      messageParts.push(
        `Parameter ${entry.parameterName} bernilai ${entry.value}`
      );
      if (limit !== null && limit !== undefined) {
        messageParts.push(
          isAbove ? `di atas batas ${limit}` : `di bawah batas ${limit}`
        );
      }

      const message = messageParts.join(' ');

      notifications.push({
        userId,
        title,
        message,
        severity,
        source,
      });
    }
  }

  return notifications;
}

class NotificationService implements INotificationService {
  private readonly detector: ILimitBreachDetector;
  private readonly repository: INotificationRepository;

  constructor(deps: {
    detector: ILimitBreachDetector;
    repository: INotificationRepository;
  }) {
    this.detector = deps.detector;
    this.repository = deps.repository;
  }

  async evaluateLimitBreaches(
    input: TEvaluateLimitBreachesInput
  ): Promise<TEvaluateLimitBreachesResult> {
    if (!input.technicianUserIds || input.technicianUserIds.length === 0) {
      throw createNotificationError({
        message: 'Daftar teknisi kosong',
        code: 'INVALID_INPUT',
        userId: input.evaluatorUserId,
      });
    }

    if (!input.entries || input.entries.length === 0) {
      throw createNotificationError({
        message: 'Daftar entri kosong',
        code: 'INVALID_INPUT',
        userId: input.evaluatorUserId,
      });
    }

    const breaches = this.detector.detectBreaches({
      entries: input.entries,
    });

    if (breaches.length === 0) {
      return {
        breaches,
        createdNotifications: [],
      };
    }

    const newNotifications = buildLimitBreachNotifications({
      breaches,
      technicianUserIds: input.technicianUserIds,
    });

    try {
      const createdNotifications =
        await this.repository.createMany(newNotifications);

      return {
        breaches,
        createdNotifications,
      };
    } catch (error) {
      throw createNotificationError({
        message: 'Gagal menyimpan notifikasi',
        code: 'PERSISTENCE_ERROR',
        userId: input.evaluatorUserId,
        details: { error },
      });
    }
  }

  async listUserNotifications(
    input: TListNotificationsInput
  ): Promise<TListNotificationsResult> {
    if (!input.userId) {
      throw createNotificationError({
        message: 'UserId wajib diisi',
        code: 'INVALID_INPUT',
      });
    }

    return this.repository.findByUser(input);
  }

  async getUserUnreadCount(
    input: TUnreadCountInput
  ): Promise<TUnreadCountResult> {
    if (!input.userId) {
      throw createNotificationError({
        message: 'UserId wajib diisi',
        code: 'INVALID_INPUT',
      });
    }

    const unreadCount = await this.repository.countUnreadByUser(input);

    return {
      userId: input.userId,
      unreadCount,
    };
  }

  async markNotificationAsRead(
    input: TMarkNotificationReadInput
  ): Promise<TMarkNotificationReadResult> {
    if (!input.userId || !input.notificationId) {
      throw createNotificationError({
        message: 'UserId dan notificationId wajib diisi',
        code: 'INVALID_INPUT',
        userId: input.userId,
        notificationId: input.notificationId,
      });
    }

    let notification: INotification | null = null;

    try {
      const existing = await this.repository.findById(input.notificationId);

      if (!existing) {
        throw createNotificationError({
          message: 'Notifikasi tidak ditemukan',
          code: 'NOTIFICATION_NOT_FOUND',
          userId: input.userId,
          notificationId: input.notificationId,
        });
      }

      if (existing.userId !== input.userId) {
        throw createNotificationError({
          message: 'Tidak diizinkan mengubah notifikasi pengguna lain',
          code: 'NOTIFICATION_ACCESS_DENIED',
          userId: input.userId,
          notificationId: input.notificationId,
        });
      }

      notification = await this.repository.markAsRead(input);
    } catch (error) {
      if (error instanceof NotificationErrorClass) {
        throw error;
      }

      throw createNotificationError({
        message: 'Gagal memperbarui status baca notifikasi',
        code: 'PERSISTENCE_ERROR',
        userId: input.userId,
        notificationId: input.notificationId,
        details: { error },
      });
    }

    return { notification };
  }

  async markAllNotificationsAsRead(
    input: TMarkAllNotificationsReadInput
  ): Promise<TMarkAllNotificationsReadResult> {
    if (!input.userId) {
      throw createNotificationError({
        message: 'UserId wajib diisi',
        code: 'INVALID_INPUT',
        userId: input.userId,
      });
    }

    try {
      const updatedCount = await this.repository.markAllAsRead(input);

      return {
        userId: input.userId,
        updatedCount,
      };
    } catch (error) {
      throw createNotificationError({
        message: 'Gagal memperbarui status baca semua notifikasi',
        code: 'PERSISTENCE_ERROR',
        userId: input.userId,
        details: { error },
      });
    }
  }
}

const detector = new LimitBreachDetector();
const repository = createPrismaNotificationRepository();

export const notificationService: INotificationService = new NotificationService(
  { detector, repository }
);

