import { TLogSheetEntryRole } from './types';

export function makeEntryKey(
  parameterId: string,
  machineId: string | null,
  role: TLogSheetEntryRole
) {
  return `${parameterId}:${machineId ?? 'null'}:${role}`;
}
