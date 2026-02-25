import { describe, expect, it } from 'vitest';

import {
  formatLimit,
  formatRawWaterLimit,
  formatValue,
} from './log-sheet-preview/format-helpers';
import { machinesForCategory } from './log-sheet-preview/category-helpers';
import type { TParameter, TEntryState } from '../types';

type FormatLimitParam = Parameters<typeof formatLimit>[0];
type FormatRawWaterLimitParam = Parameters<typeof formatRawWaterLimit>[0];

describe('formatLimit (P2-8)', () => {
  describe('numeric limits', () => {
    it('returns "min-max" when both bounds exist', () => {
      const param: FormatLimitParam = {
        minValue: 10,
        maxValue: 100,
        unit: 'C',
        valueType: 'NUMBER',
        category: 'COOLING_WATER_QUALITY',
        variableName: 'temperature',
      };

      expect(formatLimit(param)).toBe('10-100');
    });

    it('returns "≤ max" when only max exists', () => {
      const param: FormatLimitParam = {
        minValue: null,
        maxValue: 50,
        unit: 'ppm',
        valueType: 'NUMBER',
        category: 'COOLING_WATER_QUALITY',
        variableName: 'tds',
      };

      expect(formatLimit(param)).toBe('≤ 50');
    });

    it('returns "≥ min" when only min exists', () => {
      const param: FormatLimitParam = {
        minValue: 6,
        maxValue: null,
        unit: '',
        valueType: 'NUMBER',
        category: 'COOLING_WATER_QUALITY',
        variableName: 'ph',
      };

      expect(formatLimit(param)).toBe('≥ 6');
    });

    it('returns empty string when no limits', () => {
      const param: FormatLimitParam = {
        minValue: null,
        maxValue: null,
        unit: '',
        valueType: 'NUMBER',
        category: 'CONSUMPTION',
        variableName: 'consumption',
      };

      expect(formatLimit(param)).toBe('');
    });

    it('returns "min-max" when min is 0 and max exists', () => {
      const param: FormatLimitParam = {
        minValue: 0,
        maxValue: 10,
        unit: '',
        valueType: 'NUMBER',
        category: 'COOLING_WATER_QUALITY',
        variableName: 'test',
      };

      expect(formatLimit(param)).toBe('0-10');
    });
  });

  describe('BOOLEAN valueType', () => {
    it('returns "Progress/No" for JOB_DESCRIPTION category', () => {
      const param: FormatLimitParam = {
        minValue: null,
        maxValue: null,
        unit: null,
        valueType: 'BOOLEAN',
        category: 'JOB_DESCRIPTION',
        variableName: 'job_done',
      };

      expect(formatLimit(param)).toBe('Progress/No');
    });

    it('returns "Running/Stop" for GENERAL_CONDITION with running_ in variableName', () => {
      const param: FormatLimitParam = {
        minValue: null,
        maxValue: null,
        unit: null,
        valueType: 'BOOLEAN',
        category: 'GENERAL_CONDITION',
        variableName: 'running_ct_1',
      };

      expect(formatLimit(param)).toBe('Running/Stop');
    });

    it('returns "Normal" for GENERAL_CONDITION with deposit in variableName', () => {
      const param: FormatLimitParam = {
        minValue: null,
        maxValue: null,
        unit: null,
        valueType: 'BOOLEAN',
        category: 'GENERAL_CONDITION',
        variableName: 'deposit_check',
      };

      expect(formatLimit(param)).toBe('Normal');
    });

    it('returns "Yes/No" for GENERAL_CONDITION without special variableName', () => {
      const param: FormatLimitParam = {
        minValue: null,
        maxValue: null,
        unit: null,
        valueType: 'BOOLEAN',
        category: 'GENERAL_CONDITION',
        variableName: 'algae_check',
      };

      expect(formatLimit(param)).toBe('Yes/No');
    });

    it('returns "Normal" for BOOLEAN with other categories', () => {
      const param: FormatLimitParam = {
        minValue: null,
        maxValue: null,
        unit: null,
        valueType: 'BOOLEAN',
        category: 'COOLING_WATER_QUALITY',
        variableName: 'some_bool',
      };

      expect(formatLimit(param)).toBe('Normal');
    });
  });

  describe('TEXT valueType', () => {
    it('returns empty string for TEXT valueType without limits', () => {
      const param: FormatLimitParam = {
        minValue: null,
        maxValue: null,
        unit: null,
        valueType: 'TEXT',
        category: 'JOB_DESCRIPTION',
        variableName: 'notes',
      };

      expect(formatLimit(param)).toBe('');
    });
  });
});

