'use client';

import { useState, useCallback } from 'react';
import { UnitOverviewList } from './unit-overview-list';
import { UnitEntryScreen } from './unit-entry-screen';
import type { ILogSheetUnitViewModel, TUnitId } from '../contracts';

interface IMobileLayoutWrapperProps {
  viewModel: ILogSheetUnitViewModel;
  disabled?: boolean;
}

export function MobileLayoutWrapper({
  viewModel,
  disabled,
}: IMobileLayoutWrapperProps) {
  const [activeUnitId, setActiveUnitId] = useState<TUnitId | null>(
    viewModel.activeUnitId
  );

  const handleSelectUnit = useCallback((unitId: TUnitId) => {
    setActiveUnitId(unitId);
  }, []);

  const handleBack = useCallback(() => {
    setActiveUnitId(null);
  }, []);

  const activeUnit = findUnitById(viewModel.units, activeUnitId);
  const categories = activeUnit
    ? (viewModel.categoriesByUnit.get(activeUnit.id) ?? [])
    : [];

  if (activeUnit) {
    return (
      <UnitEntryScreen
        unit={activeUnit}
        categories={categories}
        onBack={handleBack}
        disabled={disabled}
      />
    );
  }

  return (
    <UnitOverviewList
      units={viewModel.units}
      activeUnitId={activeUnitId}
      onSelectUnit={handleSelectUnit}
      disabled={disabled}
    />
  );
}

function findUnitById(
  units: readonly ILogSheetUnitViewModel['units'][number][],
  unitId: TUnitId | null
) {
  if (!unitId) return null;
  return units.find(u => u.id === unitId) ?? null;
}
