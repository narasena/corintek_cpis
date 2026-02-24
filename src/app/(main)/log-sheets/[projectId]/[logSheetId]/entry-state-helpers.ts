import type { TEntryState } from './types';

export function createNumberEntryUpdater(entryKey: string, rawValue: string) {
  return (prev: Record<string, TEntryState>) => ({
    ...prev,
    [entryKey]: {
      ...prev[entryKey],
      valueType: 'NUMBER' as const,
      numericValue: rawValue === '' ? null : Number(rawValue),
    },
  });
}

export function createBooleanEntryUpdater(
  entryKey: string,
  boolValue: boolean | null
) {
  return (prev: Record<string, TEntryState>) => ({
    ...prev,
    [entryKey]: {
      valueType: 'BOOLEAN' as const,
      boolValue,
    },
  });
}

export function createTextEntryUpdater(entryKey: string, textValue: string) {
  return (prev: Record<string, TEntryState>) => ({
    ...prev,
    [entryKey]: {
      valueType: 'TEXT' as const,
      textValue,
    },
  });
}

export function createCameraEntryUpdater(
  entryKey: string,
  fileUrl: string | null,
  file: File | null
) {
  return (prev: Record<string, TEntryState>) => ({
    ...prev,
    [entryKey]: {
      ...prev[entryKey],
      valueType: 'NUMBER' as const,
      numericValue: prev[entryKey]?.numericValue ?? null,
      fileUrl,
      pendingFile: file,
    },
  });
}
