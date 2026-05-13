import {
  RbacResource,
  TRbacResource,
  TRbacCapability,
  RbacRole,
  TRbacRole,
  TRbacLevel,
  TRbacPermissionSet,
  IRbacRoleConfig,
} from './rbac/types';

import { ADMIN_POLICY } from './rbac/policies/admin.policy';
import { STAFF_POLICIES } from './rbac/policies/staff.policy';
import { CLIENT_POLICIES } from './rbac/policies/client.policy';

// Re-export for compatibility
export { RbacResource, RbacRole };
export type { TRbacResource, TRbacCapability, TRbacRole, TRbacLevel };

/**
 * Registry of all role policies
 */
const ROLE_CONFIG: Record<TRbacRole, IRbacRoleConfig> = {
  ADMIN: ADMIN_POLICY,
  ...STAFF_POLICIES,
  ...CLIENT_POLICIES,
} as Record<TRbacRole, IRbacRoleConfig>;

/**
 * Declarative mapping of permission levels to granular capability sets
 */
const PERMISSION_LEVEL_MAP: Record<TRbacLevel, TRbacPermissionSet> = {
  CRUD: { create: true, read: true, update: true, delete: true },
  CRU: { create: true, read: true, update: true, delete: false },
  R: { create: false, read: true, update: false, delete: false },
  '-': { create: false, read: false, update: false, delete: false },
};

/**
 * Core RBAC check
 */
export function canAccess(
  role: string,
  resource: TRbacResource,
  capability: TRbacCapability = 'read'
) {
  if (resource === RbacResource.PUBLIC) return true;
  const config = ROLE_CONFIG[role as TRbacRole];
  const level = (config?.permissions[resource] ?? '-') as TRbacLevel;
  return PERMISSION_LEVEL_MAP[level][capability];
}

/**
 * Throwing wrapper for RBAC check
 */
export function ensureAccess(
  role: string,
  resource: TRbacResource,
  capability: TRbacCapability
) {
  if (!canAccess(role, resource, capability)) {
    throw new Error('Unauthorized');
  }
}

export function getRoleLabel(role: string) {
  return ROLE_CONFIG[role as TRbacRole]?.label ?? role;
}

export function getLandingPage(role: string) {
  return ROLE_CONFIG[role as TRbacRole]?.landingPage ?? '/';
}

/**
 * Creates a strict regex pattern for a path that ensures it matches exactly
 * or is a sub-path, but not a sibling path (e.g. /users matches /users/1 but not /users-backup)
 */
function createPathPattern(path: string): RegExp {
  // Escape special characters and ensure boundary matches end of string, slash, query, or hash
  const escapedPath = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escapedPath}($|/|\\?|#)`);
}

const PATH_RESOURCE_MAP: Array<{
  pattern: RegExp;
  resource: TRbacResource;
}> = [
  { pattern: /^\/?$/, resource: RbacResource.DASHBOARD },
  {
    pattern: createPathPattern('/summary-reports'),
    resource: RbacResource.SUMMARY_REPORTS,
  },
  {
    pattern: createPathPattern('/log-sheets'),
    resource: RbacResource.LOG_SHEETS,
  },
  {
    pattern: createPathPattern('/work-reports'),
    resource: RbacResource.WORK_REPORTS,
  },
  { pattern: createPathPattern('/reports'), resource: RbacResource.REPORTS },
  {
    pattern: createPathPattern('/lab-analyses'),
    resource: RbacResource.LAB_ANALYSES,
  },
  {
    pattern: createPathPattern('/attendance'),
    resource: RbacResource.ATTENDANCE,
  },
  {
    pattern: createPathPattern('/attendance'),
    resource: RbacResource.ATTENDANCE,
  },
  { pattern: createPathPattern('/users'), resource: RbacResource.USERS_ADMIN },
  {
    pattern: createPathPattern('/my-projects'),
    resource: RbacResource.PROJECTS_LIST,
  },
  {
    pattern: createPathPattern('/projects'),
    resource: RbacResource.PROJECTS_ADMIN,
  },
  { pattern: createPathPattern('/clients'), resource: RbacResource.CLIENTS },
  {
    pattern: createPathPattern('/chemicals'),
    resource: RbacResource.CHEMICALS,
  },
  {
    pattern: createPathPattern('/parameters'),
    resource: RbacResource.PARAMETERS,
  },
  { pattern: createPathPattern('/machines'), resource: RbacResource.MACHINES },
  {
    pattern: createPathPattern('/notifications'),
    resource: RbacResource.NOTIFICATIONS,
  },
  { pattern: createPathPattern('/my-profile'), resource: RbacResource.PUBLIC },
];

export function matchPathToResource(pathname: string): TRbacResource {
  const match = PATH_RESOURCE_MAP.find(({ pattern }) => pattern.test(pathname));
  return match?.resource ?? RbacResource.UNKNOWN;
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
