import type { TLogSheetStatus } from './types';

export interface ILogSheetStatusTransitionContext {
  current: TLogSheetStatus;
  target: TLogSheetStatus;
  isInternalPic: boolean;
  isInternalTechnician: boolean;
}

export type TLogSheetStatusTransitionDecision =
  | { ok: true; requiresApprovalValidation: boolean }
  | { ok: false; error: string };

export function decideLogSheetStatusTransition(
  context: ILogSheetStatusTransitionContext
): TLogSheetStatusTransitionDecision {
  const { current, target, isInternalPic, isInternalTechnician } = context;

  if (target === 'SUBMITTED') {
    if (current !== 'DRAFT') {
      return {
        ok: false,
        error: 'Log sheet hanya bisa dikirim dari status DRAFT',
      };
    }
    if (!isInternalTechnician && !isInternalPic) {
      return { ok: false, error: 'Unauthorized' };
    }
    return { ok: true, requiresApprovalValidation: false };
  }

  if (target === 'APPROVED') {
    if (current !== 'SUBMITTED') {
      return {
        ok: false,
        error: 'Log sheet hanya bisa disetujui dari status SUBMITTED',
      };
    }
    if (!isInternalPic) {
      return { ok: false, error: 'Unauthorized' };
    }
    return { ok: true, requiresApprovalValidation: true };
  }

  if (target === 'DRAFT') {
    return {
      ok: false,
      error: 'Tidak dapat mengubah status kembali ke DRAFT',
    };
  }

  return { ok: false, error: 'Status tidak valid' };
}

