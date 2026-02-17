import type { TUserRole } from '@/@types/user.type';
import type { IProjectAssignment } from './signature';

export type TWorkReportViewerCapabilities = {
  canSignAsTechnician: boolean;
  canSignAsClientPic: boolean;
  canSeeSignatureControls: boolean;
  canSeeSignaturePreviews: boolean;
};

export function deriveWorkReportViewerCapabilities(
  actorRole: TUserRole,
  assignments: IProjectAssignment[]
): TWorkReportViewerCapabilities {
  const hasTechnicianAssignment = assignments.some(
    a => a.role === 'TECHNICIAN' && a.isActive
  );

  const hasClientPicAssignment = assignments.some(
    a => a.role === 'CLIENT_PIC' && a.isActive
  );

  const isClientRole =
    actorRole === 'CLIENT_TECHNICIAN' || actorRole === 'CLIENT_SUPERVISOR';

  const canSignAsTechnician =
    actorRole === 'TECHNICIAN' && hasTechnicianAssignment;

  const canSignAsClientPic = isClientRole && hasClientPicAssignment;

  const isAdmin = actorRole === 'ADMIN';

  return {
    canSignAsTechnician: isAdmin || canSignAsTechnician,
    canSignAsClientPic: isAdmin || canSignAsClientPic,
    canSeeSignatureControls:
      isAdmin || canSignAsTechnician || canSignAsClientPic,
    canSeeSignaturePreviews: true,
  };
}
