import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  FileSpreadsheet,
  FileText,
  Microscope,
  FlaskConical,
  SlidersHorizontal,
  Users,
  Clock,
  BookUser,
} from 'lucide-react';

/**
 * Navigation Configuration Schema
 *
 * Grouped for better logical separation in the UI and easier maintenance.
 */
export const NAV_CONFIG = {
  platform: [
    {
      title: 'Dashboard',
      url: '/',
      icon: LayoutDashboard,
    },
  ],
  operations: [
    {
      title: 'Proyek',
      url: '/projects',
      icon: Building2,
    },
    {
      title: 'Absensi',
      url: '/attendance',
      icon: Clock,
    },
    {
      title: 'Log Sheets',
      url: '/log-sheets',
      icon: FileSpreadsheet,
    },
    {
      title: 'Work Reports',
      url: '/work-reports',
      icon: FileText,
    },
    {
      title: 'Summary Reports',
      url: '/summary-reports',
      icon: ClipboardList,
    },
    {
      title: 'Lab Analyses',
      url: '/lab-analyses',
      icon: Microscope,
    },
  ],
  inventory: [
    {
      title: 'Chemicals',
      url: '/chemicals',
      icon: FlaskConical,
    },
    {
      title: 'Parameters',
      url: '/parameters',
      icon: SlidersHorizontal,
    },
  ],
  administration: [
    {
      title: 'Clients',
      url: '/clients',
      icon: BookUser,
    },
    {
      title: 'Users',
      url: '/users',
      icon: Users,
    },
  ],
} as const;
