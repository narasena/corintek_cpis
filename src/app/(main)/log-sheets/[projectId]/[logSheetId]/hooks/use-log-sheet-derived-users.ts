import { useMemo } from 'react';
import { formatUserName } from '@/lib/utils/user';
import type { TDetail } from '../types';

interface IDerivedUsers {
  assignedProjectPicName: string;
  assignedClientPicName: string;
  submittedByName: string;
  approvedByName: string | null;
  corintekPicName: string;
  clientPicName: string;
  technicianSignedByName: string | null;
  clientPicSignedByName: string | null;
  canSignTechnician: boolean;
  canSignClientPic: boolean;
  canAdminOverride: boolean;
}

export function useLogSheetDerivedUsers(detail: TDetail | null): IDerivedUsers {
  return useMemo(() => {
    if (!detail) {
      return getEmptyDerivedUsers();
    }

    return computeDerivedUsers(detail);
  }, [detail]);
}

function getEmptyDerivedUsers(): IDerivedUsers {
  return {
    assignedProjectPicName: '-',
    assignedClientPicName: '-',
    submittedByName: '-',
    approvedByName: null,
    corintekPicName: '-',
    clientPicName: '-',
    technicianSignedByName: null,
    clientPicSignedByName: null,
    canSignTechnician: false,
    canSignClientPic: false,
    canAdminOverride: false,
  };
}

function computeDerivedUsers(detail: TDetail): IDerivedUsers {
  const assignments = detail.project.assignments ?? [];

  const assignedProjectPicName = formatUserName(
    assignments.find(a => a.role === 'PROJECT_PIC')?.user
  );
  const assignedClientPicName = formatUserName(
    assignments.find(a => a.role === 'CLIENT_PIC')?.user
  );
  const submittedByName = formatUserName(detail.logSheet.submittedBy);
  const approvedByName = detail.logSheet.approvedBy
    ? formatUserName(detail.logSheet.approvedBy)
    : null;

  return {
    assignedProjectPicName,
    assignedClientPicName,
    submittedByName,
    approvedByName,
    corintekPicName: approvedByName ?? assignedProjectPicName ?? '-',
    clientPicName: assignedClientPicName ?? '-',
    technicianSignedByName: formatUserName(detail.logSheet.technicianSignedBy),
    clientPicSignedByName: formatUserName(detail.logSheet.clientPicSignedBy),
    canSignTechnician: getCanSignTechnician(detail.viewerRole),
    canSignClientPic: getCanSignClientPic(detail.viewerRole),
    canAdminOverride: getCanAdminOverride(
      detail.viewerRole,
      detail.logSheet.status
    ),
  };
}

function getCanSignTechnician(role: string): boolean {
  return role === 'ADMIN' || role === 'TECHNICIAN';
}

function getCanSignClientPic(role: string): boolean {
  return (
    role === 'ADMIN' ||
    role === 'CLIENT_TECHNICIAN' ||
    role === 'CLIENT_SUPERVISOR'
  );
}

function getCanAdminOverride(role: string, status: string): boolean {
  return role === 'ADMIN' && status !== 'DRAFT';
}
