import { describe, it, expect } from 'vitest';
import {
  applyProjectLimits,
  applyProjectOverridesToParameters,
  buildCategoryLimitsMap,
  type IParameterLike,
  type IParameterOverrideLike,
  type ICategoryLimitLike,
  type ILimitResolutionContext,
} from './limits-utils';

describe('applyProjectLimits', () => {
  const createMockParameter = (
    overrides: Partial<IParameterLike> = {}
  ): IParameterLike => ({
    id: 'param-1',
    minValue: 0,
    maxValue: 100,
    rawWaterMinValue: 0,
    rawWaterMaxValue: 50,
    ...overrides,
  });

  const createMockCategoryLimit = (
    overrides: Partial<ICategoryLimitLike> = {}
  ): ICategoryLimitLike => ({
    parameterId: 'param-1',
    minValue: 10,
    maxValue: 90,
    rawWaterMinValue: 5,
    rawWaterMaxValue: 45,
    ...overrides,
  });

  const createMockOverride = (
    overrides: Partial<IParameterOverrideLike> = {}
  ): IParameterOverrideLike => ({
    parameterId: 'param-1',
    minValue: 20,
    maxValue: 80,
    rawWaterMinValue: 10,
    rawWaterMaxValue: 40,
    ...overrides,
  });

  const createContext = (
    partial: Partial<ILimitResolutionContext> = {}
  ): ILimitResolutionContext => ({
    overrides: [],
    ...partial,
  });

  describe('parameter validation', () => {
    it('returns empty array when parameters is empty', () => {
      const result = applyProjectLimits([], createContext());
      expect(result).toEqual([]);
    });

    it('returns empty array when parameters is null', () => {
      const result = applyProjectLimits(null as any, createContext());
      expect(result).toEqual([]);
    });

    it('returns empty array when parameters is undefined', () => {
      const result = applyProjectLimits(undefined as any, createContext());
      expect(result).toEqual([]);
    });

    it('returns original array when context has no limits', () => {
      const params = [createMockParameter()];
      const result = applyProjectLimits(params, createContext());
      expect(result).toBe(params);
    });

    it('returns original array when categoryLimitsMap is undefined and overrides empty', () => {
      const params = [createMockParameter()];
      const result = applyProjectLimits(
        params,
        createContext({ overrides: [] })
      );
      expect(result).toBe(params);
    });
  });

  describe('category limits application', () => {
    it('applies category limits when no overrides exist', () => {
      const params = [createMockParameter()];
      const categoryLimitsMap = new Map<string, ICategoryLimitLike>([
        ['param-1', createMockCategoryLimit()],
      ]);

      const result = applyProjectLimits(params, {
        categoryLimitsMap,
        overrides: [],
      });

      expect(result[0].minValue).toBe(10);
      expect(result[0].maxValue).toBe(90);
      expect(result[0].rawWaterMinValue).toBe(5);
      expect(result[0].rawWaterMaxValue).toBe(45);
    });

    it('does not modify parameter when category limit has null values', () => {
      const params = [createMockParameter()];
      const categoryLimitsMap = new Map<string, ICategoryLimitLike>([
        [
          'param-1',
          {
            parameterId: 'param-1',
            minValue: null,
            maxValue: null,
            rawWaterMinValue: null,
            rawWaterMaxValue: null,
          },
        ],
      ]);

      const result = applyProjectLimits(params, {
        categoryLimitsMap,
        overrides: [],
      });

      expect(result[0].minValue).toBe(0);
      expect(result[0].maxValue).toBe(100);
    });

    it('partially applies category limits (only minValue)', () => {
      const params = [createMockParameter()];
      const categoryLimitsMap = new Map<string, ICategoryLimitLike>([
        [
          'param-1',
          {
            parameterId: 'param-1',
            minValue: 25,
            maxValue: null,
            rawWaterMinValue: null,
            rawWaterMaxValue: null,
          },
        ],
      ]);

      const result = applyProjectLimits(params, {
        categoryLimitsMap,
        overrides: [],
      });

      expect(result[0].minValue).toBe(25);
      expect(result[0].maxValue).toBe(100);
    });

    it('ignores category limit for parameters not in map', () => {
      const params = [createMockParameter({ id: 'param-2' })];
      const categoryLimitsMap = new Map<string, ICategoryLimitLike>([
        ['param-1', createMockCategoryLimit()],
      ]);

      const result = applyProjectLimits(params, {
        categoryLimitsMap,
        overrides: [],
      });

      expect(result[0].minValue).toBe(0);
      expect(result[0].maxValue).toBe(100);
    });

    it('handles multiple parameters with mixed category matches', () => {
      const params = [
        createMockParameter({ id: 'param-1', minValue: 0, maxValue: 100 }),
        createMockParameter({ id: 'param-2', minValue: 0, maxValue: 200 }),
        createMockParameter({ id: 'param-3', minValue: 0, maxValue: 300 }),
      ];
      const categoryLimitsMap = new Map<string, ICategoryLimitLike>([
        [
          'param-1',
          {
            parameterId: 'param-1',
            minValue: 10,
            maxValue: 90,
            rawWaterMinValue: null,
            rawWaterMaxValue: null,
          },
        ],
        [
          'param-3',
          {
            parameterId: 'param-3',
            minValue: 30,
            maxValue: 270,
            rawWaterMinValue: null,
            rawWaterMaxValue: null,
          },
        ],
      ]);

      const result = applyProjectLimits(params, {
        categoryLimitsMap,
        overrides: [],
      });

      expect(result[0].minValue).toBe(10);
      expect(result[0].maxValue).toBe(90);
      expect(result[1].minValue).toBe(0);
      expect(result[1].maxValue).toBe(200);
      expect(result[2].minValue).toBe(30);
      expect(result[2].maxValue).toBe(270);
    });
  });

  describe('override priority over category limits', () => {
    it('applies overrides when both category and override exist', () => {
      const params = [createMockParameter()];
      const categoryLimitsMap = new Map<string, ICategoryLimitLike>([
        ['param-1', createMockCategoryLimit({ minValue: 10, maxValue: 90 })],
      ]);
      const overrides = [
        createMockOverride({
          parameterId: 'param-1',
          minValue: 20,
          maxValue: 80,
        }),
      ];

      const result = applyProjectLimits(params, {
        categoryLimitsMap,
        overrides,
      });

      expect(result[0].minValue).toBe(20);
      expect(result[0].maxValue).toBe(80);
    });

    it('applies partial override - falls back to category limit for missing fields', () => {
      const params = [createMockParameter()];
      const categoryLimitsMap = new Map<string, ICategoryLimitLike>([
        ['param-1', createMockCategoryLimit({ minValue: 10, maxValue: 90 })],
      ]);
      const overrides = [
        createMockOverride({
          parameterId: 'param-1',
          minValue: 25,
          maxValue: null,
        }),
      ];

      const result = applyProjectLimits(params, {
        categoryLimitsMap,
        overrides,
      });

      expect(result[0].minValue).toBe(25);
      expect(result[0].maxValue).toBe(90);
    });
  });

  describe('raw water values', () => {
    it('applies raw water limits from category', () => {
      const params = [createMockParameter()];
      const categoryLimitsMap = new Map<string, ICategoryLimitLike>([
        [
          'param-1',
          {
            parameterId: 'param-1',
            minValue: null,
            maxValue: null,
            rawWaterMinValue: 5,
            rawWaterMaxValue: 45,
          },
        ],
      ]);

      const result = applyProjectLimits(params, {
        categoryLimitsMap,
        overrides: [],
      });

      expect(result[0].rawWaterMinValue).toBe(5);
      expect(result[0].rawWaterMaxValue).toBe(45);
    });

    it('applies raw water overrides over category', () => {
      const params = [createMockParameter()];
      const categoryLimitsMap = new Map<string, ICategoryLimitLike>([
        [
          'param-1',
          {
            parameterId: 'param-1',
            minValue: null,
            maxValue: null,
            rawWaterMinValue: 5,
            rawWaterMaxValue: 45,
          },
        ],
      ]);
      const overrides = [
        createMockOverride({
          parameterId: 'param-1',
          rawWaterMinValue: 15,
          rawWaterMaxValue: 35,
        }),
      ];

      const result = applyProjectLimits(params, {
        categoryLimitsMap,
        overrides,
      });

      expect(result[0].rawWaterMinValue).toBe(15);
      expect(result[0].rawWaterMaxValue).toBe(35);
    });
  });

  describe('immutability', () => {
    it('does not mutate original parameters array', () => {
      const params = [createMockParameter()];
      const originalFirstParam = { ...params[0] };
      const categoryLimitsMap = new Map<string, ICategoryLimitLike>([
        ['param-1', createMockCategoryLimit()],
      ]);

      applyProjectLimits(params, { categoryLimitsMap, overrides: [] });

      expect(params[0]).toEqual(originalFirstParam);
    });

    it('returns new array instance', () => {
      const params = [createMockParameter()];
      const categoryLimitsMap = new Map<string, ICategoryLimitLike>([
        ['param-1', createMockCategoryLimit()],
      ]);

      const result = applyProjectLimits(params, {
        categoryLimitsMap,
        overrides: [],
      });

      expect(result).not.toBe(params);
    });
  });
});

