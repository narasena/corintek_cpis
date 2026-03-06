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
  NOTIFICATIONS: 'NOTIFICATIONS',
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

export interface IRbacRoleConfig {
  label: string;
  landingPage: string;
  permissions: Partial<Record<TRbacResource, TRbacLevel>>;
}
