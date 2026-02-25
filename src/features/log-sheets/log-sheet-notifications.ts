import type { ILogSheetDetailView } from './types';
import { buildLimitEvaluationInput } from './limit-breach-adapter';
import { notificationService } from '@/features/notifications/service';
import type {
  TEvaluateLimitBreachesResult,
  TLimitBreach,
} from '@/features/notifications/types';

export function evaluateSubmissionLimits(detail: ILogSheetDetailView): {
  breaches: TLimitBreach[];
  errors: string[];
} {
  const snapshots = buildLimitEvaluationInput(detail);
  const breaches: TLimitBreach[] = [];
  const errors: string[] = [];

  // 1. Check Signatures (Blockers)
  if (!detail.logSheet.technicianSignatureUrl) {
    errors.push('Tanda tangan teknisi belum diisi');
  }
  if (!detail.logSheet.clientPicSignatureUrl) {
    errors.push('Tanda tangan PIC klien belum diisi');
  }

  // 2. Check Limits (Warnings)
  for (const entry of snapshots) {
    const { value, minLimit, maxLimit } = entry;
    if (value === null || !Number.isFinite(value)) continue;

    if (minLimit !== null && value < minLimit) {
      breaches.push({
        entry,
        breachDirection: 'BELOW_MIN',
        severity: 'WARNING',
      });
    } else if (maxLimit !== null && value > maxLimit) {
      breaches.push({
        entry,
        breachDirection: 'ABOVE_MAX',
        severity: 'WARNING',
      });
    }
  }

  return { breaches, errors };
}

export function getTechnicianUserIds(detail: ILogSheetDetailView): string[] {
  const assignments = detail.project.assignments ?? [];
  return assignments.filter(a => a.role === 'TECHNICIAN').map(a => a.user.id);
}

/**
 * Evaluates log sheet entries against defined limits and notifies relevant users of breaches.
 *
 * SOLID Compliance:
 * - SRP: Orchestrates limit evaluation and notification dispatch.
 * - OCP: Uses adapter for input building, allowing format changes without modifying core logic.
 *
 * @param params
 * @param params.evaluatorUserId - The user triggering the evaluation (usually current user).
 * @param params.technicianUserIds - List of technicians assigned to the project.
 * @param params.detail - The log sheet detail view containing entries and limits.
 * @returns {Promise<TEvaluateLimitBreachesResult | null>} The result of the evaluation or null if skipped/failed.
 */
export async function notifyLimitBreachesOnSubmission(params: {
  evaluatorUserId: string;
  technicianUserIds: string[];
  detail: ILogSheetDetailView;
}): Promise<TEvaluateLimitBreachesResult | null> {
  const snapshots = buildLimitEvaluationInput(params.detail);

  if (snapshots.length === 0) {
    return null;
  }

  const recipients = new Set(params.technicianUserIds);
  recipients.add(params.evaluatorUserId);

  try {
    const result = await notificationService.evaluateLimitBreaches({
      evaluatorUserId: params.evaluatorUserId,
      technicianUserIds: Array.from(recipients),
      entries: snapshots,
    });
    return result;
  } catch (error) {
    console.error('[CPIS-ERROR] LogSheets.Notifications:', error);
    return null;
  }
}
