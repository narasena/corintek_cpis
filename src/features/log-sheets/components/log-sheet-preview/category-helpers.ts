import type { TParameter, TMachine } from '../../types';

export const CATEGORY_ORDER: TParameter['category'][] = [
  'UNIT_CONDENSOR',
  'UNIT_EVAPORATOR',
  'COOLING_WATER_QUALITY',
  'GENERAL_CONDITION',
  'JOB_DESCRIPTION',
  'CONSUMPTION',
];

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
  if (category === 'UNIT_CONDENSOR' || category === 'UNIT_EVAPORATOR') {
    return machines.chillers || [];
  }
  if (
    category === 'COOLING_WATER_QUALITY' ||
    category === 'GENERAL_CONDITION' ||
    category === 'JOB_DESCRIPTION'
  ) {
    return machines.coolingTowers || [];
  }
  return [];
}
