export type TValueType = 'NUMBER' | 'BOOLEAN' | 'TEXT';

export type TValueCheckInput = {
  valueType: TValueType;
  numericValue?: number | null;
  boolValue?: boolean | null;
  textValue?: string | null;
  fileUrl?: string | null;
};

export function isEntryValueEmpty(
  entry: TValueCheckInput | undefined
): boolean {
  if (!entry) return true;
  if (entry.fileUrl) return false;

  switch (entry.valueType) {
    case 'NUMBER':
      return entry.numericValue === null || entry.numericValue === undefined;
    case 'BOOLEAN':
      return entry.boolValue === null || entry.boolValue === undefined;
    case 'TEXT':
      return (
        entry.textValue === null ||
        entry.textValue === undefined ||
        entry.textValue.trim() === ''
      );
    default:
      return true;
  }
}

export function isEntryValueComplete(
  entry: TValueCheckInput | undefined
): boolean {
  if (!entry) return false;

  switch (entry.valueType) {
    case 'NUMBER':
      return (
        entry.numericValue !== null &&
        entry.numericValue !== undefined &&
        !Number.isNaN(entry.numericValue)
      );
    case 'BOOLEAN':
      return entry.boolValue !== null && entry.boolValue !== undefined;
    case 'TEXT':
      return (
        entry.textValue !== null &&
        entry.textValue !== undefined &&
        entry.textValue.trim() !== ''
      );
    default:
      return false;
  }
}

export function getTypedValue(
  entry: TValueCheckInput | undefined
): number | boolean | string | null {
  if (!entry) return null;

  switch (entry.valueType) {
    case 'NUMBER':
      return entry.numericValue ?? null;
    case 'BOOLEAN':
      return entry.boolValue ?? null;
    case 'TEXT':
      return entry.textValue ?? null;
    default:
      return null;
  }
}

export function createEmptyEntryState(valueType: TValueType): TValueCheckInput {
  switch (valueType) {
    case 'NUMBER':
      return { valueType: 'NUMBER', numericValue: null };
    case 'BOOLEAN':
      return { valueType: 'BOOLEAN', boolValue: null };
    case 'TEXT':
      return { valueType: 'TEXT', textValue: null };
    default:
      return { valueType } as TValueCheckInput;
  }
}

export function isNumericInRange(
  value: number | null | undefined,
  min: number | null,
  max: number | null
): boolean {
  if (value === null || value === undefined) return true;
  if (min !== null && value < min) return false;
  if (max !== null && value > max) return false;
  return true;
}