describe('formatRawWaterLimit (P2-8)', () => {
  it('returns "min unit ~ max unit" when both bounds exist', () => {
    const param: FormatRawWaterLimitParam = {
      rawWaterMinValue: 6,
      rawWaterMaxValue: 8,
      unit: 'pH',
    };

    expect(formatRawWaterLimit(param)).toBe('6 pH ~ 8 pH');
  });

  it('returns "≤ max unit" when only max exists', () => {
    const param: FormatRawWaterLimitParam = {
      rawWaterMinValue: null,
      rawWaterMaxValue: 100,
      unit: 'ppm',
    };

    expect(formatRawWaterLimit(param)).toBe('≤ 100 ppm');
  });

  it('returns "≥ min unit" when only min exists', () => {
    const param: FormatRawWaterLimitParam = {
      rawWaterMinValue: 50,
      rawWaterMaxValue: null,
      unit: 'mg/L',
    };

    expect(formatRawWaterLimit(param)).toBe('≥ 50 mg/L');
  });

  it('returns empty string when no limits', () => {
    const param: FormatRawWaterLimitParam = {
      rawWaterMinValue: null,
      rawWaterMaxValue: null,
      unit: '',
    };

    expect(formatRawWaterLimit(param)).toBe('');
  });

  it('handles null unit gracefully', () => {
    const param: FormatRawWaterLimitParam = {
      rawWaterMinValue: 6,
      rawWaterMaxValue: 8,
      unit: null,
    };

    expect(formatRawWaterLimit(param)).toBe('6 ~ 8');
  });

  it('handles undefined unit gracefully', () => {
    const param: FormatRawWaterLimitParam = {
      rawWaterMinValue: 6,
      rawWaterMaxValue: 8,
      unit: undefined as unknown as string | null,
    };

    expect(formatRawWaterLimit(param)).toBe('6 ~ 8');
  });
});

describe('formatValue (P2-8)', () => {
  describe('BOOLEAN valueType', () => {
    it('returns "Yes" for true boolValue', () => {
      const state: TEntryState = { valueType: 'BOOLEAN', boolValue: true };

      expect(formatValue(state)).toBe('Yes');
    });

    it('returns "No" for false boolValue', () => {
      const state: TEntryState = { valueType: 'BOOLEAN', boolValue: false };

      expect(formatValue(state)).toBe('No');
    });

    it('returns empty string for null boolValue', () => {
      const state: TEntryState = { valueType: 'BOOLEAN', boolValue: null };

      expect(formatValue(state)).toBe('');
    });

    it('returns empty string for undefined boolValue', () => {
      const state: TEntryState = { valueType: 'BOOLEAN', boolValue: undefined };

      expect(formatValue(state)).toBe('');
    });
  });

  describe('NUMBER valueType', () => {
    it('returns string representation of numericValue', () => {
      const state: TEntryState = { valueType: 'NUMBER', numericValue: 42 };

      expect(formatValue(state)).toBe('42');
    });

    it('returns string for negative numbers', () => {
      const state: TEntryState = { valueType: 'NUMBER', numericValue: -10 };

      expect(formatValue(state)).toBe('-10');
    });

    it('returns "0" for zero', () => {
      const state: TEntryState = { valueType: 'NUMBER', numericValue: 0 };

      expect(formatValue(state)).toBe('0');
    });

    it('returns string for decimal numbers', () => {
      const state: TEntryState = { valueType: 'NUMBER', numericValue: 3.14159 };

      expect(formatValue(state)).toBe('3.14159');
    });

    it('returns empty string for null numericValue', () => {
      const state: TEntryState = { valueType: 'NUMBER', numericValue: null };

      expect(formatValue(state)).toBe('');
    });

    it('returns empty string for undefined numericValue', () => {
      const state: TEntryState = {
        valueType: 'NUMBER',
        numericValue: undefined,
      };

      expect(formatValue(state)).toBe('');
    });

    it('handles NaN (returns "NaN")', () => {
      const state: TEntryState = { valueType: 'NUMBER', numericValue: NaN };

      expect(formatValue(state)).toBe('NaN');
    });

    it('handles Infinity', () => {
      const state: TEntryState = {
        valueType: 'NUMBER',
        numericValue: Infinity,
      };

      expect(formatValue(state)).toBe('Infinity');
    });
  });

  describe('TEXT valueType', () => {
    it('returns textValue when present', () => {
      const state: TEntryState = {
        valueType: 'TEXT',
        textValue: 'Some notes here',
      };

      expect(formatValue(state)).toBe('Some notes here');
    });

    it('returns empty string for null textValue', () => {
      const state: TEntryState = { valueType: 'TEXT', textValue: null };

      expect(formatValue(state)).toBe('');
    });

    it('returns empty string for undefined textValue', () => {
      const state: TEntryState = { valueType: 'TEXT', textValue: undefined };

      expect(formatValue(state)).toBe('');
    });

    it('returns empty string for empty textValue', () => {
      const state: TEntryState = { valueType: 'TEXT', textValue: '' };

      expect(formatValue(state)).toBe('');
    });
  });

  describe('edge cases', () => {
    it('returns empty string for undefined state', () => {
      expect(formatValue(undefined)).toBe('');
    });

    it('returns empty string for null state', () => {
      expect(formatValue(null as unknown as TEntryState)).toBe('');
    });
  });
});

