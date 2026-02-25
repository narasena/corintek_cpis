'use client';

import { CheckCircle2, AlertCircle, Circle, Loader2 } from 'lucide-react';
import type { IUnitView } from '../contracts';

export function calculateCompletionPercent(ratio: number | null): number {
  return ratio !== null ? Math.round(ratio * 100) : 0;
}

interface IProgressBarProps {
  ratio: number | null;
  status?: IUnitView['status'];
  className?: string;
}

export function ProgressBar({
  ratio,
  status,
  className = '',
}: IProgressBarProps) {
  if (ratio === null) return null;

  const colorClass = status ? getProgressColor(status) : 'bg-primary';

  return (
    <div className={`h-1.5 bg-muted rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full transition-all duration-300 ${colorClass}`}
        style={{ width: `${ratio * 100}%` }}
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
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: IStatusBadgeProps) {
  const config = getStatusBadgeConfig(status);
  const Icon = config.icon;
  const sizeClasses =
    size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2 py-1';

  return (
    <span
      className={`flex items-center gap-1 font-medium rounded-full ${sizeClasses} ${config.className}`}
    >
      {Icon && <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3 w-3'} />}
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

interface IStatusIconProps {
  status: IUnitView['status'];
  size?: 'sm' | 'md' | 'lg';
}

export function StatusIcon({ status, size = 'md' }: IStatusIconProps) {
  const sizeClass =
    size === 'lg' ? 'h-6 w-6' : size === 'md' ? 'h-5 w-5' : 'h-4 w-4';

  switch (status) {
    case 'COMPLETE':
      return (
        <CheckCircle2 className={`${sizeClass} text-green-500 shrink-0`} />
      );
    case 'IN_PROGRESS':
      return <Loader2 className={`${sizeClass} text-amber-500 shrink-0`} />;
    default:
      return (
        <Circle className={`${sizeClass} text-muted-foreground shrink-0`} />
      );
  }
}

interface ICompletionTextProps {
  completedCount: number;
  totalCount: number;
  percent: number;
}

export function CompletionText({
  completedCount,
  totalCount,
  percent,
}: ICompletionTextProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span>
        {completedCount}/{totalCount} selesai
      </span>
      {totalCount > 0 && <span className="text-xs">({percent}%)</span>}
    </div>
  );
}

export function formatMachineLabel(
  type: 'CHILLER' | 'COOLING_TOWER',
  unitNumber: number
): string {
  return type === 'CHILLER' ? `Chiller #${unitNumber}` : `CT #${unitNumber}`;
}
