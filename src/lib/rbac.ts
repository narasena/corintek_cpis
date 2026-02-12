export const RbacResource = {
  DASHBOARD: 'DASHBOARD',
  SUMMARY_REPORTS: 'SUMMARY_REPORTS',
  LOG_SHEETS: 'LOG_SHEETS',
  WORK_REPORTS: 'WORK_REPORTS',
  REPORTS: 'REPORTS',
  LAB_ANALYSES: 'LAB_ANALYSES',
  ATTENDANCE: 'ATTENDANCE',
  USERS_ADMIN: 'USERS_ADMIN',
  PROJECTS_LIST: 'PROJECTS_LIST',
  PROJECTS_ADMIN: 'PROJECTS_ADMIN',
  MASTER_DATA: 'MASTER_DATA',
} as const;

export type TRbacResource = (typeof RbacResource)[keyof typeof RbacResource];

export type TRbacCapability = 'create' | 'read' | 'update' | 'delete';

export const RbacRole = {
  ADMIN: 'ADMIN',
  SUPERVISOR: 'SUPERVISOR',
  TECHNICIAN: 'TECHNICIAN',
  REPORTING: 'REPORTING',
  DIRECTOR: 'DIRECTOR',
  CLIENT_TECHNICIAN: 'CLIENT_TECHNICIAN',
  CLIENT_SUPERVISOR: 'CLIENT_SUPERVISOR',
} as const;

export type TRbacRole = (typeof RbacRole)[keyof typeof RbacRole];

export type TRbacPermissionSet = Record<TRbacCapability, boolean>;

function permissionSet(level: 'CRUD' | 'CRU' | 'R' | '-'): TRbacPermissionSet {
  if (level === 'CRUD') {
    return { create: true, read: true, update: true, delete: true };
  }
  if (level === 'CRU') {
    return { create: true, read: true, update: true, delete: false };
  }
  if (level === 'R') {
    return { create: false, read: true, update: false, delete: false };
  }
  return { create: false, read: false, update: false, delete: false };
}

const ROLE_MATRIX: Record<
  TRbacRole,
  Partial<Record<TRbacResource, 'CRUD' | 'CRU' | 'R' | '-'>>
> = {
  ADMIN: {
    DASHBOARD: 'CRUD',
    SUMMARY_REPORTS: 'CRUD',
    LOG_SHEETS: 'CRUD',
    WORK_REPORTS: 'CRUD',
    REPORTS: 'CRUD',
    LAB_ANALYSES: 'CRUD',
    ATTENDANCE: 'CRUD',
    USERS_ADMIN: 'CRUD',
    PROJECTS_LIST: 'R',
    PROJECTS_ADMIN: 'CRUD',
    MASTER_DATA: 'CRUD',
  },
  SUPERVISOR: {
    DASHBOARD: 'CRUD',
    SUMMARY_REPORTS: 'CRUD',
    LOG_SHEETS: 'CRUD',
    WORK_REPORTS: 'CRUD',
    REPORTS: 'CRUD',
    LAB_ANALYSES: 'CRUD',
    ATTENDANCE: 'CRUD',
    PROJECTS_LIST: 'R',
    PROJECTS_ADMIN: '-',
    USERS_ADMIN: '-',
    MASTER_DATA: '-',
  },
  TECHNICIAN: {
    DASHBOARD: 'R',
    SUMMARY_REPORTS: '-',
    LOG_SHEETS: 'CRU',
    WORK_REPORTS: 'CRU',
    REPORTS: 'R',
    LAB_ANALYSES: '-',
    ATTENDANCE: 'CRU',
    USERS_ADMIN: '-',
    PROJECTS_LIST: 'R',
    PROJECTS_ADMIN: '-',
    MASTER_DATA: '-',
  },
  REPORTING: {
    DASHBOARD: 'R',
    SUMMARY_REPORTS: 'CRU',
    LOG_SHEETS: 'CRU',
    WORK_REPORTS: 'CRU',
    REPORTS: 'CRU',
    LAB_ANALYSES: '-',
    ATTENDANCE: '-',
    USERS_ADMIN: '-',
    PROJECTS_LIST: 'R',
    PROJECTS_ADMIN: '-',
    MASTER_DATA: '-',
  },
  DIRECTOR: {
    DASHBOARD: 'R',
    SUMMARY_REPORTS: 'R',
    LOG_SHEETS: 'R',
    WORK_REPORTS: 'R',
    REPORTS: 'R',
    LAB_ANALYSES: '-',
    ATTENDANCE: '-',
    USERS_ADMIN: '-',
    PROJECTS_LIST: 'R',
    PROJECTS_ADMIN: '-',
    MASTER_DATA: '-',
  },
  CLIENT_SUPERVISOR: {
    DASHBOARD: 'R',
    SUMMARY_REPORTS: 'R',
    LOG_SHEETS: 'R',
    WORK_REPORTS: 'R',
    REPORTS: 'R',
    LAB_ANALYSES: '-',
    ATTENDANCE: '-',
    USERS_ADMIN: '-',
    PROJECTS_LIST: 'R',
    PROJECTS_ADMIN: '-',
    MASTER_DATA: '-',
  },
  CLIENT_TECHNICIAN: {
    DASHBOARD: 'R',
    SUMMARY_REPORTS: '-',
    LOG_SHEETS: 'CRU',
    WORK_REPORTS: 'CRU',
    REPORTS: 'R',
    LAB_ANALYSES: '-',
    ATTENDANCE: 'CRU',
    USERS_ADMIN: '-',
    PROJECTS_LIST: 'R',
    PROJECTS_ADMIN: '-',
    MASTER_DATA: '-',
  },
};

