import { describe, it, expect } from 'vitest';

import { LogSheetUnitViewModelBuilder } from './unit-view-model-builder';
import {
  createActiveMachineIds,
  createDetailSnapshot,
  createEntryStateMap,
  createMachine,
  createConfig,
  createParameter,
  createChillerParameter,
  createCTParameter,
} from './__test-utils__/fixtures';
import { buildMobileUnitViewModelForLogSheet } from './mobile-view-adapter';
import type { IReadonlyEntryState } from './contracts';

describe('LogSheetUnitViewModelBuilder - build() method', () => {
  describe('configuration validation', () => {
    it('throws CONFIGURATION_ERROR when featureEnabled is false', () => {
      const builder = new LogSheetUnitViewModelBuilder();
      const detail = createDetailSnapshot();
      const entryState = createEntryStateMap();
      const config = createConfig({ featureEnabled: false });

      expect(() => builder.build(detail, entryState, config)).toThrow(
        expect.objectContaining({
          kind: 'CONFIGURATION_ERROR',
          field: 'featureEnabled',
        })
      );
    });

    it('throws CONFIGURATION_ERROR when maxVisibleUnits is 0', () => {
      const builder = new LogSheetUnitViewModelBuilder();
      const detail = createDetailSnapshot();
      const entryState = createEntryStateMap();
      const config = createConfig({ featureEnabled: true, maxVisibleUnits: 0 });

      expect(() => builder.build(detail, entryState, config)).toThrow(
        expect.objectContaining({
          kind: 'CONFIGURATION_ERROR',
          field: 'maxVisibleUnits',
        })
      );
    });

    it('throws CONFIGURATION_ERROR when maxVisibleUnits is negative', () => {
      const builder = new LogSheetUnitViewModelBuilder();
      const detail = createDetailSnapshot();
      const entryState = createEntryStateMap();
      const config = createConfig({
        featureEnabled: true,
        maxVisibleUnits: -1,
      });

      expect(() => builder.build(detail, entryState, config)).toThrow(
        expect.objectContaining({
          kind: 'CONFIGURATION_ERROR',
          field: 'maxVisibleUnits',
        })
      );
    });

    it('accepts maxVisibleUnits as undefined', () => {
      const builder = new LogSheetUnitViewModelBuilder();
      const detail = createDetailSnapshot({
        machines: { chillers: [createMachine()], coolingTowers: [] },
      });
      const entryState = createEntryStateMap();
      const config = createConfig({
        featureEnabled: true,
        maxVisibleUnits: undefined,
      });

      expect(() => builder.build(detail, entryState, config)).not.toThrow();
    });
  });

  describe('empty data handling', () => {
    it('returns empty units array when no machines exist', () => {
      const builder = new LogSheetUnitViewModelBuilder();
      const detail = createDetailSnapshot({
        machines: { chillers: [], coolingTowers: [] },
        activeMachineIds: createActiveMachineIds({
          chillers: [],
          coolingTowers: [],
        }),
      });
      const entryState = createEntryStateMap();
      const config = createConfig({ featureEnabled: true });

      const viewModel = builder.build(detail, entryState, config);

      expect(viewModel.units).toEqual([]);
      expect(viewModel.activeUnitId).toBeNull();
      expect(viewModel.categoriesByUnit.size).toBe(0);
    });

    it('returns empty categories when no parameters match unit type', () => {
      const builder = new LogSheetUnitViewModelBuilder();
      const detail = createDetailSnapshot({
        machines: {
          chillers: [createMachine({ id: 'ch-1', unitNumber: 1 })],
          coolingTowers: [],
        },
        activeMachineIds: createActiveMachineIds({
          chillers: ['ch-1'],
          coolingTowers: [],
        }),
        parameters: [createCTParameter()],
      });
      const entryState = createEntryStateMap();
      const config = createConfig({ featureEnabled: true });

      const viewModel = builder.build(detail, entryState, config);

      expect(viewModel.units).toHaveLength(1);
      const categories = viewModel.categoriesByUnit.get('CHILLER-1');
      expect(categories).toEqual([]);
    });

    it('handles null entryState gracefully', () => {
      const builder = new LogSheetUnitViewModelBuilder();
      const detail = createDetailSnapshot({
        machines: { chillers: [createMachine()], coolingTowers: [] },
      });
      const entryState = createEntryStateMap();
      const config = createConfig({ featureEnabled: true });

      const viewModel = builder.build(detail, entryState, config);

      expect(viewModel.units).toBeDefined();
      expect(viewModel.units[0].completion.completedCount).toBe(0);
    });

    it('handles null parameters gracefully', () => {
      const builder = new LogSheetUnitViewModelBuilder();
      const detail = createDetailSnapshot({
        machines: { chillers: [createMachine()], coolingTowers: [] },
        parameters: [],
      });
      const entryState = createEntryStateMap();
      const config = createConfig({ featureEnabled: true });

      const viewModel = builder.build(detail, entryState, config);

      expect(viewModel.units[0].completion.totalCount).toBe(0);
      expect(viewModel.units[0].status).toBe('EMPTY');
    });
  });

  describe('active unit selection', () => {
    it('returns null activeUnitId when defaultViewMode is overview-first', () => {
      const builder = new LogSheetUnitViewModelBuilder();
      const detail = createDetailSnapshot({
        machines: { chillers: [createMachine()], coolingTowers: [] },
      });
      const entryState = createEntryStateMap();
      const config = createConfig({
        featureEnabled: true,
        defaultViewMode: 'overview-first',
      });

      const viewModel = builder.build(detail, entryState, config);

      expect(viewModel.activeUnitId).toBeNull();
    });

    it('returns first unit as activeUnitId when defaultViewMode is unit-first', () => {
      const builder = new LogSheetUnitViewModelBuilder();
      const detail = createDetailSnapshot({
        machines: {
          chillers: [
            createMachine({ id: 'ch-1' }),
            createMachine({ id: 'ch-2' }),
          ],
          coolingTowers: [],
        },
        activeMachineIds: createActiveMachineIds({
          chillers: ['ch-1', 'ch-2'],
          coolingTowers: [],
        }),
      });
      const entryState = createEntryStateMap();
      const config = createConfig({
        featureEnabled: true,
        defaultViewMode: 'unit-first',
      });

      const viewModel = builder.build(detail, entryState, config);

      expect(viewModel.activeUnitId).toBe('CHILLER-1');
    });
  });

  describe('machine visibility', () => {
    it('shows all machines when activeMachineIds is empty', () => {
      const builder = new LogSheetUnitViewModelBuilder();
      const detail = createDetailSnapshot({
        machines: {
          chillers: [
            createMachine({ id: 'ch-1', unitNumber: 1 }),
            createMachine({ id: 'ch-2', unitNumber: 2 }),
          ],
          coolingTowers: [],
        },
        activeMachineIds: createActiveMachineIds({
          chillers: [],
          coolingTowers: [],
        }),
      });
      const entryState = createEntryStateMap();
      const config = createConfig({ featureEnabled: true });

      const viewModel = builder.build(detail, entryState, config);

      expect(viewModel.units).toHaveLength(2);
      expect(viewModel.units.map(u => u.id)).toEqual([
        'CHILLER-1',
        'CHILLER-2',
      ]);
    });

    it('filters machines by activeMachineIds', () => {
      const builder = new LogSheetUnitViewModelBuilder();
      const detail = createDetailSnapshot({
        machines: {
          chillers: [
            createMachine({ id: 'ch-1', unitNumber: 1 }),
            createMachine({ id: 'ch-2', unitNumber: 2 }),
            createMachine({ id: 'ch-3', unitNumber: 3 }),
          ],
          coolingTowers: [],
        },
        activeMachineIds: createActiveMachineIds({
          chillers: ['ch-2'],
          coolingTowers: [],
        }),
      });
      const entryState = createEntryStateMap();
      const config = createConfig({ featureEnabled: true });

      const viewModel = builder.build(detail, entryState, config);

      expect(viewModel.units).toHaveLength(1);
      expect(viewModel.units[0].id).toBe('CHILLER-2');
    });

    it('handles non-existent activeMachineIds gracefully', () => {
      const builder = new LogSheetUnitViewModelBuilder();
      const detail = createDetailSnapshot({
        machines: {
          chillers: [createMachine({ id: 'ch-1' })],
          coolingTowers: [],
        },
        activeMachineIds: createActiveMachineIds({
          chillers: ['non-existent-id'],
          coolingTowers: [],
        }),
      });
      const entryState = createEntryStateMap();
      const config = createConfig({ featureEnabled: true });

      const viewModel = builder.build(detail, entryState, config);

      expect(viewModel.units).toEqual([]);
    });
  });

  describe('unit ordering', () => {
    it('orders chillers before cooling towers', () => {
      const builder = new LogSheetUnitViewModelBuilder();
      const detail = createDetailSnapshot({
        machines: {
          chillers: [createMachine({ id: 'ch-1', unitNumber: 5 })],
          coolingTowers: [
            createMachine({ id: 'ct-1', unitNumber: 1, type: 'COOLING_TOWER' }),
          ],
        },
        activeMachineIds: createActiveMachineIds({
          chillers: ['ch-1'],
          coolingTowers: ['ct-1'],
        }),
        parameters: [createChillerParameter(), createCTParameter()],
      });
      const entryState = createEntryStateMap();
      const config = createConfig({ featureEnabled: true });

      const viewModel = builder.build(detail, entryState, config);

      expect(viewModel.units.map(u => u.type)).toEqual([
        'CHILLER',
        'COOLING_TOWER',
      ]);
    });

    it('orders units by unitNumber within same type', () => {
      const builder = new LogSheetUnitViewModelBuilder();
      const detail = createDetailSnapshot({
        machines: {
          chillers: [
            createMachine({ id: 'ch-3', unitNumber: 3 }),
            createMachine({ id: 'ch-1', unitNumber: 1 }),
            createMachine({ id: 'ch-2', unitNumber: 2 }),
          ],
          coolingTowers: [],
        },
        activeMachineIds: createActiveMachineIds({
          chillers: ['ch-1', 'ch-2', 'ch-3'],
          coolingTowers: [],
        }),
      });
      const entryState = createEntryStateMap();
      const config = createConfig({ featureEnabled: true });

      const viewModel = builder.build(detail, entryState, config);

      expect(viewModel.units.map(u => u.id)).toEqual([
        'CHILLER-3',
        'CHILLER-1',
        'CHILLER-2',
      ]);
    });
  });
});