describe('buildCategoryLimitsMap', () => {
  it('returns empty map for null input', () => {
    const result = buildCategoryLimitsMap(null as any);
    expect(result.size).toBe(0);
  });

  it('returns empty map for undefined input', () => {
    const result = buildCategoryLimitsMap(undefined as any);
    expect(result.size).toBe(0);
  });

  it('returns empty map for empty array', () => {
    const result = buildCategoryLimitsMap([]);
    expect(result.size).toBe(0);
  });

  it('builds map from array of limits', () => {
    const limits = [
      {
        parameterId: 'p1',
        minValue: 1,
        maxValue: 10,
        rawWaterMinValue: null,
        rawWaterMaxValue: null,
      },
      {
        parameterId: 'p2',
        minValue: 2,
        maxValue: 20,
        rawWaterMinValue: null,
        rawWaterMaxValue: null,
      },
    ];

    const result = buildCategoryLimitsMap(limits);

    expect(result.size).toBe(2);
    expect(result.get('p1')).toEqual(limits[0]);
    expect(result.get('p2')).toEqual(limits[1]);
  });

  it('skips entries with invalid parameterId', () => {
    const limits = [
      {
        parameterId: 'p1',
        minValue: 1,
        maxValue: 10,
        rawWaterMinValue: null,
        rawWaterMaxValue: null,
      },
      {
        parameterId: null as any,
        minValue: 2,
        maxValue: 20,
        rawWaterMinValue: null,
        rawWaterMaxValue: null,
      },
      {
        parameterId: undefined as any,
        minValue: 3,
        maxValue: 30,
        rawWaterMinValue: null,
        rawWaterMaxValue: null,
      },
      {
        parameterId: '',
        minValue: 4,
        maxValue: 40,
        rawWaterMinValue: null,
        rawWaterMaxValue: null,
      },
    ];

    const result = buildCategoryLimitsMap(limits);

    expect(result.size).toBe(1);
    expect(result.get('p1')).toBeDefined();
  });

  it('skips null/undefined entries', () => {
    const limits = [
      null as any,
      undefined as any,
      {
        parameterId: 'p1',
        minValue: 1,
        maxValue: 10,
        rawWaterMinValue: null,
        rawWaterMaxValue: null,
      },
    ];

    const result = buildCategoryLimitsMap(limits);

    expect(result.size).toBe(1);
  });

  it('uses first occurrence when duplicate parameterId exists', () => {
    const limits = [
      {
        parameterId: 'p1',
        minValue: 1,
        maxValue: 10,
        rawWaterMinValue: null,
        rawWaterMaxValue: null,
      },
      {
        parameterId: 'p1',
        minValue: 99,
        maxValue: 999,
        rawWaterMinValue: null,
        rawWaterMaxValue: null,
      },
    ];

    const result = buildCategoryLimitsMap(limits);

    expect(result.size).toBe(1);
    expect(result.get('p1')?.minValue).toBe(1);
  });
});

