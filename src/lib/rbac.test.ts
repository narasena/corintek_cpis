import { describe, it, expect } from 'vitest';
import {
  canAccess,
  getLandingPage,
  getRoleLabel,
  matchPathToResource,
  RbacResource,
  RbacRole,
} from './rbac';

describe('getLandingPage', () => {
  it('returns /users for ADMIN', () => {
    expect(getLandingPage('ADMIN')).toBe('/users');
  });

  it('returns /attendance for TECHNICIAN', () => {
    expect(getLandingPage('TECHNICIAN')).toBe('/attendance');
  });

  it('returns /my-projects for CLIENT', () => {
    expect(getLandingPage('CLIENT')).toBe('/my-projects');
  });

  it('returns / for unknown role', () => {
    expect(getLandingPage('UNKNOWN')).toBe('/');
  });
});

describe('matchPathToResource', () => {
  it('matches dashboard', () => {
    expect(matchPathToResource('/')).toBe(RbacResource.DASHBOARD);
    expect(matchPathToResource('')).toBe(RbacResource.DASHBOARD);
  });

  it('matches module paths', () => {
    expect(matchPathToResource('/summary-reports')).toBe(
      RbacResource.SUMMARY_REPORTS
    );
    expect(matchPathToResource('/log-sheets/123')).toBe(
      RbacResource.LOG_SHEETS
    );
    expect(matchPathToResource('/attendance')).toBe(RbacResource.ATTENDANCE);
    expect(matchPathToResource('/absence')).toBe(RbacResource.ATTENDANCE);
  });

  it('matches master data paths', () => {
    expect(matchPathToResource('/clients')).toBe(RbacResource.CLIENTS);
    expect(matchPathToResource('/chemicals')).toBe(RbacResource.CHEMICALS);
    expect(matchPathToResource('/parameters')).toBe(RbacResource.PARAMETERS);
    expect(matchPathToResource('/machines')).toBe(RbacResource.MACHINES);
  });

  it('returns UNKNOWN for unknown paths', () => {
    expect(matchPathToResource('/unknown')).toBe(RbacResource.UNKNOWN);
  });
});