describe('LogSheetUnitViewModelBuilder (mobile layout)', () => {
  it('shows only one active unit screen at a time on mobile (happy path)', () => {
    const builder = new LogSheetUnitViewModelBuilder();

    const detail = createDetailSnapshot({
      machines: {
        chillers: [
          createMachine({ id: 'ch-1', unitNumber: 1 }),
          createMachine({ id: 'ch-2', unitNumber: 2 }),
        ],
        coolingTowers: [],
      },
      activeMachineIds: createActiveMachineIds({
        chillers: ['ch-1', 'ch-2'],
        coolingTowers: [],
      }),
    });

    const entryState = createEntryStateMap();
    const config = createConfig({
      featureEnabled: true,
      defaultViewMode: 'unit-first',
      maxVisibleUnits: 1,
    });

    const viewModel = builder.build(detail, entryState, config);

    expect(viewModel.units.map(u => u.id)).toEqual(['CHILLER-1', 'CHILLER-2']);
    expect(viewModel.activeUnitId).toBe('CHILLER-1');

    const activeCategories = viewModel.categoriesByUnit.get(
      viewModel.activeUnitId!
    );
    expect(activeCategories).toBeDefined();
    expect(activeCategories!.length).toBeGreaterThan(0);

    const inactiveUnitId = 'CHILLER-2';
    const inactiveCategories = viewModel.categoriesByUnit.get(inactiveUnitId);
    expect(inactiveCategories).toBeDefined();
  });

  it('includes only active units from the current log sheet', () => {
    const builder = new LogSheetUnitViewModelBuilder();

    const detail = createDetailSnapshot({
      machines: {
        chillers: [
          createMachine({ id: 'ch-1', unitNumber: 1 }),
          createMachine({ id: 'ch-2', unitNumber: 2 }),
        ],
        coolingTowers: [],
      },
      activeMachineIds: createActiveMachineIds({
        chillers: ['ch-2'],
        coolingTowers: [],
      }),
    });

    const entryState = createEntryStateMap();
    const config = createConfig({
      featureEnabled: true,
      defaultViewMode: 'unit-first',
    });

    const viewModel = builder.build(detail, entryState, config);

    expect(viewModel.units.map(u => u.id)).toEqual(['CHILLER-2']);
    expect(viewModel.activeUnitId).toBe('CHILLER-2');
  });

  it('builds a mobile unit view model usable by the current logsheet UI', () => {
    const builder = new LogSheetUnitViewModelBuilder();

    const detail = createDetailSnapshot({
      machines: {
        chillers: [createMachine({ id: 'ch-1', unitNumber: 1 })],
        coolingTowers: [],
      },
      activeMachineIds: createActiveMachineIds({
        chillers: ['ch-1'],
        coolingTowers: [],
      }),
    });

    const entryState = createEntryStateMap();
    const config = createConfig({
      featureEnabled: true,
      defaultViewMode: 'unit-first',
    });

    const viewModel = buildMobileUnitViewModelForLogSheet({
      detail,
      entryState,
      config,
      builder,
    });

    expect(viewModel.units.map(u => u.label)).toEqual(['Chiller #1']);
    expect(viewModel.activeUnitId).toBe('CHILLER-1');

    const categoriesForActiveUnit = viewModel.categoriesByUnit.get(
      viewModel.activeUnitId!
    );
    expect(categoriesForActiveUnit).toBeDefined();
    expect(categoriesForActiveUnit!.length).toBeGreaterThan(0);
  });

  it('returns an empty model when builder throws', () => {
    const failingBuilder = {
      build() {
        throw new Error('boom');
      },
    };

    const detail = createDetailSnapshot();
    const entryState = createEntryStateMap();
    const config = createConfig({
      featureEnabled: true,
      defaultViewMode: 'unit-first',
    });

    const viewModel = buildMobileUnitViewModelForLogSheet({
      detail,
      entryState,
      config,
      builder: failingBuilder,
    });

    expect(viewModel.units).toEqual([]);
    expect(viewModel.activeUnitId).toBeNull();
    expect(viewModel.categoriesByUnit.size).toBe(0);
    expect(viewModel.summaryFields).toEqual([]);
  });
});

