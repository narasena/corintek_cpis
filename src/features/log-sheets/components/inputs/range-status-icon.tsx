'use client';

import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IRangeStatusIconProps {
  inRange: boolean | null;
  className?: string;
}

/**
 * Shows red alert icon only when value is out of range
 * Null = no value entered, no icon shown
 * true = in range, no icon shown (clarity principle)
 * false = out of range, red alert icon shown
 */
export function RangeStatusIcon({ inRange, className }: IRangeStatusIconProps) {
  // Only show icon when out of range (false)
  if (inRange !== false) return null;

  return (
    <div
      className={cn('flex items-center justify-center text-red-500', className)}
      title="Nilai di luar batas"
    >
      <AlertCircle className="h-4 w-4" />
    </div>
  );
}
