import { describe, it, expect } from 'vitest';

import { LogSheetUnitViewModelBuilder } from './unit-view-model-builder';
import {
  createActiveMachineIds,
  createDetailSnapshot,
  createEntryStateMap,
  createMachine,
  createConfig,
} from './__test-utils__/fixtures';
import { buildMobileUnitViewModelForLogSheet } from './mobile-view-adapter';

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
