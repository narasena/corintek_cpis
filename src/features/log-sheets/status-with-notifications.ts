import type { IJwtPayload } from '@/@types/auth.type';
import type { ILogSheet, TLogSheetStatus } from './types';
import * as logSheetService from './service';
import {
  getTechnicianUserIds,
  notifyLimitBreachesOnSubmission,
} from './log-sheet-notifications';

type TUpdateLogSheetStatusInput = {
  id: string;
  status: TLogSheetStatus;
};

export async function updateLogSheetStatusWithNotifications(
  actor: IJwtPayload,
  input: TUpdateLogSheetStatusInput
): Promise<ILogSheet> {
  if (input.status === 'SUBMITTED') {
    const detail = await logSheetService.getLogSheetDetail(input.id);
    await logSheetService.validateLogSheetForSubmission(input.id, detail);
    const technicianUserIds = getTechnicianUserIds(detail);

    await notifyLimitBreachesOnSubmission({
      evaluatorUserId: actor.id,
      technicianUserIds,
      detail,
    });
  }

  return logSheetService.updateLogSheetStatus(actor, input.id, input.status);
}
