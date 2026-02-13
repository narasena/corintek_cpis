import { TLogSheetEntryRole } from './types';

export function makeEntryKey(
  parameterId: string,
  machineId: string | null,
  role: TLogSheetEntryRole
) {
  return `${parameterId}:${machineId ?? 'null'}:${role}`;
}

export function isLogSheetEntryEmpty(entry: {
  valueType: 'NUMBER' | 'BOOLEAN' | 'TEXT';
  numericValue?: number | null;
  boolValue?: boolean | null;
  textValue?: string | null;
  fileUrl?: string | null;
}) {
  if (entry.fileUrl) return false;

  if (entry.valueType === 'NUMBER') {
    return entry.numericValue === null || entry.numericValue === undefined;
  }

  if (entry.valueType === 'BOOLEAN') {
    return entry.boolValue === null || entry.boolValue === undefined;
  }

  if (entry.valueType === 'TEXT') {
    return (
      entry.textValue === null ||
      entry.textValue === undefined ||
      entry.textValue.trim() === ''
    );
  }

  return true;
}
