import type { ProjectStatus } from '@/generated/prisma/client';

export type TProjectAccessWhere = {
  id?: string;
  deletedAt?: Date | null;
  status?: ProjectStatus;
  assignments?: {
    some: {
      userId: string;
      isActive: boolean;
    };
  };
};

export type TProjectActor = {
  id: string;
  role: string;
};

export function isProjectScopedRole(role: string): boolean {
  return (
    role === 'SUPERVISOR' ||
    role === 'TECHNICIAN' ||
    role === 'CLIENT_SUPERVISOR' ||
    role === 'CLIENT_TECHNICIAN'
  );
}

export function buildProjectAccessWhere(
  actor: TProjectActor,
  baseWhere?: TProjectAccessWhere
): TProjectAccessWhere {
  try {
    const safeBase: TProjectAccessWhere = {
      deletedAt: null,
      ...(baseWhere ?? {}),
    };

    if (!isProjectScopedRole(actor.role)) {
      return safeBase;
    }

    return {
      ...safeBase,
      status: 'ONGOING',
      assignments: {
        some: {
          userId: actor.id,
          isActive: true,
        },
      },
    };
  } catch (error) {
    console.error('[CPIS-ERROR] Projects.BuildAccessWhere:', error);
    throw error;
  }
}
