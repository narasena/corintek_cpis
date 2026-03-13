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

describe('canAccess characterization', () => {
  const allResources = Object.values(RbacResource);
  const allRoles = Object.values(RbacRole);
  const capabilities: TRbacCapability[] = [
    'create',
    'read',
    'update',
    'delete',
  ];

  it('matches the established permission matrix for all roles/resources', () => {
    const matrix: Record<string, string[]> = {
      ADMIN: [
        'DASHBOARD:CRUD',
        'SUMMARY_REPORTS:CRUD',
        'LOG_SHEETS:CRUD',
        'WORK_REPORTS:CRUD',
        'REPORTS:CRUD',
        'LAB_ANALYSES:CRUD',
        'ATTENDANCE:CRUD',
        'USERS_ADMIN:CRUD',
        'PROJECTS_LIST:R',
        'PROJECTS_ADMIN:CRUD',
        'CLIENTS:CRUD',
        'CHEMICALS:CRUD',
        'PARAMETERS:CRUD',
        'MACHINES:CRUD',
        // NOTIFICATIONS: - (default)
      ],
      SUPERVISOR: [
        'DASHBOARD:CRUD',
        'SUMMARY_REPORTS:CRUD',
        'LOG_SHEETS:CRUD',
        'WORK_REPORTS:CRUD',
        'REPORTS:CRUD',
        'LAB_ANALYSES:CRUD',
        'ATTENDANCE:CRUD',
        'PROJECTS_LIST:R',
        'CHEMICALS:R',
        'PARAMETERS:R',
        'MACHINES:R',
        'NOTIFICATIONS:CRUD',
      ],
      TECHNICIAN: [
        'DASHBOARD:R',
        'LOG_SHEETS:CRU',
        'WORK_REPORTS:CRU',
        'REPORTS:R',
        'ATTENDANCE:CRU',
        'PROJECTS_LIST:R',
        'CHEMICALS:R',
        'PARAMETERS:R',
        'MACHINES:R',
        'NOTIFICATIONS:CRUD',
      ],
      REPORTING: [
        'DASHBOARD:R',
        'SUMMARY_REPORTS:CRU',
        'LOG_SHEETS:CRU',
        'WORK_REPORTS:CRU',
        'REPORTS:CRU',
        'PROJECTS_LIST:R',
        'CHEMICALS:R',
        'PARAMETERS:R',
        'MACHINES:R',
        'NOTIFICATIONS:CRUD',
      ],
      DIRECTOR: [
        'DASHBOARD:R',
        'SUMMARY_REPORTS:R',
        'LOG_SHEETS:R',
        'WORK_REPORTS:R',
        'REPORTS:R',
        'PROJECTS_LIST:R',
        'CHEMICALS:R',
        'PARAMETERS:R',
        'MACHINES:R',
        'NOTIFICATIONS:CRUD',
      ],
      CLIENT: [
        'DASHBOARD:R',
        'SUMMARY_REPORTS:R',
        'LOG_SHEETS:R',
        'WORK_REPORTS:R',
        'REPORTS:R',
        'PROJECTS_LIST:R',
        'CHEMICALS:R',
        'PARAMETERS:R',
        'MACHINES:R',
        'NOTIFICATIONS:CRUD',
      ],
      CLIENT_SUPERVISOR: [
        'DASHBOARD:R',
        'SUMMARY_REPORTS:R',
        'LOG_SHEETS:R',
        'WORK_REPORTS:R',
        'REPORTS:R',
        'PROJECTS_LIST:R',
        'CHEMICALS:R',
        'PARAMETERS:R',
        'MACHINES:R',
        'NOTIFICATIONS:CRUD',
      ],
      CLIENT_TECHNICIAN: [
        'DASHBOARD:R',
        'LOG_SHEETS:CRU',
        'WORK_REPORTS:CRU',
        'REPORTS:R',
        'ATTENDANCE:CRU',
        'PROJECTS_LIST:R',
        'CHEMICALS:R',
        'PARAMETERS:R',
        'MACHINES:R',
        'NOTIFICATIONS:CRUD',
      ],
    };

    allRoles.forEach(role => {
      if (!matrix[role]) return;

      allResources.forEach(res => {
        if (res === RbacResource.PUBLIC) {
          capabilities.forEach(cap => {
            expect(canAccess(role, res, cap)).toBe(true);
          });
          return;
        }

        const expected = matrix[role].find(m => m.startsWith(`${res}:`));
        const level = expected ? expected.split(':')[1] : '-';

        capabilities.forEach(cap => {
          const result = canAccess(role, res as TRbacResource, cap);
          if (level === 'CRUD') expect(result).toBe(true);
          else if (level === 'CRU') expect(result).toBe(cap !== 'delete');
          else if (level === 'R') expect(result).toBe(cap === 'read');
          else expect(result).toBe(false);
        });
      });
    });
  });

  it('denies all for UNKNOWN role (except PUBLIC)', () => {
    allResources.forEach(res => {
      capabilities.forEach(cap => {
        const result = canAccess('UNKNOWN' as any, res as any, cap);
        if (res === RbacResource.PUBLIC) {
          expect(result).toBe(true);
        } else {
          expect(result).toBe(false);
        }
      });
    });
  });

  it('denies all for UNKNOWN resource', () => {
    allRoles.forEach(role => {
      capabilities.forEach(cap => {
        expect(canAccess(role, RbacResource.UNKNOWN, cap)).toBe(false);
      });
    });
  });
});

describe('CLIENT role permissions', () => {
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