describe('LogSheetUnitViewModelBuilder - cooling towers', () => {
  it('includes cooling tower units with correct categories', () => {
    const builder = new LogSheetUnitViewModelBuilder();

    const detail = createDetailSnapshot({
      machines: {
        chillers: [],
        coolingTowers: [
          createMachine({ id: 'ct-1', unitNumber: 1, type: 'COOLING_TOWER' }),
        ],
      },
      activeMachineIds: createActiveMachineIds({
        chillers: [],
        coolingTowers: ['ct-1'],
      }),
      parameters: [createCTParameter()],
    });

    const entryState = createEntryStateMap();
    const config = createConfig({
      featureEnabled: true,
      defaultViewMode: 'unit-first',
    });

    const viewModel = builder.build(detail, entryState, config);

    expect(viewModel.units).toHaveLength(1);
    expect(viewModel.units[0].id).toBe('COOLING_TOWER-1');
    expect(viewModel.units[0].type).toBe('COOLING_TOWER');
    expect(viewModel.units[0].label).toBe('Cooling Tower #1');
  });

  it('sorts units with chillers before cooling towers', () => {
    const builder = new LogSheetUnitViewModelBuilder();

    const detail = createDetailSnapshot({
      machines: {
        chillers: [createMachine({ id: 'ch-1', unitNumber: 2 })],
        coolingTowers: [
          createMachine({ id: 'ct-1', unitNumber: 1, type: 'COOLING_TOWER' }),
        ],
      },
      activeMachineIds: createActiveMachineIds({
        chillers: ['ch-1'],
        coolingTowers: ['ct-1'],
      }),
      parameters: [createChillerParameter(), createCTParameter()],
    });

    const entryState = createEntryStateMap();
    const config = createConfig({ featureEnabled: true });

    const viewModel = builder.build(detail, entryState, config);

    expect(viewModel.units.map(u => u.type)).toEqual([
      'CHILLER',
      'COOLING_TOWER',
    ]);
  });
});

