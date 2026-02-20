import type { IJwtPayload } from '@/@types/auth.type';

export interface IProjectAccessServices {
  assertCanAccessProject: (
    actor: IJwtPayload,
    projectId: string
  ) => Promise<void>;
  getAccessibleProjectIds: (
    actor: IJwtPayload
  ) => Promise<string[] | undefined | null>;
}

export async function resolveTargetProjectIds(
  actor: IJwtPayload,
  requestedProjectId: string | undefined,
  services: IProjectAccessServices
): Promise<string[] | 'empty' | undefined> {
  if (requestedProjectId) {
    await services.assertCanAccessProject(actor, requestedProjectId);
    return [requestedProjectId];
  }

  const allowedIds = await services.getAccessibleProjectIds(actor);
  if (allowedIds) {
    if (allowedIds.length === 0) return 'empty';
    return allowedIds;
  }

  return undefined;
}
