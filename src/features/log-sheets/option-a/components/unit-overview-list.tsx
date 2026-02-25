'use client';

import { ChevronRight, Droplets } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { IUnitView, TUnitId, IRawWaterParameterView } from '../contracts';
import {
  calculateCompletionPercent,
  ProgressBar,
  StatusIcon,
  CompletionText,
} from './shared-ui';
import { useEntryStateContext } from '../../context';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface UnitOverviewListProps {
  units: readonly IUnitView[];
  activeUnitId: TUnitId | null;
  onSelectUnit: (unitId: TUnitId) => void;
  disabled?: boolean;
  rawWaterParameters?: readonly IRawWaterParameterView[];
}

export function UnitOverviewList({
  units,
  activeUnitId,
  onSelectUnit,
  disabled,
  rawWaterParameters,
}: UnitOverviewListProps) {
  const chillerUnits = units.filter(u => u.type === 'CHILLER');
  const ctUnits = units.filter(u => u.type === 'COOLING_TOWER');
  const hasRawWater = rawWaterParameters && rawWaterParameters.length > 0;

  if (units.length === 0 && !hasRawWater) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Tidak ada unit aktif untuk log sheet ini
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {chillerUnits.map(unit => (
        <UnitRow
          key={unit.id}
          unit={unit}
          isActive={unit.id === activeUnitId}
          onSelect={() => onSelectUnit(unit.id)}
          disabled={disabled}
        />
      ))}

      {hasRawWater && (
        <RawWaterSection parameters={rawWaterParameters} disabled={disabled} />
      )}

      {ctUnits.map(unit => (
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

interface IRawWaterSectionProps {
  parameters: readonly IRawWaterParameterView[];
  disabled?: boolean;
}

function RawWaterSection({ parameters, disabled }: IRawWaterSectionProps) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="px-4 py-3 border-b bg-blue-50/50 flex items-center gap-2">
        <Droplets className="h-4 w-4 text-blue-600" />
        <h3 className="font-medium text-sm">Raw Water</h3>
      </div>
      <div className="divide-y">
        {parameters.map(param => (
          <RawWaterParameterRow
            key={param.parameterId}
            param={param}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}

interface IRawWaterParameterRowProps {
  param: IRawWaterParameterView;
  disabled?: boolean;
}

function RawWaterParameterRow({ param, disabled }: IRawWaterParameterRowProps) {
  const { getEntry, updateNumber } = useEntryStateContext();
  const state = getEntry(param.entryKey);
  const displayValue =
    state?.numericValue !== null && state?.numericValue !== undefined
      ? String(state.numericValue)
      : '';

  return (
    <div className="px-4 py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{param.label}</span>
          {param.unit && (
            <span className="text-xs text-muted-foreground">
              ({param.unit})
            </span>
          )}
        </div>
        {param.targetRangeText && (
          <div className="text-xs text-muted-foreground">
            Target: {param.targetRangeText}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          inputMode="decimal"
          placeholder="-"
          value={displayValue}
          onChange={e => updateNumber(param.entryKey, e.target.value)}
          disabled={disabled}
          className="w-24"
        />
        {param.inRange !== null && <RangeStatusIcon inRange={param.inRange} />}
      </div>
    </div>
  );
}

interface IRangeStatusIconProps {
  inRange: boolean;
}

function RangeStatusIcon({ inRange }: IRangeStatusIconProps) {
  return (
    <div className="w-4">
      {inRange ? (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      ) : (
        <AlertCircle className="h-4 w-4 text-red-500" />
      )}
    </div>
  );
}
