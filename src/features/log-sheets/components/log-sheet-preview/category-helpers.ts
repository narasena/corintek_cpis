import type { TParameter, TMachine } from '../../types';

export const CATEGORY_ORDER: TParameter['category'][] = [
  'UNIT_CONDENSOR',
  'UNIT_EVAPORATOR',
  'COOLING_WATER_QUALITY',
  'GENERAL_CONDITION',
  'JOB_DESCRIPTION',
  'CONSUMPTION',
];

export const CHILLER_CATEGORIES = [
  'UNIT_CONDENSOR',
  'UNIT_EVAPORATOR',
] as const;

export const CT_CATEGORIES = [
  'COOLING_WATER_QUALITY',
  'GENERAL_CONDITION',
  'JOB_DESCRIPTION',
] as const;

export function usesChillers(category: TParameter['category']): boolean {
  return (CHILLER_CATEGORIES as readonly string[]).includes(category);
}

export function usesCoolingTowers(category: TParameter['category']): boolean {
  return (CT_CATEGORIES as readonly string[]).includes(category);
}

export const sectionTitle: Record<TParameter['category'], string> = {
  UNIT_CONDENSOR: 'Unit Condensor',
  UNIT_EVAPORATOR: 'Unit Evaporator',
  COOLING_WATER_QUALITY: 'Check Water Quality',
  GENERAL_CONDITION: 'General Condition',
  JOB_DESCRIPTION: 'Job Description',
  CONSUMPTION: 'Consumption',
};

export function machinesForCategory(
  category: TParameter['category'],
  machines: { chillers: TMachine[]; coolingTowers: TMachine[] }
) {
  if (!machines) return [];
  if (usesChillers(category)) {
    return machines.chillers || [];
  }
  if (usesCoolingTowers(category)) {
    return machines.coolingTowers || [];
  }
  return [];
}