describe('machinesForCategory (P2-8)', () => {
  const machines = {
    chillers: [
      { id: 'c1', unitNumber: 1, type: 'CHILLER' as const },
      { id: 'c2', unitNumber: 2, type: 'CHILLER' as const },
    ],
    coolingTowers: [
      { id: 'ct1', unitNumber: 1, type: 'COOLING_TOWER' as const },
      { id: 'ct2', unitNumber: 2, type: 'COOLING_TOWER' as const },
    ],
  };

  it('returns chillers for UNIT_CONDENSOR category', () => {
    const result = machinesForCategory('UNIT_CONDENSOR', machines);
    expect(result).toEqual(machines.chillers);
  });

  it('returns chillers for UNIT_EVAPORATOR category', () => {
    const result = machinesForCategory('UNIT_EVAPORATOR', machines);
    expect(result).toEqual(machines.chillers);
  });

  it('returns coolingTowers for COOLING_WATER_QUALITY category', () => {
    const result = machinesForCategory('COOLING_WATER_QUALITY', machines);
    expect(result).toEqual(machines.coolingTowers);
  });

  it('returns coolingTowers for GENERAL_CONDITION category', () => {
    const result = machinesForCategory('GENERAL_CONDITION', machines);
    expect(result).toEqual(machines.coolingTowers);
  });

  it('returns coolingTowers for JOB_DESCRIPTION category', () => {
    const result = machinesForCategory('JOB_DESCRIPTION', machines);
    expect(result).toEqual(machines.coolingTowers);
  });

  it('returns empty array for CONSUMPTION category', () => {
    const result = machinesForCategory('CONSUMPTION', machines);
    expect(result).toEqual([]);
  });

  it('returns empty array when machines is null', () => {
    const result = machinesForCategory(
      'UNIT_CONDENSOR',
      null as unknown as typeof machines
    );
    expect(result).toEqual([]);
  });

  it('returns empty array when machines is undefined', () => {
    const result = machinesForCategory(
      'UNIT_CONDENSOR',
      undefined as unknown as typeof machines
    );
    expect(result).toEqual([]);
  });

  it('returns empty array when chillers is null', () => {
    const result = machinesForCategory('UNIT_CONDENSOR', {
      chillers: null as unknown as typeof machines.chillers,
      coolingTowers: machines.coolingTowers,
    });
    expect(result).toEqual([]);
  });

  it('returns empty array when coolingTowers is null', () => {
    const result = machinesForCategory('COOLING_WATER_QUALITY', {
      chillers: machines.chillers,
      coolingTowers: null as unknown as typeof machines.coolingTowers,
    });
    expect(result).toEqual([]);
  });
});
