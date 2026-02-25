'use client';

import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import type { ICategoryView, IParameterRowView, IUnitView } from '../contracts';
import { ParameterInput } from '../../components/inputs';
import {
  calculateCompletionPercent,
  ProgressBar,
  StatusBadge,
  CompletionText,
} from './shared-ui';

interface IUnitEntryScreenProps {
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
}: IUnitEntryScreenProps) {
  const completionPercent = calculateCompletionPercent(
    unit.completion.completionRatio
  );

  return (
    <div className="space-y-4">
      <UnitHeader
        unit={unit}
        completionPercent={completionPercent}
        onBack={onBack}
        disabled={disabled}
      />
      <ProgressBar
        ratio={unit.completion.completionRatio}
        status={unit.status}
      />
      <CategoryList categories={categories} disabled={disabled} />
    </div>
  );
}

interface IUnitHeaderProps {
  unit: IUnitView;
  completionPercent: number;
  onBack: () => void;
  disabled?: boolean;
}

function UnitHeader({
  unit,
  completionPercent,
  onBack,
  disabled,
}: IUnitHeaderProps) {
  return (
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
        <CompletionText
          completedCount={unit.completion.completedCount}
          totalCount={unit.completion.totalCount}
          percent={completionPercent}
        />
      </div>
      <StatusBadge status={unit.status} />
    </div>
  );
}

interface ICategoryListProps {
  categories: readonly ICategoryView[];
  disabled?: boolean;
}

function CategoryList({ categories, disabled }: ICategoryListProps) {
  return (
    <div className="space-y-6">
      {categories.map(category => (
        <CategorySection
          key={category.id}
          category={category}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

interface ICategorySectionProps {
  category: ICategoryView;
  disabled?: boolean;
}

function CategorySection({ category, disabled }: ICategorySectionProps) {
  if (category.parameters.length === 0) return null;

  return (
    <div className="rounded-lg border bg-card">
      <CategoryHeader label={category.label} />
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

interface ICategoryHeaderProps {
  label: string;
}

function CategoryHeader({ label }: ICategoryHeaderProps) {
  return (
    <div className="px-4 py-3 border-b bg-muted/30">
      <h3 className="font-medium">{label}</h3>
    </div>
  );
}

interface IParameterRowProps {
  parameter: IParameterRowView;
  disabled?: boolean;
}

function ParameterRow({ parameter, disabled }: IParameterRowProps) {
  const showStatusIcon = parameter.inRange !== null;

  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <ParameterLabel parameter={parameter} />
      <div className="flex items-center gap-2">
        <ParameterInput
          entryKey={parameter.entryKey}
          valueType={parameter.valueType}
          minValue={parameter.minValue}
          maxValue={parameter.maxValue}
          placeholder="-"
          disabled={disabled}
        />
        {showStatusIcon && <RangeStatusIcon inRange={parameter.inRange} />}
      </div>
    </div>
  );
}

interface IParameterLabelProps {
  parameter: IParameterRowView;
}

function ParameterLabel({ parameter }: IParameterLabelProps) {
  return (
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
  );
}

interface IRangeStatusIconProps {
  inRange: boolean | null;
}

function RangeStatusIcon({ inRange }: IRangeStatusIconProps) {
  if (inRange === null) return null;

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
