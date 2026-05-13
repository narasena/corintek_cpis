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
  /**
   * For internal use: advanced OR conditions not expressible via direct fields
   */
  OR?: Array<Record<string, unknown>>;
};

export type TProjectActor = {
  id: string;
  role: string;
};

export function isProjectScopedRole(role: string): boolean {
  return (
    role === 'SUPERVISOR' ||
    role === 'TECHNICIAN' ||
    role === 'CLIENT' ||
    role === 'CLIENT_SUPERVISOR' ||
    role === 'CLIENT_TECHNICIAN'
  );
}

export function buildProjectAccessWhere(
  actor: TProjectActor,
  baseWhere?: Omit<TProjectAccessWhere, 'OR'>
): TProjectAccessWhere {
  try {
    const safeBase: TProjectAccessWhere = {
      deletedAt: null,
      ...(baseWhere ?? {}),
    };

    if (!isProjectScopedRole(actor.role)) {
      return safeBase;
    }

    // Project-scoped roles: require ONGOING status AND (assignment OR replacement relationship)
    return {
      ...safeBase,
      status: 'ONGOING',
      OR: [
        {
          assignments: {
            some: {
              userId: actor.id,
              isActive: true,
            },
          },
        },
        {
          logSheets: {
            some: {
              replacedByUserId: actor.id,
              deletedAt: null,
            },
          },
        },
      ],
    };
  } catch (error) {
    console.error('[CPIS-ERROR] Projects.BuildAccessWhere:', error);
    throw error;
  }
}
