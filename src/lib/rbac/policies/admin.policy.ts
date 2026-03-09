import { IRbacRoleConfig } from '../types';

export const ADMIN_POLICY: IRbacRoleConfig = {
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
};
