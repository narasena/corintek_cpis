import { TLogSheetEntryRole } from './types';
import {
  isEntryValueEmpty,
  isEntryValueComplete,
  getTypedValue,
  createEmptyEntryState,
  isNumericInRange,
} from './utils/value-type';

export {
  isEntryValueEmpty,
  isEntryValueComplete,
  getTypedValue,
  createEmptyEntryState,
  isNumericInRange,
};

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
  return isEntryValueEmpty(entry);
}

export function isEntryComplete(entry?: {
  valueType: 'NUMBER' | 'BOOLEAN' | 'TEXT';
  numericValue?: number | null;
  boolValue?: boolean | null;
  textValue?: string | null;
}): boolean {
  return isEntryValueComplete(entry);
}

export const entryKeys = {
  value: (parameterId: string, machineId: string | null): string =>
    makeEntryKey(parameterId, machineId, 'VALUE'),

  rawWater: (parameterId: string): string =>
    makeEntryKey(parameterId, null, 'RAW_WATER'),

  note: (parameterId: string): string =>
    makeEntryKey(parameterId, null, 'NOTE'),
};
