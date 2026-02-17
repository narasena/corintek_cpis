import { describe, it, expect } from 'vitest';
import type { TUserRole } from '@/@types/user.type';
import type { IProjectAssignment } from '../signature';
import {
  deriveWorkReportViewerCapabilities,
  type TWorkReportViewerCapabilities,
} from '../signature-visibility';

function makeAssignments(
  entries: Array<{ role: string; isActive?: boolean }>
): IProjectAssignment[] {
  return entries.map(entry => ({
    userId: 'user-1',
    projectId: 'project-1',
    role: entry.role,
    isActive: entry.isActive ?? true,
  }));
}

function caps(
  role: TUserRole,
  entries: Array<{ role: string; isActive?: boolean }>
): TWorkReportViewerCapabilities {
  return deriveWorkReportViewerCapabilities(role, makeAssignments(entries));
}

describe('deriveWorkReportViewerCapabilities', () => {
  it('allows admin to see and sign all signatures', () => {
    const result = caps('ADMIN', []);
    expect(result).toEqual({
      canSignAsTechnician: true,
      canSignAsClientPic: true,
      canSeeSignatureControls: true,
      canSeeSignaturePreviews: true,
    });
  });

  it('allows technician with assignment to sign as technician only', () => {
    const result = caps('TECHNICIAN', [{ role: 'TECHNICIAN' }]);
    expect(result).toEqual({
      canSignAsTechnician: true,
      canSignAsClientPic: false,
      canSeeSignatureControls: true,
      canSeeSignaturePreviews: true,
    });
  });

  it('blocks technician without assignment from signing', () => {
    const result = caps('TECHNICIAN', []);
    expect(result).toEqual({
      canSignAsTechnician: false,
      canSignAsClientPic: false,
      canSeeSignatureControls: false,
      canSeeSignaturePreviews: true,
    });
  });

  it('allows client supervisor with CLIENT_PIC assignment to sign as client PIC', () => {
    const result = caps('CLIENT_SUPERVISOR', [{ role: 'CLIENT_PIC' }]);
    expect(result).toEqual({
      canSignAsTechnician: false,
      canSignAsClientPic: true,
      canSeeSignatureControls: true,
      canSeeSignaturePreviews: true,
    });
  });

  it('blocks client role without CLIENT_PIC assignment from signing', () => {
    const result = caps('CLIENT_SUPERVISOR', []);
    expect(result).toEqual({
      canSignAsTechnician: false,
      canSignAsClientPic: false,
      canSeeSignatureControls: false,
      canSeeSignaturePreviews: true,
    });
  });
});
