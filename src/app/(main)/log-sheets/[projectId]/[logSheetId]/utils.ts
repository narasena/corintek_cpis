import type { TParameter } from './types';
import {
  formatNumericLimit,
  formatRawWaterLimit as formatRawLimitCore,
} from '@/features/parameters/limits-format';

export function formatDate(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatLimit(
  parameter: Pick<TParameter, 'minValue' | 'maxValue' | 'unit'>
) {
  return formatNumericLimit(
    parameter.minValue,
    parameter.maxValue,
    parameter.unit
  );
}

export function formatRawWaterLimit(
  parameter: Pick<TParameter, 'rawWaterMinValue' | 'rawWaterMaxValue' | 'unit'>
) {
  return formatRawLimitCore(
    parameter.rawWaterMinValue,
    parameter.rawWaterMaxValue,
    parameter.unit ?? null
  );
}

export function isOutOfRange(
  value: number | null | undefined,
  min: number | null,
  max: number | null
) {
  if (value === null || value === undefined) return false;
  if (min !== null && value < min) return true;
  if (max !== null && value > max) return true;
  return false;
}
