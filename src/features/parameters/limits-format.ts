export function hasMeaningfulLimits(
  min: number | null | undefined,
  max: number | null | undefined
): boolean {
  return (
    (min !== null && min !== undefined) || (max !== null && max !== undefined)
  );
}

function buildLimitString(
  min: number | null | undefined,
  max: number | null | undefined,
  unit: string | null
): string | null {
  const hasMin = min !== null && min !== undefined;
  const hasMax = max !== null && max !== undefined;
  const unitText = unit ? ` ${unit}` : '';

  if (hasMin && hasMax) return `${min}${unitText} ~ ${max}${unitText}`;
  if (hasMax) return `≤ ${max}${unitText}`;
  if (hasMin) return `≥ ${min}${unitText}`;
  return null;
}

export function formatNumericLimit(
  min: number | null | undefined,
  max: number | null | undefined,
  unit?: string | null
): string | null {
  return buildLimitString(min, max, unit ?? null);
}

export function formatRawWaterLimit(
  min: number | null | undefined,
  max: number | null | undefined,
  unit: string | null
): string | null {
  return buildLimitString(min, max, unit);
}
