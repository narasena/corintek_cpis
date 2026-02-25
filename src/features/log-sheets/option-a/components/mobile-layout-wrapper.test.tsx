// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileLayoutWrapper } from './mobile-layout-wrapper';
import type {
  ILogSheetUnitViewModel,
  IUnitView,
  ICategoryView,
  TUnitId,
} from '../contracts';

vi.mock('./unit-overview-list', () => ({
  UnitOverviewList: vi.fn(
    ({ units, onSelectUnit, disabled }: Record<string, unknown>) => (
      <div data-testid="unit-overview-list">
        <span data-testid="units-count">{(units as unknown[]).length}</span>
        <span data-testid="disabled">{String(disabled)}</span>
        {(units as IUnitView[]).map(unit => (
          <button
            key={unit.id}
            data-testid={`select-unit-${unit.id}`}
            onClick={() => (onSelectUnit as (id: TUnitId) => void)(unit.id)}
            disabled={disabled as boolean}
          >
            {unit.label}
          </button>
        ))}
      </div>
    )
  ),
}));

vi.mock('./unit-entry-screen', () => ({
  UnitEntryScreen: vi.fn(
    ({ unit, categories, onBack, disabled }: Record<string, unknown>) => (
      <div data-testid="unit-entry-screen">
        <span data-testid="unit-label">{(unit as IUnitView).label}</span>
        <span data-testid="categories-count">
          {(categories as unknown[]).length}
        </span>
        <span data-testid="disabled">{String(disabled)}</span>
        <button data-testid="back-button" onClick={onBack as () => void}>
          Back
        </button>
      </div>
    )
  ),
}));

function createMockUnit(overrides?: Partial<IUnitView>): IUnitView {
  return {
    id: 'unit-1' as TUnitId,
    machineId: 'machine-1',
    label: 'Chiller #1',
    type: 'CHILLER',
    completion: {
      completedCount: 0,
      totalCount: 5,
      completionRatio: 0,
    },
    status: 'EMPTY',
    ...overrides,
  };
}

function createMockCategory(overrides?: Partial<ICategoryView>): ICategoryView {
  return {
    id: 'UNIT_CONDENSOR',
    label: 'Kondensor',
    parameters: [],
    ...overrides,
  };
}

function createMockViewModel(
  overrides?: Partial<ILogSheetUnitViewModel>
): ILogSheetUnitViewModel {
  const units = overrides?.units ?? [createMockUnit()];
  const categoriesByUnit = new Map<TUnitId, readonly ICategoryView[]>();

  if (units.length > 0) {
    categoriesByUnit.set(units[0].id, [createMockCategory()]);
  }

  return {
    units,
    activeUnitId: null,
    categoriesByUnit,
    summaryFields: [],
    ...overrides,
  };
}

