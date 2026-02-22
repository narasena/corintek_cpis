import { beforeEach, describe, expect, it, vi } from 'vitest';

import { makeEntryKey } from '../utils';

function generateMockParameters(count: number): Array<{
  id: string;
  name: string;
  variableName: string;
  category:
    | 'UNIT_CONDENSOR'
    | 'UNIT_EVAPORATOR'
    | 'COOLING_WATER_QUALITY'
    | 'GENERAL_CONDITION'
    | 'JOB_DESCRIPTION'
    | 'CONSUMPTION';
  valueType: 'NUMBER' | 'BOOLEAN' | 'TEXT';
  unit: string | null;
  minValue: number | null;
  maxValue: number | null;
  displayOrder: number;
}> {
  const categories = [
    'UNIT_CONDENSOR',
    'UNIT_EVAPORATOR',
    'COOLING_WATER_QUALITY',
    'GENERAL_CONDITION',
    'JOB_DESCRIPTION',
    'CONSUMPTION',
  ] as const;
  const params = [];

  for (let i = 0; i < count; i++) {
    const cat = categories[i % categories.length];
    params.push({
      id: `param-${i}`,
      name: `Parameter ${i}`,
      variableName: `param_${i}`,
      category: cat,
      valueType: (i % 3 === 0 ? 'BOOLEAN' : 'NUMBER') as
        | 'NUMBER'
        | 'BOOLEAN'
        | 'TEXT',
      unit:
        cat.includes('TEMP') || cat.includes('CONDENSOR')
          ? '°C'
          : cat.includes('WATER')
            ? 'ppm'
            : null,
      minValue: i % 5 === 0 ? 0 : 10,
      maxValue: i % 5 === 0 ? 100 : 50,
      displayOrder: i,
    });
  }

  return params;
}

function generateMockMachines(
  chillerCount: number,
  coolingTowerCount: number
): {
  chillers: Array<{ id: string; unitNumber: number; type: 'CHILLER' }>;
  coolingTowers: Array<{
    id: string;
    unitNumber: number;
    type: 'COOLING_TOWER';
  }>;
} {
  const chillers = Array.from({ length: chillerCount }, (_, i) => ({
    id: `chiller-${i}`,
    unitNumber: i + 1,
    type: 'CHILLER' as const,
  }));

  const coolingTowers = Array.from({ length: coolingTowerCount }, (_, i) => ({
    id: `ct-${i}`,
    unitNumber: i + 1,
    type: 'COOLING_TOWER' as const,
  }));

  return { chillers, coolingTowers };
}

function generateMockValuesByKey(
  parameters: Array<{ id: string; category: string; valueType: string }>,
  machines: {
    chillers: Array<{ id: string }>;
    coolingTowers: Array<{ id: string }>;
  }
): Record<
  string,
  {
    valueType: 'NUMBER' | 'BOOLEAN' | 'TEXT';
    numericValue?: number;
    boolValue?: boolean;
    textValue?: string;
  }
> {
  const valuesByKey: Record<
    string,
    {
      valueType: 'NUMBER' | 'BOOLEAN' | 'TEXT';
      numericValue?: number;
      boolValue?: boolean;
      textValue?: string;
    }
  > = {};

  for (const param of parameters) {
    const relevantMachines =
      param.category === 'UNIT_CONDENSOR' ||
      param.category === 'UNIT_EVAPORATOR'
        ? machines.chillers
        : param.category === 'COOLING_WATER_QUALITY' ||
            param.category === 'GENERAL_CONDITION' ||
            param.category === 'JOB_DESCRIPTION'
          ? machines.coolingTowers
          : [];

    for (const machine of relevantMachines) {
      const key = makeEntryKey(param.id, machine.id, 'VALUE');
      if (param.valueType === 'BOOLEAN') {
        valuesByKey[key] = {
          valueType: 'BOOLEAN',
          boolValue: Math.random() > 0.5,
        };
      } else {
        valuesByKey[key] = {
          valueType: 'NUMBER',
          numericValue: Math.random() * 100,
        };
      }
    }

    if (param.category === 'COOLING_WATER_QUALITY') {
      const rawKey = makeEntryKey(param.id, null, 'RAW_WATER');
      valuesByKey[rawKey] = {
        valueType: 'NUMBER',
        numericValue: Math.random() * 100,
      };
    }
  }

  return valuesByKey;
}

