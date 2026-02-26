type TRangeValidationEntry = {
  numericValue: number | null;
  role: string;
};

type TRangeValidationParam = {
  name: string;
  minValue?: number | null;
  maxValue?: number | null;
  rawWaterMinValue?: number | null;
  rawWaterMaxValue?: number | null;
};

export function validateNumericRange(
  entry: TRangeValidationEntry,
  param: TRangeValidationParam
): string[] {
  const errors: string[] = [];

  if (entry.numericValue === null) return errors;

  let min: number | null = param.minValue ?? null;
  let max: number | null = param.maxValue ?? null;

  if (entry.role === 'RAW_WATER') {
    min = param.rawWaterMinValue ?? null;
    max = param.rawWaterMaxValue ?? null;
  }

  if (min !== null && entry.numericValue < min) {
    errors.push(
      `${param.name}: Nilai ${entry.numericValue} di bawah minimum ${min}`
    );
  }
  if (max !== null && entry.numericValue > max) {
    errors.push(
      `${param.name}: Nilai ${entry.numericValue} di atas maksimum ${max}`
    );
  }

  return errors;
}
