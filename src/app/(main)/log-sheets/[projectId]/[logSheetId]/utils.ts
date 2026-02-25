import type { TParameter } from './types';
import {
  formatNumericLimit,
  formatRawWaterLimit as formatRawLimitCore,
} from '@/features/parameters/limits-format';
import { isNumericInRange } from '@/features/log-sheets/utils';

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
  return !isNumericInRange(value, min, max);
}