function generateMockChemicalUsages(
  count: number
): Array<{ chemicalName: string; amount: number; unit: string }> {
  const chemicals = [
    'Biocide',
    'Corrosion Inhibitor',
    'Scale Inhibitor',
    'Dispersant',
    'Oxidizer',
  ];

  return Array.from({ length: count }, (_, i) => ({
    chemicalName: chemicals[i % chemicals.length],
    amount: Math.floor(Math.random() * 100) + 10,
    unit: 'kg',
  }));
}

describe('Log Sheet Performance - large data sets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('makeEntryKey performance', () => {
    it('generates 10,000 entry keys in under 100ms (main path)', () => {
      const iterations = 10000;
      const paramId = 'param-123';
      const machineId = 'machine-456';
      const role = 'VALUE';

      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        makeEntryKey(paramId, machineId, role);
      }

      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it('generates keys with null machineId efficiently (main path)', () => {
      const iterations = 10000;

      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        makeEntryKey(`param-${i}`, null, 'RAW_WATER');
      }

      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100);
    });
  });

  describe('valuesByKey lookup performance', () => {
    it('looks up 10,000 entries by key in under 50ms (main path)', () => {
      const params = generateMockParameters(50);
      const machines = generateMockMachines(5, 5);
      const valuesByKey = generateMockValuesByKey(params, machines);

      const keys = Object.keys(valuesByKey);
      const iterations = 10000;

      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        const key = keys[i % keys.length];
        const _ = valuesByKey[key];
      }

      const duration = performance.now() - start;

      expect(duration).toBeLessThan(50);
    });

    it('looks up with missing keys returns undefined efficiently (edge case)', () => {
      const params = generateMockParameters(50);
      const machines = generateMockMachines(5, 5);
      const valuesByKey = generateMockValuesByKey(params, machines);

      const iterations = 10000;

      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        const _ = valuesByKey[`non-existent-key-${i}`];
      }

      const duration = performance.now() - start;

      expect(duration).toBeLessThan(50);
    });
  });

  describe('large data set generation', () => {
    it('generates 100 parameters in under 10ms (main path)', () => {
      const start = performance.now();

      const params = generateMockParameters(100);

      const duration = performance.now() - start;

      expect(params).toHaveLength(100);
      expect(duration).toBeLessThan(10);
    });

    it('generates 10 machines (5 chillers + 5 cooling towers) in under 5ms (main path)', () => {
      const start = performance.now();

      const machines = generateMockMachines(5, 5);

      const duration = performance.now() - start;

      expect(machines.chillers).toHaveLength(5);
      expect(machines.coolingTowers).toHaveLength(5);
      expect(duration).toBeLessThan(5);
    });

    it('generates valuesByKey for 50 params and 10 machines in under 50ms (main path)', () => {
      const params = generateMockParameters(50);
      const machines = generateMockMachines(5, 5);

      const start = performance.now();

      const valuesByKey = generateMockValuesByKey(params, machines);

      const duration = performance.now() - start;

      const keyCount = Object.keys(valuesByKey).length;
      expect(keyCount).toBeGreaterThan(0);
      expect(duration).toBeLessThan(50);
    });

    it('generates 20 chemical usages in under 5ms (main path)', () => {
      const start = performance.now();

      const chemicals = generateMockChemicalUsages(20);

      const duration = performance.now() - start;

      expect(chemicals).toHaveLength(20);
      expect(duration).toBeLessThan(5);
    });
  });

  describe('memory efficiency', () => {
    it('large valuesByKey object has reasonable memory footprint (main path)', () => {
      const params = generateMockParameters(100);
      const machines = generateMockMachines(10, 10);
      const valuesByKey = generateMockValuesByKey(params, machines);

      const keyCount = Object.keys(valuesByKey).length;

      const serializedSize = JSON.stringify(valuesByKey).length;

      const sizePerEntry = serializedSize / keyCount;

      expect(keyCount).toBeGreaterThan(500);
      expect(sizePerEntry).toBeLessThan(200);
    });
  });
});
