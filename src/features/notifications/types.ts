export type TNotificationSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export type TNotificationSourceType = 'LOG_SHEET_LIMIT_BREACH';

export type TLimitBreachDirection = 'BELOW_MIN' | 'ABOVE_MAX';

export interface INotificationSourceLogSheetLimitBreach {
  type: 'LOG_SHEET_LIMIT_BREACH';
  logSheetId: string;
  projectId: string;
  parameterId: string;
  parameterName: string;
  value: number;
  minLimit: number | null;
  maxLimit: number | null;
  breachDirection: TLimitBreachDirection;
}

export type TNotificationSource = INotificationSourceLogSheetLimitBreach;

export interface INotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  severity: TNotificationSeverity;
  source: TNotificationSource;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TLimitEvaluationEntrySnapshot {
  logSheetId: string;
  projectId: string;
  parameterId: string;
  parameterName: string;
  value: number | null;
  minLimit: number | null;
  maxLimit: number | null;
}

export interface TLimitEvaluationInput {
  entries: TLimitEvaluationEntrySnapshot[];
}

export interface TLimitBreach {
  entry: TLimitEvaluationEntrySnapshot;
  breachDirection: TLimitBreachDirection;
  severity: TNotificationSeverity;
}

export interface TEvaluateLimitBreachesInput {
  technicianUserIds: string[];
  evaluatorUserId: string;
  entries: TLimitEvaluationEntrySnapshot[];
}

export interface TEvaluateLimitBreachesResult {
  breaches: TLimitBreach[];
  createdNotifications: INotification[];
}

export interface TListNotificationsInput {
  userId: string;
  onlyUnread?: boolean;
  page?: number;
  pageSize?: number;
}

export interface TListNotificationsResult {
  items: INotification[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TUnreadCountInput {
  userId: string;
}

export interface TUnreadCountResult {
  userId: string;
  unreadCount: number;
}

export interface TMarkNotificationReadInput {
  userId: string;
  notificationId: string;
}

export interface TMarkNotificationReadResult {
  notification: INotification;
}

export interface TMarkAllNotificationsReadInput {
  userId: string;
}

export interface TMarkAllNotificationsReadResult {
  userId: string;
  updatedCount: number;
}

export type TNotificationErrorCode =
  | 'NOTIFICATION_NOT_FOUND'
  | 'NOTIFICATION_ACCESS_DENIED'
  | 'INVALID_INPUT'
  | 'PERSISTENCE_ERROR'
  | 'CONCURRENCY_CONFLICT';

export interface INotificationError extends Error {
  code: TNotificationErrorCode;
  userId?: string;
  notificationId?: string;
}

export interface INotificationNotFoundError extends INotificationError {
  code: 'NOTIFICATION_NOT_FOUND';
}

export interface INotificationAccessDeniedError extends INotificationError {
  code: 'NOTIFICATION_ACCESS_DENIED';
}

export interface INotificationValidationError extends INotificationError {
  code: 'INVALID_INPUT';
  details: Record<string, unknown>;
}

export interface INotificationPersistenceError extends INotificationError {
  code: 'PERSISTENCE_ERROR';
}

export interface INotificationConcurrencyError extends INotificationError {
  code: 'CONCURRENCY_CONFLICT';
}

export interface TNewNotification {
  userId: string;
  title: string;
  message: string;
  severity: TNotificationSeverity;
  source: TNotificationSource;
}

export interface ILimitBreachDetector {
  detectBreaches(input: TLimitEvaluationInput): TLimitBreach[];
}

export interface INotificationRepository {
  createMany(notifications: TNewNotification[]): Promise<INotification[]>;
  findByUser(input: TListNotificationsInput): Promise<TListNotificationsResult>;
  countUnreadByUser(input: TUnreadCountInput): Promise<number>;
  findById(notificationId: string): Promise<INotification | null>;
  markAsRead(input: TMarkNotificationReadInput): Promise<INotification>;
  markAllAsRead(input: TMarkAllNotificationsReadInput): Promise<number>;
}

export interface INotificationService {
  evaluateLimitBreaches(
    input: TEvaluateLimitBreachesInput
  ): Promise<TEvaluateLimitBreachesResult>;
  listUserNotifications(
    input: TListNotificationsInput
  ): Promise<TListNotificationsResult>;
  getUserUnreadCount(
    input: TUnreadCountInput
  ): Promise<TUnreadCountResult>;
  markNotificationAsRead(
    input: TMarkNotificationReadInput
  ): Promise<TMarkNotificationReadResult>;
  markAllNotificationsAsRead(
    input: TMarkAllNotificationsReadInput
  ): Promise<TMarkAllNotificationsReadResult>;
}

export class NotificationError extends Error implements INotificationError {
  code: TNotificationErrorCode;
  userId?: string;
  notificationId?: string;
  details?: Record<string, unknown>;

  constructor(params: {
    message: string;
    code: TNotificationErrorCode;
    userId?: string;
    notificationId?: string;
    details?: Record<string, unknown>;
  }) {
    super(params.message);
    this.name = 'NotificationError';
    this.code = params.code;
    this.userId = params.userId;
    this.notificationId = params.notificationId;
    this.details = params.details;
  }
}

