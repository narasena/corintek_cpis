/**
 * Dashboard Activity Types
 * @module features/dashboard/types
 */

import type { IJwtPayload } from '@/@types/auth.type';
import type { TRbacRole } from '@/lib/rbac';

// ============================================================================
// Enums
// ============================================================================

export type TActivityType =
  | 'LOG_SHEET_SUBMITTED'
  | 'LOG_SHEET_APPROVED'
  | 'WORK_REPORT_SUBMITTED'
  | 'WORK_REPORT_APPROVED'
  | 'ATTENDANCE_CHECK_IN'
  | 'ATTENDANCE_CHECK_OUT'
  | 'SUMMARY_REPORT_FINALIZED';

export type TActivitySeverity = 'INFO' | 'SUCCESS' | 'WARNING';

export type TActivityTimeRange = '7d' | '30d' | '90d';

export type TActivityVisibility = 'GLOBAL' | 'PROJECT' | 'PERSONAL' | 'CLIENT';

// ============================================================================
// Domain Interfaces
// ============================================================================

export interface IActivity {
  /** Unique identifier (composite: `${sourceType}:${sourceId}:${timestamp}`) */
  readonly id: string;

  /** Activity classification */
  readonly type: TActivityType;

  /** UI severity for color coding */
  readonly severity: TActivitySeverity;

  /** Display title (pre-localized) */
  readonly title: string;

  /** Display message (pre-localized) */
  readonly message: string;

  /** Project context (null for global activities) */
  readonly projectId: string | null;

  /** Project display name */
  readonly projectName: string | null;

  /** User who triggered the activity */
  readonly userId: string;

  /** User display name */
  readonly userName: string;

  /** User avatar URL (nullable) */
  readonly userAvatarUrl: string | null;

  /** When the activity occurred */
  readonly createdAt: Date;

  /** Deep link to source (optional) */
  readonly link: string | null;

  /** Source-specific metadata */
  readonly metadata: TActivityMetadata;
}

export type TActivityMetadata =
  | ILogSheetActivityMetadata
  | IWorkReportActivityMetadata
  | IAttendanceActivityMetadata
  | ISummaryReportActivityMetadata;

export interface ILogSheetActivityMetadata {
  logSheetId: string;
  logSheetDate: string;
  unitCount?: number;
}

export interface IWorkReportActivityMetadata {
  workReportId: string;
  zone: string | null;
  machineCount: number;
}

export interface IAttendanceActivityMetadata {
  attendanceId: string;
  location: string | null;
  photoUrl: string | null;
}

export interface ISummaryReportActivityMetadata {
  summaryReportId: string;
  periodMonth: string;
  periodYear: number;
}

// ============================================================================
// Service Input/Output Types
// ============================================================================

export interface IGetRecentActivitiesInput {
  /** Authenticated user context */
  readonly actor: IJwtPayload;

  /** Optional filter by specific projects */
  readonly projectIds?: string[];

  /** Time range preset (default: '7d') */
  readonly timeRange?: TActivityTimeRange;

  /** Maximum items to return (default: 15, max: 50) */
  readonly limit?: number;

  /** Optional filter by activity types */
  readonly types?: TActivityType[];

  /** Cursor for pagination (last activity ID) */
  readonly cursor?: string;
}

export interface IGetRecentActivitiesResult {
  /** Activity items sorted by createdAt desc */
  readonly activities: IActivity[];

  /** Whether more items exist beyond this page */
  readonly hasMore: boolean;

  /** Cursor for next page (null if no more) */
  readonly nextCursor: string | null;

  /** Time range applied to query */
  readonly appliedRange: TActivityTimeRange;

  /** Total count for this query (approximate for performance) */
  readonly totalEstimate: number;
}

export interface IDashboardConfig {
  /** Default time range for this role */
  readonly defaultTimeRange: TActivityTimeRange;

  /** Activity types visible to this role */
  readonly visibleActivityTypes: TActivityType[];

  /** Whether to show activities from all projects or scoped only */
  readonly scope: 'ALL' | 'ASSIGNED' | 'CLIENT';

  /** Whether to show personal activity feed */
  readonly showPersonalFeed: boolean;
}

// ============================================================================
// Action Layer Types
// ============================================================================

/**
 * Validated input from client
 */
export interface IGetRecentActivitiesActionInput {
  readonly projectId?: string;
  readonly timeRange?: TActivityTimeRange;
  readonly limit?: number;
  readonly cursor?: string;
}

/**
 * API response wrapper (consistent with existing patterns)
 */
export interface IGetRecentActivitiesActionResult {
  readonly success: boolean;
  readonly data?: {
    activities: IActivity[];
    hasMore: boolean;
    nextCursor: string | null;
  };
  readonly error?: string;
}

// ============================================================================
// Error Types
// ============================================================================

export type TActivityErrorCode =
  | 'UNAUTHORIZED'
  | 'INVALID_TIME_RANGE'
  | 'INVALID_LIMIT'
  | 'INVALID_CURSOR'
  | 'PROJECT_ACCESS_DENIED'
  | 'QUERY_TIMEOUT'
  | 'PERSISTENCE_ERROR';

export interface IActivityError extends Error {
  readonly code: TActivityErrorCode;
  readonly userId?: string;
  readonly projectId?: string;
  readonly details?: Record<string, unknown>;
}

// ============================================================================
// Component Prop Types
// ============================================================================

/**
 * Props for activity list item component
 */
export interface IActivityItemProps {
  readonly activity: IActivity;
  readonly onClick?: (activity: IActivity) => void;
  readonly compact?: boolean;
}

/**
 * Props for activity list component
 */
export interface IActivityListProps {
  readonly activities: IActivity[];
  readonly hasMore: boolean;
  readonly loading: boolean;
  readonly onLoadMore: () => void;
  readonly emptyMessage?: string;
}

/**
 * Props for recent activity card (container)
 */
export interface IRecentActivityCardProps {
  /** Pre-fetched initial activities */
  readonly initialActivities?: IActivity[];

  /** Default time range (defaults from role config) */
  readonly defaultTimeRange?: TActivityTimeRange;

  /** Optional project filter (null = all accessible projects) */
  readonly projectId?: string;
}

// ============================================================================
// Hook Types
// ============================================================================

export interface IUseRecentActivitiesOptions {
  initialData?: {
    activities: IActivity[];
    hasMore: boolean;
    nextCursor: string | null;
  };
  projectId?: string;
  timeRange?: TActivityTimeRange;
}

export interface IUseRecentActivitiesReturn {
  activities: IActivity[];
  hasMore: boolean;
  loading: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  setTimeRange: (range: TActivityTimeRange) => void;
}
