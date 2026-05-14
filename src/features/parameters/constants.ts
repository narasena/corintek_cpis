import type { TParameterCategory } from './types';

export const CATEGORY_LABELS: Record<TParameterCategory, string> = {
  UNIT_CONDENSOR: 'Unit Condensor',
  UNIT_EVAPORATOR: 'Unit Evaporator',
  COOLING_WATER_QUALITY: 'Kualitas Air Pendingin',
  GENERAL_CONDITION: 'Kondisi Umum',
  JOB_DESCRIPTION: 'Deskripsi Pekerjaan',
  CONSUMPTION: 'Konsumsi',
  LAB_ANALYSIS: 'Lab Analysis',
};

export const CATEGORY_OPTIONS = [
  { value: 'all', label: 'Semua' },
  { value: 'UNIT_CONDENSOR', label: 'Unit Condensor' },
  { value: 'UNIT_EVAPORATOR', label: 'Unit Evaporator' },
  { value: 'COOLING_WATER_QUALITY', label: 'Kualitas Air Pendingin' },
  { value: 'GENERAL_CONDITION', label: 'Kondisi Umum' },
  { value: 'JOB_DESCRIPTION', label: 'Deskripsi Pekerjaan' },
  { value: 'CONSUMPTION', label: 'Konsumsi' },
  { value: 'LAB_ANALYSIS', label: 'Lab Analysis' },
];
