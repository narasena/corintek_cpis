import { prisma } from '@/lib/prisma';
import type { IJwtPayload } from '@/@types/auth.type';
import type {
  TAttendanceListFilters,
  TClockInInput,
  TClockOutInput,
} from './types';

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
    },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
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
