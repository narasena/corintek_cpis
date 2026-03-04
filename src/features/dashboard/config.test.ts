/**
 * Dashboard Config Tests
 * @module features/dashboard/config.test
 */

import { describe, it, expect } from 'vitest';
import {
  getDashboardConfig,
  getVisibleActivityTypes,
  getDefaultTimeRange,
  DASHBOARD_CONFIG_MATRIX,
} from './config';
import type { TRbacRole } from '@/lib/rbac';

describe('getDashboardConfig', () => {
  it('should return ADMIN config with 30d range and ALL scope', () => {
    const config = getDashboardConfig('ADMIN');

    expect(config.defaultTimeRange).toBe('30d');
    expect(config.scope).toBe('ALL');
    expect(config.showPersonalFeed).toBe(false);
    expect(config.visibleActivityTypes).toContain('LOG_SHEET_SUBMITTED');
    expect(config.visibleActivityTypes).toContain('SUMMARY_REPORT_FINALIZED');
  });

  it('should return TECHNICIAN config with 7d range and ASSIGNED scope', () => {
    const config = getDashboardConfig('TECHNICIAN');

    expect(config.defaultTimeRange).toBe('7d');
    expect(config.scope).toBe('ASSIGNED');
    expect(config.showPersonalFeed).toBe(true);
    expect(config.visibleActivityTypes).toContain('LOG_SHEET_SUBMITTED');
    expect(config.visibleActivityTypes).not.toContain(
      'SUMMARY_REPORT_FINALIZED'
    );
  });

  it('should return SUPERVISOR config with personal feed enabled', () => {
    const config = getDashboardConfig('SUPERVISOR');

    expect(config.defaultTimeRange).toBe('7d');
    expect(config.scope).toBe('ASSIGNED');
    expect(config.showPersonalFeed).toBe(true);
    expect(config.visibleActivityTypes).toContain('ATTENDANCE_CHECK_IN');
  });

  it('should return CLIENT config with CLIENT scope', () => {
    const config = getDashboardConfig('CLIENT');

    expect(config.defaultTimeRange).toBe('30d');
    expect(config.scope).toBe('CLIENT');
    expect(config.showPersonalFeed).toBe(false);
    expect(config.visibleActivityTypes).not.toContain('ATTENDANCE_CHECK_IN');
  });

  it('should fallback to TECHNICIAN config for unknown roles', () => {
    const config = getDashboardConfig('UNKNOWN_ROLE' as TRbacRole);

    // Should fallback to TECHNICIAN config
    expect(config.defaultTimeRange).toBe('7d');
    expect(config.scope).toBe('ASSIGNED');
  });

  it('should have unique activity types for each role', () => {
    const roles = Object.keys(DASHBOARD_CONFIG_MATRIX) as TRbacRole[];

    for (const role of roles) {
      const config = getDashboardConfig(role);
      const uniqueTypes = new Set(config.visibleActivityTypes);
      expect(uniqueTypes.size).toBe(config.visibleActivityTypes.length);
    }
  });
});

describe('getVisibleActivityTypes', () => {
  it('should return all activity types for ADMIN', () => {
    const types = getVisibleActivityTypes('ADMIN');

    expect(types).toHaveLength(7);
    expect(types).toContain('LOG_SHEET_SUBMITTED');
    expect(types).toContain('LOG_SHEET_APPROVED');
    expect(types).toContain('WORK_REPORT_SUBMITTED');
    expect(types).toContain('WORK_REPORT_APPROVED');
    expect(types).toContain('ATTENDANCE_CHECK_IN');
    expect(types).toContain('ATTENDANCE_CHECK_OUT');
    expect(types).toContain('SUMMARY_REPORT_FINALIZED');
  });

  it('should return limited types for CLIENT_TECHNICIAN', () => {
    const types = getVisibleActivityTypes('CLIENT_TECHNICIAN');

    expect(types).toHaveLength(2);
    expect(types).toContain('LOG_SHEET_SUBMITTED');
    expect(types).toContain('WORK_REPORT_SUBMITTED');
    expect(types).not.toContain('ATTENDANCE_CHECK_IN');
  });
});

describe('getDefaultTimeRange', () => {
  it('should return 30d for ADMIN', () => {
    expect(getDefaultTimeRange('ADMIN')).toBe('30d');
  });

  it('should return 7d for TECHNICIAN', () => {
    expect(getDefaultTimeRange('TECHNICIAN')).toBe('7d');
  });

  it('should return 30d for DIRECTOR', () => {
    expect(getDefaultTimeRange('DIRECTOR')).toBe('30d');
  });
});

describe('DASHBOARD_CONFIG_MATRIX', () => {
  it('should have all 8 roles defined', () => {
    const roles = Object.keys(DASHBOARD_CONFIG_MATRIX);

    expect(roles).toHaveLength(8);
    expect(roles).toContain('ADMIN');
    expect(roles).toContain('SUPERVISOR');
    expect(roles).toContain('TECHNICIAN');
    expect(roles).toContain('REPORTING');
    expect(roles).toContain('DIRECTOR');
    expect(roles).toContain('CLIENT');
    expect(roles).toContain('CLIENT_SUPERVISOR');
    expect(roles).toContain('CLIENT_TECHNICIAN');
  });

  it('should have valid config structure for all roles', () => {
    for (const [role, config] of Object.entries(DASHBOARD_CONFIG_MATRIX)) {
      expect(
        config,
        `Role ${role} should have defaultTimeRange`
      ).toHaveProperty('defaultTimeRange');
      expect(
        config,
        `Role ${role} should have visibleActivityTypes`
      ).toHaveProperty('visibleActivityTypes');
      expect(config, `Role ${role} should have scope`).toHaveProperty('scope');
      expect(
        config,
        `Role ${role} should have showPersonalFeed`
      ).toHaveProperty('showPersonalFeed');

      expect(['7d', '30d']).toContain(config.defaultTimeRange);
      expect(['ALL', 'ASSIGNED', 'CLIENT']).toContain(config.scope);
      expect(typeof config.showPersonalFeed).toBe('boolean');
      expect(Array.isArray(config.visibleActivityTypes)).toBe(true);
    }
  });

  it('should have consistent scope mapping', () => {
    // ADMIN, REPORTING, DIRECTOR should have ALL scope
    expect(DASHBOARD_CONFIG_MATRIX.ADMIN.scope).toBe('ALL');
    expect(DASHBOARD_CONFIG_MATRIX.REPORTING.scope).toBe('ALL');
    expect(DASHBOARD_CONFIG_MATRIX.DIRECTOR.scope).toBe('ALL');

    // SUPERVISOR, TECHNICIAN should have ASSIGNED scope
    expect(DASHBOARD_CONFIG_MATRIX.SUPERVISOR.scope).toBe('ASSIGNED');
    expect(DASHBOARD_CONFIG_MATRIX.TECHNICIAN.scope).toBe('ASSIGNED');

    // CLIENT roles should have CLIENT scope
    expect(DASHBOARD_CONFIG_MATRIX.CLIENT.scope).toBe('CLIENT');
    expect(DASHBOARD_CONFIG_MATRIX.CLIENT_SUPERVISOR.scope).toBe('CLIENT');
    expect(DASHBOARD_CONFIG_MATRIX.CLIENT_TECHNICIAN.scope).toBe('CLIENT');
  });
});
