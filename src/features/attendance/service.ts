import { prisma } from '@/lib/prisma';
import type { IJwtPayload } from '@/@types/auth.type';
import type {
  TAttendanceListFilters,
  TClockInInput,
  TClockOutInput,
  TTechnicianAttendanceStatus,
  TSupervisorAttendanceFilter,
  TSupervisorAttendanceResponse,
} from './types';
import { calculateOffset } from '@/lib/pagination-helpers';

function getJakartaDateLocal(date: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function ensureAdminOrSupervisor(actor: IJwtPayload) {
  if (actor.role !== 'ADMIN' && actor.role !== 'SUPERVISOR') {
    throw new Error('Unauthorized');
  }
}

function computeTotalHours(clockInAt: Date, clockOutAt: Date) {
  const diffMs = clockOutAt.getTime() - clockInAt.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  if (diffHours <= 0) {
    throw new Error('Jam pulang harus lebih besar dari jam masuk');
  }
  return Math.round(diffHours * 100) / 100;
}

export async function createClockIn(input: TClockInInput) {
  const existing = await prisma.attendance.findUnique({
    where: {
      userId_dateLocal: { userId: input.userId, dateLocal: input.dateLocal },
    },
  });

  if (existing && !existing.deletedAt) {
    throw new Error('Anda sudah absen masuk hari ini');
  }

  return prisma.attendance.create({
    data: {
      userId: input.userId,
      dateLocal: input.dateLocal,
      clockInAt: input.clockInAt,
      clockInPhotoUrl: input.clockInPhotoUrl,
      status: 'OPEN',
    },
  });
}

export async function createClockOut(input: TClockOutInput) {
  const existing = await prisma.attendance.findUnique({
    where: {
      userId_dateLocal: { userId: input.userId, dateLocal: input.dateLocal },
    },
  });

  if (!existing || existing.deletedAt) {
    throw new Error('Data absensi hari ini tidak ditemukan');
  }

  if (existing.status !== 'OPEN') {
    throw new Error('Anda sudah absen pulang hari ini');
  }

  const totalHours = computeTotalHours(existing.clockInAt, input.clockOutAt);

  return prisma.attendance.update({
    where: { id: existing.id },
    data: {
      clockOutAt: input.clockOutAt,
      clockOutPhotoUrl: input.clockOutPhotoUrl,
      totalHours,
      status: 'CLOSED',
    },
  });
}

export async function getTodayAttendance(userId: string, dateLocal: string) {
  return prisma.attendance.findUnique({
    where: { userId_dateLocal: { userId, dateLocal } },
  });
}

export async function listAttendance(
  actor: IJwtPayload,
  filters: TAttendanceListFilters
) {
  ensureAdminOrSupervisor(actor);

  return prisma.attendance.findMany({
    where: {
      deletedAt: null,
      dateLocal: { gte: filters.dateFrom, lte: filters.dateTo },
      ...(filters.userId ? { userId: filters.userId } : {}),
      ...(filters.projectId
        ? {
            user: {
              projectAssignments: {
                some: { projectId: filters.projectId, role: 'TECHNICIAN' },
              },
            },
          }
        : {}),
    },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
    orderBy: [{ dateLocal: 'desc' }, { clockInAt: 'desc' }],
  });
}

export async function listOwnAttendance(
  userId: string,
  dateFrom: string,
  dateTo: string
) {
  return prisma.attendance.findMany({
    where: {
      userId,
      deletedAt: null,
      dateLocal: { gte: dateFrom, lte: dateTo },
    },
    orderBy: [{ dateLocal: 'desc' }, { clockInAt: 'desc' }],
  });
}

function csvEscape(value: unknown) {
  const s = value === null || value === undefined ? '' : String(value);
  if (/[",\r\n]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

export async function exportAttendanceCsv(
  actor: IJwtPayload,
  filters: TAttendanceListFilters
) {
  const rows = await listAttendance(actor, filters);

  const header = [
    'Tanggal',
    'Teknisi',
    'Email',
    'Absen Masuk',
    'Absen Pulang',
    'Total Jam',
    'Status',
  ];

  const lines = [header.map(csvEscape).join(',')];

  for (const row of rows) {
    const techName = [row.user.firstName, row.user.lastName]
      .filter(Boolean)
      .join(' ');
    lines.push(
      [
        row.dateLocal,
        techName,
        row.user.email,
        row.clockInAt.toISOString(),
        row.clockOutAt ? row.clockOutAt.toISOString() : '',
        row.totalHours ?? '',
        row.status,
      ]
        .map(csvEscape)
        .join(',')
    );
  }

  return lines.join('\r\n');
}

export async function getTechniciansForSupervisor(
  supervisorUserId: string,
  filters?: TSupervisorAttendanceFilter
): Promise<TSupervisorAttendanceResponse> {
  const dateFrom = filters?.dateFrom ?? getJakartaDateLocal(new Date());
  const dateTo = filters?.dateTo ?? dateFrom;
  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 10;

  // Get project IDs where this user is PROJECT_PIC (internal PIC / SUPERVISOR)
  const picAssignments = await prisma.projectAssignment.findMany({
    where: {
      userId: supervisorUserId,
      role: 'PROJECT_PIC',
      isActive: true,
    },
    select: { projectId: true },
  });

  const allProjectIds = picAssignments.map(p => p.projectId);
  if (allProjectIds.length === 0) {
    return { technicians: [], projects: [], total: 0, page, limit, totalPages: 0 };
  }

  // If projectId filter is set, scope to that project
  const projectIds = filters?.projectId
    ? allProjectIds.filter(id => id === filters.projectId)
    : allProjectIds;

  if (projectIds.length === 0) {
    return { technicians: [], projects: [], total: 0, page, limit, totalPages: 0 };
  }

  // Get supervisor's projects for the dropdown
  const supervisorProjects = await prisma.project.findMany({
    where: { id: { in: allProjectIds }, deletedAt: null },
    select: { id: true, name: true },
  });

  // Get technicians assigned to these projects, with their project info
  const technicianAssignments = await prisma.projectAssignment.findMany({
    where: {
      projectId: { in: projectIds },
      role: 'TECHNICIAN',
      isActive: true,
    },
    select: {
      userId: true,
      projectId: true,
      project: { select: { id: true, name: true } },
    },
  });

  if (technicianAssignments.length === 0) {
    return { technicians: [], projects: supervisorProjects, total: 0, page, limit, totalPages: 0 };
  }

  // Group by technician, collecting project names
  const techProjectMap = new Map<string, Set<string>>();
  for (const ta of technicianAssignments) {
    if (!techProjectMap.has(ta.userId)) {
      techProjectMap.set(ta.userId, new Set());
    }
    techProjectMap.get(ta.userId)!.add(ta.project.name);
  }

  const technicianIds = [...techProjectMap.keys()];

  // Build user query with optional search filter
  const userWhere: Record<string, unknown> = {
    id: { in: technicianIds },
    isActive: true,
    deletedAt: null,
  };

  if (filters?.search) {
    const s = filters.search;
    userWhere.OR = [
      { firstName: { contains: s, mode: 'insensitive' } },
      { lastName: { contains: s, mode: 'insensitive' } },
    ];
  }

  // Count total matching technicians (for pagination)
  const total = await prisma.user.count({
    where: userWhere as any,
  });

  const totalPages = Math.ceil(total / limit);
  const skip = calculateOffset(page, limit);

  const technicians = await prisma.user.findMany({
    where: userWhere as any,
    skip,
    take: limit,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      avatarUrl: true,
      attendances: {
        where: {
          dateLocal: { gte: dateFrom, lte: dateTo },
          deletedAt: null,
        },
        orderBy: { dateLocal: 'desc' },
        take: 1,
        select: {
          clockInAt: true,
          clockOutAt: true,
          status: true,
          dateLocal: true,
        },
      },
    },
  });

  return {
    technicians: technicians.map(tech => {
      const attendance = tech.attendances[0];
      let attendanceStatus: TTechnicianAttendanceStatus['attendanceStatus'] =
        'BELUM_ABSEN';

      if (attendance) {
        attendanceStatus =
          attendance.status === 'OPEN' ? 'SUDAH_ABSEN' : 'SUDAH_PULANG';
      }

      return {
        id: tech.id,
        firstName: tech.firstName,
        lastName: tech.lastName,
        email: tech.email,
        avatarUrl: tech.avatarUrl,
        attendanceStatus,
        clockInAt: attendance?.clockInAt ?? null,
        clockOutAt: attendance?.clockOutAt ?? null,
        dateLocal: attendance?.dateLocal ?? dateFrom,
        projectNames: [...(techProjectMap.get(tech.id) ?? [])],
      };
    }),
    projects: supervisorProjects,
    total,
    page,
    limit,
    totalPages,
  };
}
