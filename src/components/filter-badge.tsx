'use client';

import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { IColumnFilterConfig } from '@/components/data-table';

interface IFilterBadgeProps<TData> {
  config: IColumnFilterConfig<TData>;
  value: unknown;
  onRemove: () => void;
}

export function FilterBadge<TData>({
  config,
  value,
  onRemove,
}: IFilterBadgeProps<TData>) {
  const label = config.label ?? config.columnId;
  let displayValue: string;

  if (config.type === 'select' && config.options) {
    const option = config.options.find(opt => opt.value === value);
    displayValue = option?.label ?? String(value);
  } else if (config.type === 'date') {
    displayValue =
      value instanceof Date ? value.toLocaleDateString('id-ID') : String(value);
  } else {
    displayValue = String(value);
  }

  return (
    <Badge variant="secondary" className="gap-1 pl-2">
      <span>
        {label}: {displayValue}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
        aria-label={`Hapus filter ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}
