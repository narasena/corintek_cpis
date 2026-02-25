'use client';

import { ChevronRight } from 'lucide-react';
import type { IUnitView, TUnitId } from '../contracts';
import {
  calculateCompletionPercent,
  ProgressBar,
  StatusIcon,
  CompletionText,
} from './shared-ui';

interface UnitOverviewListProps {
  units: readonly IUnitView[];
  activeUnitId: TUnitId | null;
  onSelectUnit: (unitId: TUnitId) => void;
  disabled?: boolean;
}

export function UnitOverviewList({
  units,
  activeUnitId,
  onSelectUnit,
  disabled,
}: UnitOverviewListProps) {
  if (units.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Tidak ada unit aktif untuk log sheet ini
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {units.map(unit => (
        <UnitRow
          key={unit.id}
          unit={unit}
          isActive={unit.id === activeUnitId}
          onSelect={() => onSelectUnit(unit.id)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

interface UnitRowProps {
  unit: IUnitView;
  isActive: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

function UnitRow({ unit, isActive, onSelect, disabled }: UnitRowProps) {
  const completionPercent = calculateCompletionPercent(
    unit.completion.completionRatio
  );

  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-colors text-left ${
        isActive
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:bg-muted/50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <StatusIcon status={unit.status} size="lg" />
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{unit.label}</div>
        <CompletionText
          completedCount={unit.completion.completedCount}
          totalCount={unit.completion.totalCount}
          percent={completionPercent}
        />
        <ProgressBar ratio={unit.completion.completionRatio} className="mt-2" />
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
    </button>
  );
}