describe('MobileLayoutWrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial rendering', () => {
    it('renders UnitOverviewList when no active unit', () => {
      const viewModel = createMockViewModel();
      const { container } = render(
        <MobileLayoutWrapper viewModel={viewModel} />
      );

      expect(
        container.querySelector('[data-testid="unit-overview-list"]')
      ).toBeTruthy();
      expect(
        container.querySelector('[data-testid="units-count"]')?.textContent
      ).toBe('1');
    });

    it('renders UnitEntryScreen when activeUnitId is provided via viewModel', () => {
      const unit = createMockUnit();
      const viewModel = createMockViewModel({
        units: [unit],
        activeUnitId: unit.id,
      });
      const { container } = render(
        <MobileLayoutWrapper viewModel={viewModel} />
      );

      expect(
        container.querySelector('[data-testid="unit-entry-screen"]')
      ).toBeTruthy();
      expect(
        container.querySelector('[data-testid="unit-label"]')?.textContent
      ).toBe('Chiller #1');
    });

    it('passes disabled prop to UnitOverviewList', () => {
      const viewModel = createMockViewModel();
      const { container } = render(
        <MobileLayoutWrapper viewModel={viewModel} disabled />
      );

      expect(
        container.querySelector('[data-testid="disabled"]')?.textContent
      ).toBe('true');
    });

    it('passes disabled prop to UnitEntryScreen', () => {
      const unit = createMockUnit();
      const viewModel = createMockViewModel({
        units: [unit],
        activeUnitId: unit.id,
      });
      const { container } = render(
        <MobileLayoutWrapper viewModel={viewModel} disabled />
      );

      expect(
        container.querySelector('[data-testid="disabled"]')?.textContent
      ).toBe('true');
    });
  });

  describe('unit selection flow', () => {
    it('switches to UnitEntryScreen when unit is selected', () => {
      const unit = createMockUnit();
      const viewModel = createMockViewModel({ units: [unit] });
      const { container } = render(
        <MobileLayoutWrapper viewModel={viewModel} />
      );

      expect(
        container.querySelector('[data-testid="unit-overview-list"]')
      ).toBeTruthy();

      fireEvent.click(screen.getByTestId(`select-unit-${unit.id}`));

      expect(
        container.querySelector('[data-testid="unit-entry-screen"]')
      ).toBeTruthy();
      expect(
        container.querySelector('[data-testid="unit-overview-list"]')
      ).toBeFalsy();
    });

    it('returns to UnitOverviewList when back is clicked', () => {
      const unit = createMockUnit();
      const viewModel = createMockViewModel({ units: [unit] });
      const { container } = render(
        <MobileLayoutWrapper viewModel={viewModel} />
      );

      fireEvent.click(screen.getByTestId(`select-unit-${unit.id}`));
      expect(
        container.querySelector('[data-testid="unit-entry-screen"]')
      ).toBeTruthy();

      fireEvent.click(screen.getByTestId('back-button'));

      expect(
        container.querySelector('[data-testid="unit-overview-list"]')
      ).toBeTruthy();
      expect(
        container.querySelector('[data-testid="unit-entry-screen"]')
      ).toBeFalsy();
    });

    it('displays correct unit data in UnitEntryScreen', () => {
      const unit = createMockUnit({
        id: 'unit-2' as TUnitId,
        label: 'Cooling Tower #2',
        type: 'COOLING_TOWER',
      });
      const viewModel = createMockViewModel({ units: [unit] });
      const { container } = render(
        <MobileLayoutWrapper viewModel={viewModel} />
      );

      fireEvent.click(screen.getByTestId(`select-unit-${unit.id}`));

      expect(
        container.querySelector('[data-testid="unit-label"]')?.textContent
      ).toBe('Cooling Tower #2');
    });

    it('passes categories for selected unit', () => {
      const unit = createMockUnit();
      const categories = [
        createMockCategory({ id: 'UNIT_CONDENSOR', label: 'Kondensor' }),
        createMockCategory({ id: 'UNIT_EVAPORATOR', label: 'Evaporator' }),
      ];
      const categoriesByUnit = new Map<TUnitId, readonly ICategoryView[]>();
      categoriesByUnit.set(unit.id, categories);

      const viewModel = createMockViewModel({
        units: [unit],
        categoriesByUnit,
      });
      const { container } = render(
        <MobileLayoutWrapper viewModel={viewModel} />
      );

      fireEvent.click(screen.getByTestId(`select-unit-${unit.id}`));

      expect(
        container.querySelector('[data-testid="categories-count"]')?.textContent
      ).toBe('2');
    });
  });

  describe('edge cases', () => {
    it('handles empty units array', () => {
      const viewModel = createMockViewModel({ units: [] });
      const { container } = render(
        <MobileLayoutWrapper viewModel={viewModel} />
      );

      expect(
        container.querySelector('[data-testid="unit-overview-list"]')
      ).toBeTruthy();
      expect(
        container.querySelector('[data-testid="units-count"]')?.textContent
      ).toBe('0');
    });

    it('handles unit with no categories', () => {
      const unit = createMockUnit();
      const categoriesByUnit = new Map<TUnitId, readonly ICategoryView[]>();

      const viewModel = createMockViewModel({
        units: [unit],
        categoriesByUnit,
      });
      const { container } = render(
        <MobileLayoutWrapper viewModel={viewModel} />
      );

      fireEvent.click(screen.getByTestId(`select-unit-${unit.id}`));

      expect(
        container.querySelector('[data-testid="categories-count"]')?.textContent
      ).toBe('0');
    });

    it('handles invalid activeUnitId gracefully', () => {
      const viewModel = createMockViewModel({
        activeUnitId: 'non-existent-unit' as TUnitId,
      });
      const { container } = render(
        <MobileLayoutWrapper viewModel={viewModel} />
      );

      expect(
        container.querySelector('[data-testid="unit-overview-list"]')
      ).toBeTruthy();
    });

    it('handles multiple units selection correctly', () => {
      const unit1 = createMockUnit({ id: 'unit-1' as TUnitId });
      const unit2 = createMockUnit({
        id: 'unit-2' as TUnitId,
        label: 'Chiller #2',
      });
      const categoriesByUnit = new Map<TUnitId, readonly ICategoryView[]>();
      categoriesByUnit.set(unit1.id, [createMockCategory({ label: 'Cat 1' })]);
      categoriesByUnit.set(unit2.id, [createMockCategory({ label: 'Cat 2' })]);

      const viewModel = createMockViewModel({
        units: [unit1, unit2],
        categoriesByUnit,
      });
      const { container } = render(
        <MobileLayoutWrapper viewModel={viewModel} />
      );

      fireEvent.click(screen.getByTestId('select-unit-unit-2'));

      expect(
        container.querySelector('[data-testid="unit-label"]')?.textContent
      ).toBe('Chiller #2');
      expect(
        container.querySelector('[data-testid="categories-count"]')?.textContent
      ).toBe('1');
    });

    it('resets activeUnitId state when back is clicked', () => {
      const unit = createMockUnit();
      const viewModel = createMockViewModel({ units: [unit] });
      const { container } = render(
        <MobileLayoutWrapper viewModel={viewModel} />
      );

      fireEvent.click(screen.getByTestId(`select-unit-${unit.id}`));
      fireEvent.click(screen.getByTestId('back-button'));

      expect(
        container.querySelector('[data-testid="unit-overview-list"]')
      ).toBeTruthy();
    });
  });

  describe('disabled state', () => {
    it('prevents unit selection when disabled', () => {
      const unit = createMockUnit();
      const viewModel = createMockViewModel({ units: [unit] });
      render(<MobileLayoutWrapper viewModel={viewModel} disabled />);

      const selectButton = screen.getByTestId(`select-unit-${unit.id}`);
      expect((selectButton as HTMLButtonElement).disabled).toBe(true);
    });

    it('shows disabled state in UnitEntryScreen', () => {
      const unit = createMockUnit();
      const viewModel = createMockViewModel({
        units: [unit],
        activeUnitId: unit.id,
      });
      const { container } = render(
        <MobileLayoutWrapper viewModel={viewModel} disabled />
      );

      expect(
        container.querySelector('[data-testid="disabled"]')?.textContent
      ).toBe('true');
    });
  });
});
