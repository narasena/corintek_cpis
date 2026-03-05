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
  CLIENTS: 'CLIENTS',
  CHEMICALS: 'CHEMICALS',
  PARAMETERS: 'PARAMETERS',
  MACHINES: 'MACHINES',
  PUBLIC: 'PUBLIC',
  UNKNOWN: 'UNKNOWN',
} as const;

export type TRbacResource = (typeof RbacResource)[keyof typeof RbacResource];

export type TRbacCapability = 'create' | 'read' | 'update' | 'delete';

export const RbacRole = {
  ADMIN: 'ADMIN',
  SUPERVISOR: 'SUPERVISOR',
  TECHNICIAN: 'TECHNICIAN',
  REPORTING: 'REPORTING',
  DIRECTOR: 'DIRECTOR',
  CLIENT: 'CLIENT',
  CLIENT_TECHNICIAN: 'CLIENT_TECHNICIAN',
  CLIENT_SUPERVISOR: 'CLIENT_SUPERVISOR',
} as const;

export type TRbacRole = (typeof RbacRole)[keyof typeof RbacRole];

export type TRbacLevel = 'CRUD' | 'CRU' | 'R' | '-';

export type TRbacPermissionSet = Record<TRbacCapability, boolean>;

interface IRbacRoleConfig {
  label: string;
  landingPage: string;
  permissions: Partial<Record<TRbacResource, TRbacLevel>>;
}

function permissionSet(level: TRbacLevel): TRbacPermissionSet {
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

const ROLE_CONFIG: Record<TRbacRole, IRbacRoleConfig> = {
  ADMIN: {
    label: 'Super Admin',
    landingPage: '/users',
    permissions: {
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
      CLIENTS: 'CRUD',
      CHEMICALS: 'CRUD',
      PARAMETERS: 'CRUD',
      MACHINES: 'CRUD',
    },
  },
  SUPERVISOR: {
    label: 'PIC Project',
    landingPage: '/',
    permissions: {
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
      CLIENTS: '-',
      CHEMICALS: '-',
      PARAMETERS: '-',
      MACHINES: '-',
    },
  },
  TECHNICIAN: {
    label: 'Teknisi',
    landingPage: '/attendance',
    permissions: {
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
      CLIENTS: '-',
      CHEMICALS: '-',
      PARAMETERS: '-',
      MACHINES: '-',
    },
  },
  REPORTING: {
    label: 'Reporting',
    landingPage: '/summary-reports',
    permissions: {
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
      CLIENTS: '-',
      CHEMICALS: '-',
      PARAMETERS: '-',
      MACHINES: '-',
    },
  },
  DIRECTOR: {
    label: 'Direksi',
    landingPage: '/',
    permissions: {
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
      CLIENTS: '-',
      CHEMICALS: '-',
      PARAMETERS: '-',
      MACHINES: '-',
    },
  },
  CLIENT: {
    label: 'Klien',
    landingPage: '/my-projects',
    permissions: {
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
      CLIENTS: '-',
      CHEMICALS: '-',
      PARAMETERS: '-',
      MACHINES: '-',
    },
  },
  CLIENT_SUPERVISOR: {
    label: 'PIC Klien',
    landingPage: '/my-projects',
    permissions: {
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
      CLIENTS: '-',
      CHEMICALS: '-',
      PARAMETERS: '-',
      MACHINES: '-',
    },
  },
  CLIENT_TECHNICIAN: {
    label: 'Teknisi (Klien)',
    landingPage: '/attendance',
    permissions: {
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
      CLIENTS: '-',
      CHEMICALS: '-',
      PARAMETERS: '-',
      MACHINES: '-',
    },
  },
};

export function canAccess(
  role: string,
  resource: TRbacResource,
  capability: TRbacCapability = 'read'
) {
  if (resource === RbacResource.PUBLIC) return true;
  const config = ROLE_CONFIG[role as TRbacRole];
  const level = config?.permissions[resource] ?? '-';
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
  return ROLE_CONFIG[role as TRbacRole]?.label ?? role;
}

export function getLandingPage(role: string) {
  return ROLE_CONFIG[role as TRbacRole]?.landingPage ?? '/';
}



const PATH_RESOURCE_MAP: Array<{
  pattern: string | RegExp;
  resource: TRbacResource;
}> = [
  { pattern: /^\/?$/, resource: RbacResource.DASHBOARD },
  { pattern: /^\/summary-reports/, resource: RbacResource.SUMMARY_REPORTS },
  { pattern: /^\/log-sheets/, resource: RbacResource.LOG_SHEETS },
  { pattern: /^\/work-reports/, resource: RbacResource.WORK_REPORTS },
  { pattern: /^\/reports/, resource: RbacResource.REPORTS },
  { pattern: /^\/lab-analyses/, resource: RbacResource.LAB_ANALYSES },
  { pattern: /^\/attendance/, resource: RbacResource.ATTENDANCE },
  { pattern: /^\/absence/, resource: RbacResource.ATTENDANCE },
  { pattern: /^\/users/, resource: RbacResource.USERS_ADMIN },
  { pattern: /^\/my-projects/, resource: RbacResource.PROJECTS_LIST },
  { pattern: /^\/projects/, resource: RbacResource.PROJECTS_ADMIN },
  { pattern: /^\/clients/, resource: RbacResource.CLIENTS },
  { pattern: /^\/chemicals/, resource: RbacResource.CHEMICALS },
  { pattern: /^\/parameters/, resource: RbacResource.PARAMETERS },
  { pattern: /^\/machines/, resource: RbacResource.MACHINES },
];

export function matchPathToResource(pathname: string): TRbacResource {
  for (const { pattern, resource } of PATH_RESOURCE_MAP) {
    if (typeof pattern === 'string') {
      if (pathname === pattern) return resource;
    } else if (pattern.test(pathname)) {
      return resource;
    }
  }
  return RbacResource.UNKNOWN;
}

export function filterNavItems<T extends { url: string }>(
  role: string,
  items: T[]
) {
  return items.filter(item => {
    const resource = matchPathToResource(item.url);
    return canAccess(role, resource, 'read');
  });
}
