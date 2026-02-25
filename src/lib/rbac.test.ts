import { describe, it, expect } from 'vitest';
import { canAccess, getRoleLabel, RbacResource, RbacRole } from './rbac';

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

  it('has NO access to MASTER_DATA', () => {
    expect(canAccess('CLIENT', RbacResource.MASTER_DATA, 'read')).toBe(false);
    expect(canAccess('CLIENT', RbacResource.MASTER_DATA, 'create')).toBe(false);
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

describe('canAccess with unknown role', () => {
  it('returns false for unknown role', () => {
    expect(canAccess('UNKNOWN_ROLE', RbacResource.DASHBOARD, 'read')).toBe(
      false
    );
  });
});