export function canAccess(
  role: string,
  resource: TRbacResource,
  capability: TRbacCapability = 'read'
) {
  const level = ROLE_MATRIX[role as TRbacRole]?.[resource] ?? '-';
  return permissionSet(level)[capability];
}

export function ensureAccess(
  role: string,
  resource: TRbacResource,
  capability: TRbacCapability
) {
  if (!canAccess(role as any, resource, capability)) {
    throw new Error('Unauthorized');
  }
}

export function getRoleLabel(role: string) {
  switch (role) {
    case 'ADMIN':
      return 'Super Admin';
    case 'SUPERVISOR':
      return 'PIC Project';
    case 'TECHNICIAN':
      return 'Teknisi';
    case 'REPORTING':
      return 'Reporting';
    case 'DIRECTOR':
      return 'Direksi';
    case 'CLIENT_SUPERVISOR':
      return 'Klien';
    case 'CLIENT_TECHNICIAN':
      return 'Teknisi (Klien)';
    default:
      return role;
  }
}

export function matchPathToResource(pathname: string): TRbacResource | null {
  if (pathname === '/' || pathname === '') return RbacResource.DASHBOARD;
  if (pathname.startsWith('/summary-reports'))
    return RbacResource.SUMMARY_REPORTS;
  if (pathname.startsWith('/log-sheets')) return RbacResource.LOG_SHEETS;
  if (pathname.startsWith('/work-reports')) return RbacResource.WORK_REPORTS;
  if (pathname.startsWith('/reports')) return RbacResource.REPORTS;
  if (pathname.startsWith('/lab-analyses')) return RbacResource.LAB_ANALYSES;
  if (pathname.startsWith('/attendance') || pathname.startsWith('/absence'))
    return RbacResource.ATTENDANCE;
  if (pathname.startsWith('/users')) return RbacResource.USERS_ADMIN;
  if (pathname.startsWith('/my-projects')) return RbacResource.PROJECTS_LIST;
  if (pathname.startsWith('/projects')) return RbacResource.PROJECTS_ADMIN;
  if (
    pathname.startsWith('/clients') ||
    pathname.startsWith('/chemicals') ||
    pathname.startsWith('/parameters') ||
    pathname.startsWith('/machines')
  ) {
    return RbacResource.MASTER_DATA;
  }
  return null;
}

export function filterNavItems<T extends { url: string }>(
  role: string,
  items: T[]
) {
  return items.filter(item => {
    const resource = matchPathToResource(item.url);
    if (!resource) return true;
    return canAccess(role, resource, 'read');
  });
}
