import type { TLogSheetStatus } from './types';

export type TLogSheetEditState =
  | 'EDITABLE'
  | 'LOCKED_SUBMITTED'
  | 'LOCKED_APPROVED';

export interface ILogSheetLockContext {
  status: TLogSheetStatus;
  locked: boolean;
}

export interface ILogSheetLockOptions {
  isAdmin: boolean;
  allowAdminOverride?: boolean;
}

export function getLogSheetEditState(
  context: ILogSheetLockContext,
  options: ILogSheetLockOptions
): TLogSheetEditState {
  if (context.locked) {
    return 'LOCKED_APPROVED';
  }

  if (context.status === 'DRAFT') {
    return 'EDITABLE';
  }

  if (options.isAdmin && options.allowAdminOverride) {
    return 'EDITABLE';
  }

  if (context.status === 'APPROVED') {
    return 'LOCKED_APPROVED';
  }

  return 'LOCKED_SUBMITTED';
}
