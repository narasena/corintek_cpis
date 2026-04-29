import { describe, expect, it } from 'vitest';

import { makeEntryKey } from '@/features/log-sheets/utils';
import {
  validateLogSheetEntries,
  type TLogSheetValidationInput,
  type TValidationParameter,
} from '@/features/log-sheets/validation';

type Machine = {
  id: string;
  unitNumber: number;
  type: 'CHILLER' | 'COOLING_TOWER';
};

function baseInput(
  overrides?: Partial<TLogSheetValidationInput>
): TLogSheetValidationInput {
  const chillers: Machine[] = [{ id: 'c1', unitNumber: 1, type: 'CHILLER' }];
  const coolingTowers: Machine[] = [
    { id: 't1', unitNumber: 1, type: 'COOLING_TOWER' },
  ];

  const params = new Map<string, TValidationParameter[]>();
  params.set('UNIT_CONDENSOR', [
    {
      id: 'p-cond',
      name: 'Cond Param',
      variableName: 'cond_param',
      category: 'UNIT_CONDENSOR',
      valueType: 'NUMBER',
    },
  ]);
  params.set('UNIT_EVAPORATOR', [
    {
      id: 'p-evap',
      name: 'Evap Param',
      variableName: 'evap_param',
      category: 'UNIT_EVAPORATOR',
      valueType: 'NUMBER',
    },
  ]);

  params.set('COOLING_WATER_QUALITY', [
    {
      id: 'p-ph',
      name: 'pH',
      variableName: 'ph',
      category: 'COOLING_WATER_QUALITY',
      valueType: 'NUMBER',
    },
    {
      id: 'p-cycle',
      name: 'Cycle of concentration',
      variableName: 'cycle_of_concentration',
      category: 'COOLING_WATER_QUALITY',
      valueType: 'NUMBER',
    },
  ]);
  params.set('GENERAL_CONDITION', [
    {
      id: 'p-gc',
      name: 'General Condition',
      variableName: 'gc',
      category: 'GENERAL_CONDITION',
      valueType: 'BOOLEAN',
    },
  ]);
  params.set('JOB_DESCRIPTION', [
    {
      id: 'p-job',
      name: 'Job Desc',
      variableName: 'job_desc',
      category: 'JOB_DESCRIPTION',
      valueType: 'TEXT',
    },
  ]);
  params.set('CONSUMPTION', [
    {
      id: 'p-cons',
      name: 'Consumption A',
      variableName: 'cons_a',
      category: 'CONSUMPTION',
      valueType: 'NUMBER',
    },
  ]);

  return {
    detail: {
      machines: {
        chillers,
        coolingTowers,
      },
    },
    entryState: {},
    activeChillerIds: ['c1'],
    activeCTIds: ['t1'],
    parametersByCategory: params,
    ...overrides,
  };
}

