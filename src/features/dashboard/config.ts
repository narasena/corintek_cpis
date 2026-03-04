/**
 * Dashboard RBAC Configuration
 * @module features/dashboard/config
 */

import type { TRbacRole } from '@/lib/rbac';
import type {
  IDashboardConfig,
  TActivityType,
  TActivityTimeRange,
} from './types';

// TODO: Import from centralized role definitions
type Role = TRbacRole;

/**
 * Role-specific dashboard activity configurations
 * Maps each role to their dashboard visibility settings
 */
export const DASHBOARD_CONFIG_MATRIX: Record<Role, IDashboardConfig> = {
  // TODO: Define ADMIN config (all activity types, 30d default, ALL scope)
  ADMIN: {
    defaultTimeRange: '30d',
    visibleActivityTypes: [
      'LOG_SHEET_SUBMITTED',
      'LOG_SHEET_APPROVED',
      'WORK_REPORT_SUBMITTED',
      'WORK_REPORT_APPROVED',
      'ATTENDANCE_CHECK_IN',
      'ATTENDANCE_CHECK_OUT',
      'SUMMARY_REPORT_FINALIZED',
    ],
    scope: 'ALL',
    showPersonalFeed: false,
  },

  // TODO: Define SUPERVISOR config (project-scoped, 7d default, ASSIGNED scope)
  SUPERVISOR: {
    defaultTimeRange: '7d',
    visibleActivityTypes: [
      'LOG_SHEET_SUBMITTED',
      'LOG_SHEET_APPROVED',
      'WORK_REPORT_SUBMITTED',
      'WORK_REPORT_APPROVED',
      'ATTENDANCE_CHECK_IN',
      'ATTENDANCE_CHECK_OUT',
    ],
    scope: 'ASSIGNED',
    showPersonalFeed: true,
  },

  // TODO: Define TECHNICIAN config (personal + team, 7d default, ASSIGNED scope)
  TECHNICIAN: {
    defaultTimeRange: '7d',
    visibleActivityTypes: [
      'LOG_SHEET_SUBMITTED',
      'LOG_SHEET_APPROVED',
      'WORK_REPORT_SUBMITTED',
    ],
    scope: 'ASSIGNED',
    showPersonalFeed: true,
  },

  // TODO: Define REPORTING config (log sheets + reports, 30d default, ALL scope)
  REPORTING: {
    defaultTimeRange: '30d',
    visibleActivityTypes: [
      'LOG_SHEET_SUBMITTED',
      'LOG_SHEET_APPROVED',
      'SUMMARY_REPORT_FINALIZED',
    ],
    scope: 'ALL',
    showPersonalFeed: false,
  },

  // TODO: Define DIRECTOR config (summary view, 30d default, ALL scope)
  DIRECTOR: {
    defaultTimeRange: '30d',
    visibleActivityTypes: [
      'LOG_SHEET_SUBMITTED',
      'LOG_SHEET_APPROVED',
      'SUMMARY_REPORT_FINALIZED',
    ],
    scope: 'ALL',
    showPersonalFeed: false,
  },

  // TODO: Define CLIENT config (company-scoped, 30d default, CLIENT scope)
  CLIENT: {
    defaultTimeRange: '30d',
    visibleActivityTypes: [
      'LOG_SHEET_SUBMITTED',
      'LOG_SHEET_APPROVED',
      'WORK_REPORT_SUBMITTED',
      'SUMMARY_REPORT_FINALIZED',
    ],
    scope: 'CLIENT',
    showPersonalFeed: false,
  },

  // TODO: Define CLIENT_SUPERVISOR config (supervised projects, 7d default, CLIENT scope)
  CLIENT_SUPERVISOR: {
    defaultTimeRange: '7d',
    visibleActivityTypes: [
      'LOG_SHEET_SUBMITTED',
      'LOG_SHEET_APPROVED',
      'WORK_REPORT_SUBMITTED',
    ],
    scope: 'CLIENT',
    showPersonalFeed: true,
  },

  // TODO: Define CLIENT_TECHNICIAN config (personal only, 7d default, CLIENT scope)
  CLIENT_TECHNICIAN: {
    defaultTimeRange: '7d',
    visibleActivityTypes: ['LOG_SHEET_SUBMITTED', 'WORK_REPORT_SUBMITTED'],
    scope: 'CLIENT',
    showPersonalFeed: true,
  },
};

/**
 * Get dashboard configuration for a role
 * @param role - User role
 * @returns Role-specific dashboard configuration
 */
export function getDashboardConfig(role: Role): IDashboardConfig {
  // TODO: Return config from DASHBOARD_CONFIG_MATRIX with fallback
  const config = DASHBOARD_CONFIG_MATRIX[role];
  if (!config) {
    // Fallback to most restrictive config
    return DASHBOARD_CONFIG_MATRIX.TECHNICIAN;
  }
  return config;
}

/**
 * Get visible activity types for a role
 * @param role - User role
 * @returns Array of activity types visible to this role
 */
export function getVisibleActivityTypes(role: Role): TActivityType[] {
  // TODO: Return visible types from role config
  const config = getDashboardConfig(role);
  return config.visibleActivityTypes;
}

/**
 * Get default time range for a role
 * @param role - User role
 * @returns Default time range preset
 */
export function getDefaultTimeRange(role: Role): TActivityTimeRange {
  // TODO: Return default range from role config
  const config = getDashboardConfig(role);
  return config.defaultTimeRange;
}
