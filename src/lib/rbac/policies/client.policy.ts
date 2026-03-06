import { IRbacRoleConfig, TRbacRole } from '../types';

export const CLIENT_POLICIES: Partial<Record<TRbacRole, IRbacRoleConfig>> = {
  CLIENT: {
    label: 'Klien',
    landingPage: '/my-projects',
    permissions: {
      DASHBOARD: 'R',
      SUMMARY_REPORTS: 'R',
      LOG_SHEETS: 'R',
      WORK_REPORTS: 'R',
      REPORTS: 'R',
      PROJECTS_LIST: 'R',
      CHEMICALS: 'R',
      PARAMETERS: 'R',
      MACHINES: 'R',
      NOTIFICATIONS: 'CRUD',
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
      PROJECTS_LIST: 'R',
      CHEMICALS: 'R',
      PARAMETERS: 'R',
      MACHINES: 'R',
      NOTIFICATIONS: 'CRUD',
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
      CHEMICALS: 'R',
      PARAMETERS: 'R',
      MACHINES: 'R',
      NOTIFICATIONS: 'CRUD',
    },
  },
};