describe('applyProjectOverridesToParameters', () => {
  const createMockParam = (
    overrides: Partial<IParameterLike> = {}
  ): IParameterLike => ({
    id: 'param-1',
    minValue: 0,
    maxValue: 100,
    rawWaterMinValue: 0,
    rawWaterMaxValue: 50,
    ...overrides,
  });

  it('returns original array when overrides is empty', () => {
    const params = [createMockParam()];
    const result = applyProjectOverridesToParameters(params, []);
    expect(result).toBe(params);
  });

  it('returns original array when overrides is null', () => {
    const params = [createMockParam()];
    const result = applyProjectOverridesToParameters(params, null as any);
    expect(result).toBe(params);
  });

  it('applies override to matching parameter', () => {
    const params = [createMockParam()];
    const overrides = [
      {
        parameterId: 'param-1',
        minValue: 50,
        maxValue: 75,
        rawWaterMinValue: null,
        rawWaterMaxValue: null,
      },
    ];

    const result = applyProjectOverridesToParameters(params, overrides);

    expect(result[0].minValue).toBe(50);
    expect(result[0].maxValue).toBe(75);
  });

  it('falls back to parameter values when override has null', () => {
    const params = [createMockParam({ minValue: 0, maxValue: 100 })];
    const overrides = [
      {
        parameterId: 'param-1',
        minValue: null,
        maxValue: 50,
        rawWaterMinValue: null,
        rawWaterMaxValue: null,
      },
    ];

    const result = applyProjectOverridesToParameters(params, overrides);

    expect(result[0].minValue).toBe(0);
    expect(result[0].maxValue).toBe(50);
  });
});