describe('LogSheetUnitViewModelBuilder - completion stats', () => {
  it('calculates completion for chiller with no entries', () => {
    const builder = new LogSheetUnitViewModelBuilder();

    const detail = createDetailSnapshot({
      machines: {
        chillers: [createMachine({ id: 'ch-1', unitNumber: 1 })],
        coolingTowers: [],
      },
      activeMachineIds: createActiveMachineIds({
        chillers: ['ch-1'],
        coolingTowers: [],
      }),
      parameters: [createChillerParameter()],
    });

    const entryState = createEntryStateMap();
    const config = createConfig({ featureEnabled: true });

    const viewModel = builder.build(detail, entryState, config);

    expect(viewModel.units[0].completion.totalCount).toBe(1);
    expect(viewModel.units[0].completion.completedCount).toBe(0);
    expect(viewModel.units[0].completion.completionRatio).toBe(0);
    expect(viewModel.units[0].status).toBe('EMPTY');
  });

  it('calculates completion for chiller with completed entries', () => {
    const builder = new LogSheetUnitViewModelBuilder();

    const detail = createDetailSnapshot({
      machines: {
        chillers: [createMachine({ id: 'ch-1', unitNumber: 1 })],
        coolingTowers: [],
      },
      activeMachineIds: createActiveMachineIds({
        chillers: ['ch-1'],
        coolingTowers: [],
      }),
      parameters: [createChillerParameter({ id: 'param-1' })],
    });

    const entryState = createEntryStateMap({
      'param-1:ch-1:VALUE': {
        valueType: 'NUMBER',
        numericValue: 15,
      } as IReadonlyEntryState,
    });
    const config = createConfig({ featureEnabled: true });

    const viewModel = builder.build(detail, entryState, config);

    expect(viewModel.units[0].completion.completedCount).toBe(1);
    expect(viewModel.units[0].completion.completionRatio).toBe(1);
    expect(viewModel.units[0].status).toBe('COMPLETE');
  });

  it('marks status as IN_PROGRESS when partially complete', () => {
    const builder = new LogSheetUnitViewModelBuilder();

    const detail = createDetailSnapshot({
      machines: {
        chillers: [createMachine({ id: 'ch-1', unitNumber: 1 })],
        coolingTowers: [],
      },
      activeMachineIds: createActiveMachineIds({
        chillers: ['ch-1'],
        coolingTowers: [],
      }),
      parameters: [
        createChillerParameter({ id: 'param-1' }),
        createChillerParameter({ id: 'param-2', name: 'Evaporator Temp' }),
      ],
    });

    const entryState = createEntryStateMap({
      'param-1:ch-1:VALUE': {
        valueType: 'NUMBER',
        numericValue: 15,
      } as IReadonlyEntryState,
    });
    const config = createConfig({ featureEnabled: true });

    const viewModel = builder.build(detail, entryState, config);

    expect(viewModel.units[0].completion.completedCount).toBe(1);
    expect(viewModel.units[0].completion.totalCount).toBe(2);
    expect(viewModel.units[0].status).toBe('IN_PROGRESS');
  });
});

