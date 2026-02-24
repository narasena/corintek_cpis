'use client';

import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import type {
  ICategoryView,
  IParameterRowView,
  IUnitView,
  TUnitId,
} from '../contracts';
import { useEntryStateContext } from '../../context';

interface UnitEntryScreenProps {
  unit: IUnitView;
  categories: readonly ICategoryView[];
  onBack: () => void;
  disabled?: boolean;
}

export function UnitEntryScreen({
  unit,
  categories,
  onBack,
  disabled,
}: UnitEntryScreenProps) {
  const completionPercent =
    unit.completion.completionRatio !== null
      ? Math.round(unit.completion.completionRatio * 100)
      : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          disabled={disabled}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h2 className="font-semibold text-lg">{unit.label}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {unit.completion.completedCount}/{unit.completion.totalCount}{' '}
              selesai
            </span>
            <span className="text-xs">({completionPercent}%)</span>
          </div>
        </div>
        <StatusBadge status={unit.status} />
      </div>

      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            unit.status === 'COMPLETE'
              ? 'bg-green-500'
              : unit.status === 'IN_PROGRESS'
                ? 'bg-amber-500'
                : 'bg-muted-foreground/30'
          }`}
          style={{ width: `${completionPercent}%` }}
        />
      </div>

      <div className="space-y-6">
        {categories.map(category => (
          <CategorySection
            key={category.id}
            category={category}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}

interface StatusBadgeProps {
  status: IUnitView['status'];
}

function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case 'COMPLETE':
      return (
        <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
          <CheckCircle2 className="h-3 w-3" />
          Lengkap
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-amber-700 bg-amber-100 rounded-full">
          <AlertCircle className="h-3 w-3" />
          Sebagian
        </span>
      );
    case 'EMPTY':
    default:
      return (
        <span className="px-2 py-1 text-xs font-medium text-muted-foreground bg-muted rounded-full">
          Kosong
        </span>
      );
  }
}

interface CategorySectionProps {
  category: ICategoryView;
  disabled?: boolean;
}

function CategorySection({ category, disabled }: CategorySectionProps) {
  if (category.parameters.length === 0) return null;

  return (
    <div className="rounded-lg border bg-card">
      <div className="px-4 py-3 border-b bg-muted/30">
        <h3 className="font-medium">{category.label}</h3>
      </div>
      <div className="divide-y">
        {category.parameters.map(param => (
          <ParameterRow
            key={param.parameterId}
            parameter={param}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}

interface ParameterRowProps {
  parameter: IParameterRowView;
  disabled?: boolean;
}

function ParameterRow({ parameter, disabled }: ParameterRowProps) {
  const { entryState, setEntryState } = useEntryStateContext();
  const state = entryState[parameter.entryKey];
  const value = state?.numericValue ?? null;

  const handleChange = (newValue: number | null) => {
    setEntryState({
      ...entryState,
      [parameter.entryKey]: {
        valueType: parameter.valueType,
        numericValue: newValue,
      },
    });
  };

  const isInRange = parameter.inRange !== false;

  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{parameter.label}</span>
          {parameter.unit && (
            <span className="text-xs text-muted-foreground">
              ({parameter.unit})
            </span>
          )}
        </div>
        {parameter.targetRangeText && (
          <div className="text-xs text-muted-foreground">
            Target: {parameter.targetRangeText}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value ?? ''}
          onChange={e => {
            const val = e.target.value;
            handleChange(val ? parseFloat(val) : null);
          }}
          disabled={disabled}
          className={`w-24 px-3 py-2 text-right rounded-lg border text-sm ${
            value !== null && !isInRange
              ? 'border-red-500 bg-red-50'
              : 'border-input bg-background'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          placeholder="-"
        />
        {value !== null && (
          <div className="w-4">
            {isInRange ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
