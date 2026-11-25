import type { TWorkReportStatus } from './types';

/**
 * Statuses a generic edit may persist. APPROVED is intentionally excluded:
 * approval must go through updateWorkReportStatus, which enforces the
 * dedicated transition rules and project PIC restriction.
 */
export const EDITABLE_WORK_REPORT_STATUSES = ['DRAFT', 'SUBMITTED'] as const;

export function assertEditableWorkReportStatus(status?: string): void {
  if (status === undefined) return;
  if (!(EDITABLE_WORK_REPORT_STATUSES as readonly string[]).includes(status)) {
    throw new Error('Status laporan tidak valid');
  }
}

type StatusTransitionContext = {
  isProjectPic: boolean;
};

export function assertValidStatusTransition(
  current: TWorkReportStatus,
  desired: TWorkReportStatus,
  context: StatusTransitionContext
): void {
  if (desired === current) {
    return;
  }

  if (desired === 'SUBMITTED') {
    if (current !== 'DRAFT') {
      throw new Error('Work report hanya bisa dikirim dari status DRAFT');
    }
    return;
  }

  if (desired === 'APPROVED') {
    if (current !== 'SUBMITTED') {
      throw new Error('Work report hanya bisa disetujui dari status SUBMITTED');
    }
    if (!context.isProjectPic) {
      throw new Error('Unauthorized');
    }
    return;
  }

  if (desired === 'DRAFT') {
    throw new Error('Tidak dapat mengubah status kembali ke DRAFT');
  }
}
