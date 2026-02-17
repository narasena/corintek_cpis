import type { TWorkReportStatus } from './types';

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