describe('validateLogSheetEntries (characterization)', () => {
  it('returns invalid when detail is null (error condition)', () => {
    const input = baseInput({ detail: null });
    const result = validateLogSheetEntries(input);

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(['Detail log sheet tidak ditemukan']);
    expect(result.missingFields).toEqual([]);
  });

  it('allows chillers to be inactive when cooling towers are active (no chiller error)', () => {
    const input = baseInput({ activeChillerIds: [] });
    const result = validateLogSheetEntries(input);

    expect(result.valid).toBe(false);
    // CT data incomplete in baseInput, so error about CT expected, but NOT chiller error
    expect(result.errors).not.toContain(
      'Minimal satu Chiller harus dipilih dan diisi lengkap.'
    );
  });

  it('allows cooling towers to be inactive when chillers are active (no CT error)', () => {
    const input = baseInput({ activeCTIds: [] });
    const result = validateLogSheetEntries(input);

    expect(result.valid).toBe(false);
    // Chiller data incomplete in baseInput, so error about chiller expected, but NOT CT error
    expect(result.errors).not.toContain(
      'Minimal satu Cooling Tower harus dipilih dan diisi lengkap.'
    );
  });

  it('allows chillers to be inactive when cooling towers are active', () => {
    const input = baseInput({
      activeChillerIds: [],
      entryState: {
        // satisfy CT completely
        [makeEntryKey('p-ph', 't1', 'VALUE')]: {
          valueType: 'NUMBER',
          numericValue: 7,
        },
        [makeEntryKey('p-cycle', 't1', 'VALUE')]: {
          valueType: 'NUMBER',
          numericValue: 3,
        },
        [makeEntryKey('p-gc', 't1', 'VALUE')]: {
          valueType: 'BOOLEAN',
          boolValue: true,
        },
        [makeEntryKey('p-job', 't1', 'VALUE')]: {
          valueType: 'TEXT',
          textValue: 'Job done',
        },
        [makeEntryKey('p-ph', null, 'RAW_WATER')]: {
          valueType: 'NUMBER',
          numericValue: 7,
        },
        [makeEntryKey('p-cons', null, 'VALUE')]: {
          valueType: 'NUMBER',
          numericValue: 10,
        },
      },
    });
    const result = validateLogSheetEntries(input);

    expect(result.errors).not.toContain(
      'Minimal satu Chiller harus dipilih dan diisi lengkap.'
    );
  });

  it('allows cooling towers to be inactive when chillers are active (no CT error)', () => {
    const input = baseInput({ activeCTIds: [] });
    const result = validateLogSheetEntries(input);

    expect(result.valid).toBe(false);
    // Chiller data incomplete in baseInput, so error about chiller expected, but NOT CT error
    expect(result.errors).not.toContain(
      'Minimal satu Cooling Tower harus dipilih dan diisi lengkap.'
    );
  });

  it('allows cooling towers to be inactive when chillers are active', () => {
    const input = baseInput({
      activeCTIds: [],
      entryState: {
        // satisfy chiller completely
        [makeEntryKey('p-cond', 'c1', 'VALUE')]: {
          valueType: 'NUMBER',
          numericValue: 1,
        },
        [makeEntryKey('p-evap', 'c1', 'VALUE')]: {
          valueType: 'NUMBER',
          numericValue: 1,
        },
        [makeEntryKey('p-cons', null, 'VALUE')]: {
          valueType: 'NUMBER',
          numericValue: 10,
        },
      },
    });
    const result = validateLogSheetEntries(input);

    expect(result.errors).not.toContain(
      'Minimal satu Cooling Tower harus dipilih dan diisi lengkap.'
    );
  });

  it('rejects when both chillers and cooling towers are inactive', () => {
    const input = baseInput({ activeChillerIds: [], activeCTIds: [] });
    const result = validateLogSheetEntries(input);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'Minimal satu unit harus dipilih dan diisi.'
    );
  });

  it('passes with only cooling tower data when chillers are inactive', () => {
    const input = baseInput({
      activeChillerIds: [],
      entryState: {
        [makeEntryKey('p-ph', 't1', 'VALUE')]: {
          valueType: 'NUMBER',
          numericValue: 7,
        },
        [makeEntryKey('p-cycle', 't1', 'VALUE')]: {
          valueType: 'NUMBER',
          numericValue: 3,
        },
        [makeEntryKey('p-gc', 't1', 'VALUE')]: {
          valueType: 'BOOLEAN',
          boolValue: true,
        },
        [makeEntryKey('p-job', 't1', 'VALUE')]: {
          valueType: 'TEXT',
          textValue: 'Job done',
        },
        [makeEntryKey('p-ph', null, 'RAW_WATER')]: {
          valueType: 'NUMBER',
          numericValue: 7,
        },
        [makeEntryKey('p-cons', null, 'VALUE')]: {
          valueType: 'NUMBER',
          numericValue: 10,
        },
      },
    });
    const result = validateLogSheetEntries(input);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.missingFields).toEqual([]);
  });

  it('passes with only chiller data when cooling towers are inactive', () => {
    const input = baseInput({
      activeCTIds: [],
      entryState: {
        [makeEntryKey('p-cond', 'c1', 'VALUE')]: {
          valueType: 'NUMBER',
          numericValue: 1,
        },
        [makeEntryKey('p-evap', 'c1', 'VALUE')]: {
          valueType: 'NUMBER',
          numericValue: 1,
        },
        [makeEntryKey('p-cons', null, 'VALUE')]: {
          valueType: 'NUMBER',
          numericValue: 10,
        },
      },
    });
    const result = validateLogSheetEntries(input);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.missingFields).toEqual([]);
  });

  it('does not require raw water when no cooling towers are active', () => {
    const input = baseInput({
      activeCTIds: [],
      entryState: {
        [makeEntryKey('p-cond', 'c1', 'VALUE')]: {
          valueType: 'NUMBER',
          numericValue: 1,
        },
        [makeEntryKey('p-evap', 'c1', 'VALUE')]: {
          valueType: 'NUMBER',
          numericValue: 1,
        },
        [makeEntryKey('p-cons', null, 'VALUE')]: {
          valueType: 'NUMBER',
          numericValue: 10,
        },
      },
    });
    const result = validateLogSheetEntries(input);

    expect(
      result.missingFields.some(f => f.includes('Raw Water'))
    ).toBe(false);
  });

  it('collects missing fields from the first active chiller if none are complete (surprising/buggy-ish: only first machine detailed)', () => {
    const input = baseInput();
    const result = validateLogSheetEntries(input);

    expect(result.valid).toBe(false);

    // It will complain about missing chiller params, but only for the first active chiller.
    expect(result.missingFields.some(s => s.includes('Chiller #1'))).toBe(true);
    expect(result.errors).toContain(
      'Minimal satu Chiller harus diisi lengkap.'
    );
  });

  it('TEXT parameters are considered missing when no entryState exists for them (surprising behavior)', () => {
    // The validator treats `undefined` state as empty *before* it checks TEXT.
    // So a TEXT parameter is required unless there is at least an entryState object.
    const input = baseInput({
      entryState: {
        [makeEntryKey('p-cond', 'c1', 'VALUE')]: {
          valueType: 'NUMBER',
          numericValue: 1,
        },
        [makeEntryKey('p-evap', 'c1', 'VALUE')]: {
          valueType: 'NUMBER',
          numericValue: 1,
        },
        [makeEntryKey('p-ph', 't1', 'VALUE')]: {
          valueType: 'NUMBER',
          numericValue: 7,
        },
        [makeEntryKey('p-gc', 't1', 'VALUE')]: {
          valueType: 'BOOLEAN',
          boolValue: true,
        },
        [makeEntryKey('p-cons', null, 'VALUE')]: {
          valueType: 'NUMBER',
          numericValue: 10,
        },
        // NOTE: no entry for p-job (TEXT) at all => expected missing
      },
    });

    const result = validateLogSheetEntries(input);
    expect(result.missingFields.some(s => s.includes('JOB_DESCRIPTION'))).toBe(
      true
    );
  });

  it('raw water missing is collected from COOLING_WATER_QUALITY excluding variableName containing "cycle" (main path)', () => {
    const input = baseInput({
      entryState: {
        // satisfy chiller (both categories)
        [makeEntryKey('p-cond', 'c1', 'VALUE')]: {
          valueType: 'NUMBER',
          numericValue: 1,
        },
        [makeEntryKey('p-evap', 'c1', 'VALUE')]: {
          valueType: 'NUMBER',
          numericValue: 1,
        },

        // satisfy CT completeness for VALUE entries
        [makeEntryKey('p-ph', 't1', 'VALUE')]: {
          valueType: 'NUMBER',
          numericValue: 7,
        },
        [makeEntryKey('p-cycle', 't1', 'VALUE')]: {
          valueType: 'NUMBER',
          numericValue: 3,
        },
        [makeEntryKey('p-gc', 't1', 'VALUE')]: {
          valueType: 'BOOLEAN',
          boolValue: true,
        },
        [makeEntryKey('p-job', 't1', 'VALUE')]: {
          valueType: 'TEXT',
          textValue: null,
        },

        // consumption is intentionally missing to keep errors non-empty
        // raw water pH is missing (should be collected), raw water cycle should be ignored
      },
    });

    const result = validateLogSheetEntries(input);

    expect(result.missingFields).toContain('Raw Water Quality: pH');
    // cycle is excluded only for RAW_WATER quality collection
    expect(
      result.missingFields.some(
        s =>
          s.includes('Raw Water Quality') && s.toLowerCase().includes('cycle')
      )
    ).toBe(false);
  });

  it('becomes valid when all required fields are filled for at least one active machine each (main path)', () => {
    const input = baseInput({
      entryState: {
        // Chiller requirements
        [makeEntryKey('p-cond', 'c1', 'VALUE')]: {
          valueType: 'NUMBER',
          numericValue: 1,
        },
        [makeEntryKey('p-evap', 'c1', 'VALUE')]: {
          valueType: 'NUMBER',
          numericValue: 1,
        },

        // Cooling tower requirements
        [makeEntryKey('p-ph', 't1', 'VALUE')]: {
          valueType: 'NUMBER',
          numericValue: 7,
        },
        [makeEntryKey('p-cycle', 't1', 'VALUE')]: {
          valueType: 'NUMBER',
          numericValue: 3,
        },
        [makeEntryKey('p-gc', 't1', 'VALUE')]: {
          valueType: 'BOOLEAN',
          boolValue: true,
        },
        [makeEntryKey('p-job', 't1', 'VALUE')]: {
          valueType: 'TEXT',
          textValue: null,
        },

        // Raw water (for cooling water quality, excluding cycle)
        [makeEntryKey('p-ph', null, 'RAW_WATER')]: {
          valueType: 'NUMBER',
          numericValue: 7,
        },

        // Consumption
        [makeEntryKey('p-cons', null, 'VALUE')]: {
          valueType: 'NUMBER',
          numericValue: 10,
        },
      },
    });

    const result = validateLogSheetEntries(input);

    expect(result.errors).toEqual([]);
    expect(result.missingFields).toEqual([]);
    expect(result.valid).toBe(true);
  });
});