describe('CLIENT role permissions', () => {
  it('has read access to DASHBOARD', () => {
    expect(canAccess('CLIENT', RbacResource.DASHBOARD, 'read')).toBe(true);
    expect(canAccess('CLIENT', RbacResource.DASHBOARD, 'create')).toBe(false);
    expect(canAccess('CLIENT', RbacResource.DASHBOARD, 'update')).toBe(false);
    expect(canAccess('CLIENT', RbacResource.DASHBOARD, 'delete')).toBe(false);
  });

  it('has read access to SUMMARY_REPORTS', () => {
    expect(canAccess('CLIENT', RbacResource.SUMMARY_REPORTS, 'read')).toBe(
      true
    );
    expect(canAccess('CLIENT', RbacResource.SUMMARY_REPORTS, 'create')).toBe(
      false
    );
  });

  it('has read access to LOG_SHEETS', () => {
    expect(canAccess('CLIENT', RbacResource.LOG_SHEETS, 'read')).toBe(true);
    expect(canAccess('CLIENT', RbacResource.LOG_SHEETS, 'create')).toBe(false);
    expect(canAccess('CLIENT', RbacResource.LOG_SHEETS, 'update')).toBe(false);
  });

  it('has read access to WORK_REPORTS', () => {
    expect(canAccess('CLIENT', RbacResource.WORK_REPORTS, 'read')).toBe(true);
    expect(canAccess('CLIENT', RbacResource.WORK_REPORTS, 'create')).toBe(
      false
    );
  });

  it('has read access to REPORTS', () => {
    expect(canAccess('CLIENT', RbacResource.REPORTS, 'read')).toBe(true);
    expect(canAccess('CLIENT', RbacResource.REPORTS, 'create')).toBe(false);
  });

  it('has read access to PROJECTS_LIST', () => {
    expect(canAccess('CLIENT', RbacResource.PROJECTS_LIST, 'read')).toBe(true);
    expect(canAccess('CLIENT', RbacResource.PROJECTS_LIST, 'create')).toBe(
      false
    );
  });

  it('has NO access to LAB_ANALYSES', () => {
    expect(canAccess('CLIENT', RbacResource.LAB_ANALYSES, 'read')).toBe(false);
    expect(canAccess('CLIENT', RbacResource.LAB_ANALYSES, 'create')).toBe(
      false
    );
  });

  it('has NO access to ATTENDANCE', () => {
    expect(canAccess('CLIENT', RbacResource.ATTENDANCE, 'read')).toBe(false);
    expect(canAccess('CLIENT', RbacResource.ATTENDANCE, 'create')).toBe(false);
  });

  it('has NO access to USERS_ADMIN', () => {
    expect(canAccess('CLIENT', RbacResource.USERS_ADMIN, 'read')).toBe(false);
    expect(canAccess('CLIENT', RbacResource.USERS_ADMIN, 'create')).toBe(false);
  });

  it('has NO access to PROJECTS_ADMIN', () => {
    expect(canAccess('CLIENT', RbacResource.PROJECTS_ADMIN, 'read')).toBe(
      false
    );
    expect(canAccess('CLIENT', RbacResource.PROJECTS_ADMIN, 'create')).toBe(
      false
    );
  });

  it('has NO access to CLIENTS', () => {
    expect(canAccess('CLIENT', RbacResource.CLIENTS, 'read')).toBe(false);
    expect(canAccess('CLIENT', RbacResource.CLIENTS, 'create')).toBe(false);
  });

  it('has read-only access to CHEMICALS', () => {
    expect(canAccess('CLIENT', RbacResource.CHEMICALS, 'read')).toBe(true);
    expect(canAccess('CLIENT', RbacResource.CHEMICALS, 'create')).toBe(false);
  });

  it('has read-only access to PARAMETERS', () => {
    expect(canAccess('CLIENT', RbacResource.PARAMETERS, 'read')).toBe(true);
    expect(canAccess('CLIENT', RbacResource.PARAMETERS, 'create')).toBe(false);
  });

  it('has read-only access to MACHINES', () => {
    expect(canAccess('CLIENT', RbacResource.MACHINES, 'read')).toBe(true);
    expect(canAccess('CLIENT', RbacResource.MACHINES, 'create')).toBe(false);
  });
});

describe('getRoleLabel for CLIENT role', () => {
  it('returns "Klien" for CLIENT role', () => {
    expect(getRoleLabel('CLIENT')).toBe('Klien');
  });

  it('returns existing labels for other roles', () => {
    expect(getRoleLabel('ADMIN')).toBe('Super Admin');
    expect(getRoleLabel('SUPERVISOR')).toBe('PIC Project');
    expect(getRoleLabel('TECHNICIAN')).toBe('Teknisi');
    expect(getRoleLabel('CLIENT_SUPERVISOR')).toBe('PIC Klien');
    expect(getRoleLabel('CLIENT_TECHNICIAN')).toBe('Teknisi (Klien)');
  });
});

describe('RbacRole constant', () => {
  it('includes CLIENT role', () => {
    expect(RbacRole.CLIENT).toBe('CLIENT');
  });

  it('includes all expected roles', () => {
    const roles = Object.values(RbacRole);
    expect(roles).toContain('ADMIN');
    expect(roles).toContain('SUPERVISOR');
    expect(roles).toContain('TECHNICIAN');
    expect(roles).toContain('REPORTING');
    expect(roles).toContain('DIRECTOR');
    expect(roles).toContain('CLIENT');
    expect(roles).toContain('CLIENT_TECHNICIAN');
    expect(roles).toContain('CLIENT_SUPERVISOR');
  });
});

describe('canAccess with PUBLIC resource', () => {
  it('returns true for any role', () => {
    expect(canAccess('ADMIN', RbacResource.PUBLIC, 'read')).toBe(true);
    expect(canAccess('CLIENT', RbacResource.PUBLIC, 'read')).toBe(true);
    expect(canAccess('UNKNOWN_ROLE', RbacResource.PUBLIC, 'read')).toBe(true);
  });
});

describe('canAccess with unknown role', () => {
  it('returns false for unknown role', () => {
    expect(canAccess('UNKNOWN_ROLE', RbacResource.DASHBOARD, 'read')).toBe(
      false
    );
  });
});
