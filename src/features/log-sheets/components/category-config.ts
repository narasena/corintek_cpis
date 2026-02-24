import type { TParameter } from '../types';

export const UNIT_CATEGORIES = [
  'UNIT_CONDENSOR',
  'UNIT_EVAPORATOR',
  'GENERAL_CONDITION',
  'JOB_DESCRIPTION',
] as const;

export const CT_CATEGORIES = new Set([
  'COOLING_WATER_QUALITY',
  'GENERAL_CONDITION',
  'JOB_DESCRIPTION',
]);

export function hasNotesCategory(cat: TParameter['category']): boolean {
  return cat === 'GENERAL_CONDITION' || cat === 'JOB_DESCRIPTION';
}

export function isWaterMeterParam(
  paramName: string,
  cat: TParameter['category']
): boolean {
  return (
    cat === 'CONSUMPTION' &&
    ['before', 'after'].some(k => paramName.toLowerCase().includes(k))
  );
}
