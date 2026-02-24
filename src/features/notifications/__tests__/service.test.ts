import { describe, it, expect, beforeEach, vi } from 'vitest';

import { notificationService } from '../service';
import type {
  INotification,
  TLimitEvaluationEntrySnapshot,
  TListNotificationsResult,
} from '../types';

vi.mock('@/lib/prisma', () => {
  return {
    prisma: {
      notification: {
        create: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
      $transaction: vi.fn(),
    },
  };
});

const prismaMock = vi.mocked(await import('@/lib/prisma').then(m => m.prisma));

describe('Limit breach evaluation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function makeEntry(
    overrides: Partial<TLimitEvaluationEntrySnapshot> = {}
  ): TLimitEvaluationEntrySnapshot {
    return {
      logSheetId: 'ls-1',
      projectId: 'proj-1',
      parameterId: 'param-1',
      parameterName: 'Temp',
      value: 10,
      minLimit: 5,
      maxLimit: 8,
      ...overrides,
    };
  }

  it('returns no breaches and no notifications when all values within range', async () => {
    const entries = [makeEntry({ value: 6 }), makeEntry({ value: 7 })];

    const result = await notificationService.evaluateLimitBreaches({
      evaluatorUserId: 'evaluator-1',
      technicianUserIds: ['tech-1'],
      entries,
    });

    expect(result.breaches).toHaveLength(0);
    expect(result.createdNotifications).toHaveLength(0);
  });

  it('does not create breach when value equals min or max', async () => {
    const entries = [
      makeEntry({ value: 5 }),
      makeEntry({ value: 8 }),
    ];

    const result = await notificationService.evaluateLimitBreaches({
      evaluatorUserId: 'evaluator-1',
      technicianUserIds: ['tech-1'],
      entries,
    });

    expect(result.breaches).toHaveLength(0);
    expect(result.createdNotifications).toHaveLength(0);
  });

  it('ignores entries with null value', async () => {
    const entries = [makeEntry({ value: null })];

    const result = await notificationService.evaluateLimitBreaches({
      evaluatorUserId: 'evaluator-1',
      technicianUserIds: ['tech-1'],
      entries,
    });

    expect(result.breaches).toHaveLength(0);
    expect(result.createdNotifications).toHaveLength(0);
  });

  it('creates breach and notification for above max value', async () => {
    const entries = [makeEntry({ value: 9 })];

    const createdRows: INotification[] = [
      {
        id: 'n1',
        userId: 'tech-1',
        title: 'Peringatan batas parameter log sheet',
        message: 'Parameter Temp bernilai 9 di atas batas 8',
        severity: 'WARNING',
        source: {
          type: 'LOG_SHEET_LIMIT_BREACH',
          logSheetId: 'ls-1',
          projectId: 'proj-1',
          parameterId: 'param-1',
          parameterName: 'Temp',
          value: 9,
          minLimit: 5,
          maxLimit: 8,
          breachDirection: 'ABOVE_MAX',
        },
        isRead: false,
        readAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    (prismaMock.$transaction as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      async (fn: (client: typeof prismaMock) => Promise<INotification[]>) =>
        fn(prismaMock as never)
    );
    (
      prismaMock.notification.create as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(createdRows[0] as never);

    const result = await notificationService.evaluateLimitBreaches({
      evaluatorUserId: 'evaluator-1',
      technicianUserIds: ['tech-1'],
      entries,
    });

    expect(result.breaches).toHaveLength(1);
    expect(result.breaches[0].breachDirection).toBe('ABOVE_MAX');
    expect(result.createdNotifications).toHaveLength(1);
    expect(result.createdNotifications[0].source.breachDirection).toBe(
      'ABOVE_MAX'
    );
  });

  it('creates notifications for each breach and technician', async () => {
    const entries = [makeEntry({ value: 4 })];

    const createdRows: INotification[] = [
      {
        id: 'n1',
        userId: 'tech-1',
        title: 'Peringatan batas parameter log sheet',
        message: 'Parameter Temp bernilai 4 di bawah batas 5',
        severity: 'WARNING',
        source: {
          type: 'LOG_SHEET_LIMIT_BREACH',
          logSheetId: 'ls-1',
          projectId: 'proj-1',
          parameterId: 'param-1',
          parameterName: 'Temp',
          value: 4,
          minLimit: 5,
          maxLimit: 8,
          breachDirection: 'BELOW_MIN',
        },
        isRead: false,
        readAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'n2',
        userId: 'tech-2',
        title: 'Peringatan batas parameter log sheet',
        message: 'Parameter Temp bernilai 4 di bawah batas 5',
        severity: 'WARNING',
        source: {
          type: 'LOG_SHEET_LIMIT_BREACH',
          logSheetId: 'ls-1',
          projectId: 'proj-1',
          parameterId: 'param-1',
          parameterName: 'Temp',
          value: 4,
          minLimit: 5,
          maxLimit: 8,
          breachDirection: 'BELOW_MIN',
        },
        isRead: false,
        readAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    (prismaMock.$transaction as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      async (fn: (client: typeof prismaMock) => Promise<INotification[]>) =>
        fn(prismaMock as never)
    );
    (
      prismaMock.notification.create as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(createdRows[0] as never);
    (
      prismaMock.notification.create as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(createdRows[1] as never);

    const result = await notificationService.evaluateLimitBreaches({
      evaluatorUserId: 'evaluator-1',
      technicianUserIds: ['tech-1', 'tech-2'],
      entries,
    });

    expect(result.breaches).toHaveLength(1);
    expect(result.createdNotifications).toHaveLength(2);
    expect(
      result.createdNotifications.map(n => n.userId).sort()
    ).toEqual(['tech-1', 'tech-2']);
  });

  it('throws on empty technician list', async () => {
    const entries = [makeEntry({ value: 4 })];

    await expect(
      notificationService.evaluateLimitBreaches({
        evaluatorUserId: 'evaluator-1',
        technicianUserIds: [],
        entries,
      })
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });
  });

  it('throws on empty entries list', async () => {
    await expect(
      notificationService.evaluateLimitBreaches({
        evaluatorUserId: 'evaluator-1',
        technicianUserIds: ['tech-1'],
        entries: [],
      })
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });
  });
});

describe('Notification listing and counts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists notifications for user with pagination', async () => {
    const now = new Date();
    const rows: INotification[] = [
      {
        id: 'n1',
        userId: 'user-1',
        title: 't1',
        message: 'm1',
        severity: 'WARNING',
        source: {
          type: 'LOG_SHEET_LIMIT_BREACH',
          logSheetId: 'ls-1',
          projectId: 'proj-1',
          parameterId: 'param-1',
          parameterName: 'Temp',
          value: 10,
          minLimit: 5,
          maxLimit: 8,
          breachDirection: 'ABOVE_MAX',
        },
        isRead: false,
        readAt: null,
        createdAt: now,
        updatedAt: now,
      },
    ];

    (
      prismaMock.notification.findMany as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue(rows as never);
    (
      prismaMock.notification.count as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue(1 as never);

    const result = await notificationService.listUserNotifications({
      userId: 'user-1',
      page: 1,
      pageSize: 10,
    });

    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.items[0].userId).toBe('user-1');
  });

  it('filters unread notifications and matches unread count', async () => {
    const now = new Date();
    const unreadRows: INotification[] = [
      {
        id: 'n1',
        userId: 'user-1',
        title: 't1',
        message: 'm1',
        severity: 'WARNING',
        source: {
          type: 'LOG_SHEET_LIMIT_BREACH',
          logSheetId: 'ls-1',
          projectId: 'proj-1',
          parameterId: 'param-1',
          parameterName: 'Temp',
          value: 10,
          minLimit: 5,
          maxLimit: 8,
          breachDirection: 'ABOVE_MAX',
        },
        isRead: false,
        readAt: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'n2',
        userId: 'user-1',
        title: 't2',
        message: 'm2',
        severity: 'WARNING',
        source: {
          type: 'LOG_SHEET_LIMIT_BREACH',
          logSheetId: 'ls-1',
          projectId: 'proj-1',
          parameterId: 'param-1',
          parameterName: 'Temp',
          value: 4,
          minLimit: 5,
          maxLimit: 8,
          breachDirection: 'BELOW_MIN',
        },
        isRead: false,
        readAt: null,
        createdAt: now,
        updatedAt: now,
      },
    ];

    (
      prismaMock.notification.findMany as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue(unreadRows as never);
    (
      prismaMock.notification.count as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue(2 as never);

    const listResult: TListNotificationsResult =
      await notificationService.listUserNotifications({
        userId: 'user-1',
        onlyUnread: true,
      });

    (
      prismaMock.notification.count as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue(2 as never);

    const countResult = await notificationService.getUserUnreadCount({
      userId: 'user-1',
    });

    expect(listResult.items).toHaveLength(2);
    expect(countResult.unreadCount).toBe(listResult.items.length);
  });
});

describe('Mark notifications as read', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('marks a single notification as read for the owner', async () => {
    const now = new Date();
    const existing: INotification = {
      id: 'n1',
      userId: 'user-1',
      title: 't1',
      message: 'm1',
      severity: 'WARNING',
      source: {
        type: 'LOG_SHEET_LIMIT_BREACH',
        logSheetId: 'ls-1',
        projectId: 'proj-1',
        parameterId: 'param-1',
        parameterName: 'Temp',
        value: 10,
        minLimit: 5,
        maxLimit: 8,
        breachDirection: 'ABOVE_MAX',
      },
      isRead: false,
      readAt: null,
      createdAt: now,
      updatedAt: now,
    };

    (
      prismaMock.notification.findUnique as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue(existing as never);

    const updated: INotification = {
      ...existing,
      isRead: true,
      readAt: new Date(now.getTime() + 1000),
    };

    (
      prismaMock.notification.update as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue(updated as never);

    const result = await notificationService.markNotificationAsRead({
      userId: 'user-1',
      notificationId: 'n1',
    });

    expect(result.notification.isRead).toBe(true);
    expect(result.notification.readAt).not.toBeNull();
  });

  it('prevents marking other user notification as read', async () => {
    const now = new Date();
    const existing: INotification = {
      id: 'n1',
      userId: 'owner',
      title: 't1',
      message: 'm1',
      severity: 'WARNING',
      source: {
        type: 'LOG_SHEET_LIMIT_BREACH',
        logSheetId: 'ls-1',
        projectId: 'proj-1',
        parameterId: 'param-1',
        parameterName: 'Temp',
        value: 10,
        minLimit: 5,
        maxLimit: 8,
        breachDirection: 'ABOVE_MAX',
      },
      isRead: false,
      readAt: null,
      createdAt: now,
      updatedAt: now,
    };

    (
      prismaMock.notification.findUnique as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue(existing as never);

    await expect(
      notificationService.markNotificationAsRead({
        userId: 'other-user',
        notificationId: 'n1',
      })
    ).rejects.toMatchObject({ code: 'NOTIFICATION_ACCESS_DENIED' });
  });

  it('marks all notifications as read for a user', async () => {
    (
      prismaMock.notification.updateMany as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({ count: 3 } as never);

    const result = await notificationService.markAllNotificationsAsRead({
      userId: 'user-1',
    });

    expect(result.updatedCount).toBe(3);
  });
});
