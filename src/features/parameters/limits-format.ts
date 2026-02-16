export function formatNumericLimit(
  min: number | null | undefined,
  max: number | null | undefined,
  unit?: string | null
): string {
  const hasMin = min !== null && min !== undefined;
  const hasMax = max !== null && max !== undefined;
  const unitText = unit ? ` ${unit}` : '';
  if (hasMin && hasMax) return `${min}${unitText} ~ ${max}${unitText}`;
  if (hasMax) return `≤ ${max}${unitText}`;
  if (hasMin) return `≥ ${min}${unitText}`;
  return '-';
}

export function formatRawWaterLimit(
  min: number | null | undefined,
  max: number | null | undefined,
  unit: string | null
): string {
  const unitText = unit ? ` ${unit}` : '';
  const hasMin = min !== null && min !== undefined;
  const hasMax = max !== null && max !== undefined;
  if (hasMin && hasMax) return `${min}${unitText} ~ ${max}${unitText}`;
  if (hasMax) return `≤ ${max}${unitText}`;
  if (hasMin) return `≥ ${min}${unitText}`;
  return '-';
}
