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
 * Internal helper to convert permission level to granular capability set
 */
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
  const level = config?.permissions[resource] ?? '-';
  return permissionSet(level)[capability];
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
  { pattern: /^\/notifications/, resource: RbacResource.NOTIFICATIONS },
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
