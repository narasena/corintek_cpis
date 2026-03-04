/**
 * Dashboard Module - Public API
 * @module features/dashboard
 *
 * Clean architecture exports - no internal details exposed
 */

// ============================================================================
// Types (what consumers need to know)
// ============================================================================
export type {
  IActivity,
  TActivityType,
  TActivityTimeRange,
  IGetRecentActivitiesInput,
  IGetRecentActivitiesResult,
  IDashboardConfig,
  IActivityItemProps,
  IActivityListProps,
  IRecentActivityCardProps,
} from './types';

// ============================================================================
// DI Container (how to get dependencies)
// ============================================================================
export {
  // Composition root (wire dependencies here)
  composeDashboardModule,
  composeTestDashboardModule,

  // Global container (singleton access)
  initializeDashboardContainer,
  getActivityService,
  getProjectAccessService,
  getActivityRepository,
  resetDashboardContainer,
} from './di';

export type {
  // Interfaces (depend on these)
  IActivityService,
  IActivityRepository,
  IProjectAccessService,
} from './di';

// ============================================================================
// Actions (Server Actions)
// ============================================================================
export {
  getDashboardMetricsAction,
  getRecentPhotosAction,
  getRecentActivitiesAction,
} from './actions';

// ============================================================================
// Configuration (RBAC settings)
// ============================================================================
export {
  getDashboardConfig,
  getVisibleActivityTypes,
  getDefaultTimeRange,
  DASHBOARD_CONFIG_MATRIX,
} from './config';

// ============================================================================
// Legacy Service Functions (backward compatibility)
// ============================================================================
export {
  getDashboardMetrics,
  getRecentLogSheetPhotos,
  ActivityService,
  createActivityService,
} from './service';

// ============================================================================
// Utils (Project access resolution)
// ============================================================================
export { resolveTargetProjectIds } from './utils';

// ============================================================================
// Additional Type Exports (isolatedModules fix)
// ============================================================================
export type { IDashboardComposition, IMockDependencies } from './di';

export type { IProjectAccessServices } from './utils';
