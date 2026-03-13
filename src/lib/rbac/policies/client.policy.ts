import { IRbacRoleConfig, TRbacRole } from '../types';

const BASE_CLIENT_POLICY: Omit<IRbacRoleConfig, 'label'> = {
  landingPage: '/my-projects',
  permissions: {
    DASHBOARD: 'R',
    SUMMARY_REPORTS: 'R',
    LOG_SHEETS: 'R',
    WORK_REPORTS: 'R',
    REPORTS: 'R',
    PROJECTS_LIST: 'R',
    MACHINES: 'R',
    NOTIFICATIONS: 'CRUD',
  },
};

export const CLIENT_POLICIES: Partial<Record<TRbacRole, IRbacRoleConfig>> = {
  CLIENT: {
    label: 'Klien',
    ...BASE_CLIENT_POLICY,
  },
  CLIENT_SUPERVISOR: {
    label: 'PIC Klien',
    ...BASE_CLIENT_POLICY,
    permissions: {
      ...BASE_CLIENT_POLICY.permissions,
      LOG_SHEETS: 'CRU',
      WORK_REPORTS: 'CRU',
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
      PROJECTS_LIST: 'R',
      CHEMICALS: '-',
      PARAMETERS: '-',
      MACHINES: 'R',
      NOTIFICATIONS: 'CRUD',
    },
  },
};
