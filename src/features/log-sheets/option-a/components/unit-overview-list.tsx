'use client';

import { ChevronRight, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import type { IUnitView, TUnitId } from '../contracts';

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
  const completionPercent =
    unit.completion.completionRatio !== null
      ? Math.round(unit.completion.completionRatio * 100)
      : 0;

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
      <StatusIcon status={unit.status} />
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{unit.label}</div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            {unit.completion.completedCount}/{unit.completion.totalCount}{' '}
            selesai
          </span>
          {unit.completion.totalCount > 0 && (
            <span className="text-xs">({completionPercent}%)</span>
          )}
        </div>
        <ProgressBar ratio={unit.completion.completionRatio} />
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
    </button>
  );
}

interface StatusIconProps {
  status: IUnitView['status'];
}

function StatusIcon({ status }: StatusIconProps) {
  switch (status) {
    case 'COMPLETE':
      return <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />;
    case 'IN_PROGRESS':
      return <Loader2 className="h-6 w-6 text-amber-500 shrink-0" />;
    case 'EMPTY':
    default:
      return <Circle className="h-6 w-6 text-muted-foreground shrink-0" />;
  }
}

interface ProgressBarProps {
  ratio: number | null;
}

function ProgressBar({ ratio }: ProgressBarProps) {
  if (ratio === null) return null;

  return (
    <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
      <div
        className="h-full bg-primary transition-all duration-300"
        style={{ width: `${ratio * 100}%` }}
      />
    </div>
  );
}
