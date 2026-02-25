'use client';

import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import type { ICategoryView, IParameterRowView, IUnitView } from '../contracts';
import { ParameterInput } from '../../components/inputs';

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
      <ProgressBar status={unit.status} completionPercent={completionPercent} />
      <CategoryList categories={categories} disabled={disabled} />
    </div>
  );
}

function calculateCompletionPercent(ratio: number | null): number {
  return ratio !== null ? Math.round(ratio * 100) : 0;
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
          completion={unit.completion}
          percent={completionPercent}
        />
      </div>
      <StatusBadge status={unit.status} />
    </div>
  );
}

interface ICompletionTextProps {
  completion: IUnitView['completion'];
  percent: number;
}

function CompletionText({ completion, percent }: ICompletionTextProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span>
        {completion.completedCount}/{completion.totalCount} selesai
      </span>
      <span className="text-xs">({percent}%)</span>
    </div>
  );
}

interface IProgressBarProps {
  status: IUnitView['status'];
  completionPercent: number;
}

function ProgressBar({ status, completionPercent }: IProgressBarProps) {
  const colorClass = getProgressColor(status);

  return (
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <div
        className={`h-full transition-all duration-300 ${colorClass}`}
        style={{ width: `${completionPercent}%` }}
      />
    </div>
  );
}

function getProgressColor(status: IUnitView['status']): string {
  switch (status) {
    case 'COMPLETE':
      return 'bg-green-500';
    case 'IN_PROGRESS':
      return 'bg-amber-500';
    default:
      return 'bg-muted-foreground/30';
  }
}

interface IStatusBadgeProps {
  status: IUnitView['status'];
}

function StatusBadge({ status }: IStatusBadgeProps) {
  const config = getStatusBadgeConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.className}`}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {config.label}
    </span>
  );
}

function getStatusBadgeConfig(status: IUnitView['status']) {
  switch (status) {
    case 'COMPLETE':
      return {
        icon: CheckCircle2,
        label: 'Lengkap',
        className: 'text-green-700 bg-green-100',
      };
    case 'IN_PROGRESS':
      return {
        icon: AlertCircle,
        label: 'Sebagian',
        className: 'text-amber-700 bg-amber-100',
      };
    default:
      return {
        icon: null,
        label: 'Kosong',
        className: 'text-muted-foreground bg-muted',
      };
  }
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