describe('LogSheetUnitViewModelBuilder - parameter rows', () => {
  it('builds parameter rows with target range text', () => {
    const builder = new LogSheetUnitViewModelBuilder();

    const detail = createDetailSnapshot({
      machines: {
        chillers: [createMachine({ id: 'ch-1', unitNumber: 1 })],
        coolingTowers: [],
      },
      activeMachineIds: createActiveMachineIds({
        chillers: ['ch-1'],
        coolingTowers: [],
      }),
      parameters: [
        createChillerParameter({ id: 'param-1', minValue: 10, maxValue: 20 }),
      ],
    });

    const entryState = createEntryStateMap();
    const config = createConfig({ featureEnabled: true });

    const viewModel = builder.build(detail, entryState, config);
    const categories = viewModel.categoriesByUnit.get('CHILLER-1')!;
    const params = categories[0]?.parameters ?? [];

    expect(params).toHaveLength(1);
    expect(params[0].targetRangeText).toBe('10 - 20');
    expect(params[0].minValue).toBe(10);
    expect(params[0].maxValue).toBe(20);
  });

  it('includes raw water fields for COOLING_WATER_QUALITY parameters', () => {
    const builder = new LogSheetUnitViewModelBuilder();

    const detail = createDetailSnapshot({
      machines: {
        chillers: [],
        coolingTowers: [
          createMachine({ id: 'ct-1', unitNumber: 1, type: 'COOLING_TOWER' }),
        ],
      },
      activeMachineIds: createActiveMachineIds({
        chillers: [],
        coolingTowers: ['ct-1'],
      }),
      parameters: [
        createCTParameter({
          id: 'param-cw-1',
          minValue: 6.5,
          maxValue: 8.5,
          rawWaterMinValue: 6.0,
          rawWaterMaxValue: 8.0,
        }),
      ],
    });

    const entryState = createEntryStateMap();
    const config = createConfig({ featureEnabled: true });

    const viewModel = builder.build(detail, entryState, config);
    const categories = viewModel.categoriesByUnit.get('COOLING_TOWER-1')!;
    const params = categories[0]?.parameters ?? [];

    expect(params).toHaveLength(1);
    expect(params[0].rawWaterMinValue).toBe(6.0);
    expect(params[0].rawWaterMaxValue).toBe(8.0);
    expect(params[0].rawWaterEntryKey).toBe('param-cw-1:null:RAW_WATER');
    expect(params[0].noteEntryKey).toBeNull();
  });

  it('includes note entry key for GENERAL_CONDITION parameters', () => {
    const builder = new LogSheetUnitViewModelBuilder();

    const detail = createDetailSnapshot({
      machines: {
        chillers: [],
        coolingTowers: [
          createMachine({ id: 'ct-1', unitNumber: 1, type: 'COOLING_TOWER' }),
        ],
      },
      activeMachineIds: createActiveMachineIds({
        chillers: [],
        coolingTowers: ['ct-1'],
      }),
      parameters: [
        {
          ...createCTParameter({ id: 'param-gc-1' }),
          category: 'GENERAL_CONDITION',
        },
      ],
    });

    const entryState = createEntryStateMap();
    const config = createConfig({ featureEnabled: true });

    const viewModel = builder.build(detail, entryState, config);
    const categories = viewModel.categoriesByUnit.get('COOLING_TOWER-1')!;
    const gcCategory = categories.find(c => c.id === 'GENERAL_CONDITION');
    const params = gcCategory?.parameters ?? [];

    expect(params).toHaveLength(1);
    expect(params[0].noteEntryKey).toBe('param-gc-1:null:NOTE');
    expect(params[0].rawWaterEntryKey).toBeNull();
  });

  it('includes note entry key for JOB_DESCRIPTION parameters', () => {
    const builder = new LogSheetUnitViewModelBuilder();

    const detail = createDetailSnapshot({
      machines: {
        chillers: [],
        coolingTowers: [
          createMachine({ id: 'ct-1', unitNumber: 1, type: 'COOLING_TOWER' }),
        ],
      },
      activeMachineIds: createActiveMachineIds({
        chillers: [],
        coolingTowers: ['ct-1'],
      }),
      parameters: [
        {
          ...createCTParameter({ id: 'param-jd-1' }),
          category: 'JOB_DESCRIPTION',
        },
      ],
    });

    const entryState = createEntryStateMap();
    const config = createConfig({ featureEnabled: true });

    const viewModel = builder.build(detail, entryState, config);
    const categories = viewModel.categoriesByUnit.get('COOLING_TOWER-1')!;
    const jdCategory = categories.find(c => c.id === 'JOB_DESCRIPTION');
    const params = jdCategory?.parameters ?? [];

    expect(params).toHaveLength(1);
    expect(params[0].noteEntryKey).toBe('param-jd-1:null:NOTE');
  });

  it('sets raw water fields to null for non-cooling-water parameters', () => {
    const builder = new LogSheetUnitViewModelBuilder();

    const detail = createDetailSnapshot({
      machines: {
        chillers: [createMachine({ id: 'ch-1', unitNumber: 1 })],
        coolingTowers: [],
      },
      activeMachineIds: createActiveMachineIds({
        chillers: ['ch-1'],
        coolingTowers: [],
      }),
      parameters: [createChillerParameter({ id: 'param-1' })],
    });

    const entryState = createEntryStateMap();
    const config = createConfig({ featureEnabled: true });

    const viewModel = builder.build(detail, entryState, config);
    const categories = viewModel.categoriesByUnit.get('CHILLER-1')!;
    const params = categories[0]?.parameters ?? [];

    expect(params[0].rawWaterMinValue).toBeNull();
    expect(params[0].rawWaterMaxValue).toBeNull();
    expect(params[0].rawWaterEntryKey).toBeNull();
    expect(params[0].noteEntryKey).toBeNull();
  });

  it('marks inRange as true when value is within limits', () => {
    const builder = new LogSheetUnitViewModelBuilder();

    const detail = createDetailSnapshot({
      machines: {
        chillers: [createMachine({ id: 'ch-1', unitNumber: 1 })],
        coolingTowers: [],
      },
      activeMachineIds: createActiveMachineIds({
        chillers: ['ch-1'],
        coolingTowers: [],
      }),
      parameters: [
        createChillerParameter({ id: 'param-1', minValue: 10, maxValue: 20 }),
      ],
    });

    const entryState = createEntryStateMap({
      'param-1:ch-1:VALUE': {
        valueType: 'NUMBER',
        numericValue: 15,
      } as IReadonlyEntryState,
    });
    const config = createConfig({ featureEnabled: true });

    const viewModel = builder.build(detail, entryState, config);
    const categories = viewModel.categoriesByUnit.get('CHILLER-1')!;
    const params = categories[0]?.parameters ?? [];

    expect(params[0].inRange).toBe(true);
  });

  it('marks inRange as false when value is out of limits', () => {
    const builder = new LogSheetUnitViewModelBuilder();

    const detail = createDetailSnapshot({
      machines: {
        chillers: [createMachine({ id: 'ch-1', unitNumber: 1 })],
        coolingTowers: [],
      },
      activeMachineIds: createActiveMachineIds({
        chillers: ['ch-1'],
        coolingTowers: [],
      }),
      parameters: [
        createChillerParameter({ id: 'param-1', minValue: 10, maxValue: 20 }),
      ],
    });

    const entryState = createEntryStateMap({
      'param-1:ch-1:VALUE': {
        valueType: 'NUMBER',
        numericValue: 25,
      } as IReadonlyEntryState,
    });
    const config = createConfig({ featureEnabled: true });

    const viewModel = builder.build(detail, entryState, config);
    const categories = viewModel.categoriesByUnit.get('CHILLER-1')!;
    const params = categories[0]?.parameters ?? [];

    expect(params[0].inRange).toBe(false);
  });
});
