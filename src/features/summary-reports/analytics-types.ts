export type TWaterQualitySource = 'MAKE_WATER' | 'COOLING_TOWER';

export type TWaterQualityParameter = 'pH' | 'TDS' | 'Conductivity' | 'Cycle';

export type TWaterQualityRow = {
  parameter: TWaterQualityParameter;
  source: TWaterQualitySource;
  variableName: string;
  unit: string;
  dailyValues: (number | null)[];
};

export type TCondenserUnitRow = {
  machineId: string;
  unitName: string;
  capacity: string;
  dailyApproach: (number | null)[];
  dailyLoad: (number | null)[];
};

export type TParameterLimitInfo = {
  parameterName: string;
  variableName: string;
  min: number | null;
  max: number | null;
  unit: string;
};

export type TAnalyticsData = {
  waterQuality: TWaterQualityRow[];
  condenserApproach: TCondenserUnitRow[];
  limits: TParameterLimitInfo[];
  daysInMonth: number;
};

export const WATER_QUALITY_CONFIG: Array<{
  parameter: TWaterQualityParameter;
  variableName: string;
  unit: string;
  sources: TWaterQualitySource[];
}> = [
  {
    parameter: 'pH',
    variableName: 'ph_ct',
    unit: '',
    sources: ['MAKE_WATER', 'COOLING_TOWER'],
  },
  {
    parameter: 'TDS',
    variableName: 'tds_ct',
    unit: 'ppm',
    sources: ['MAKE_WATER', 'COOLING_TOWER'],
  },
  {
    parameter: 'Conductivity',
    variableName: 'conductivity_ct',
    unit: 'µs',
    sources: ['MAKE_WATER', 'COOLING_TOWER'],
  },
  {
    parameter: 'Cycle',
    variableName: 'cycle_ct',
    unit: 'Cycle',
    sources: ['COOLING_TOWER'],
  },
];

export const CONDENSER_CONFIG = {
  approachVariableName: 'approach_cond',
  loadVariableName: 'load_demand_rla_cond',
};

export const SOURCE_ROLE_MAP: Record<TWaterQualitySource, string> = {
  MAKE_WATER: 'RAW_WATER',
  COOLING_TOWER: 'VALUE',
};
