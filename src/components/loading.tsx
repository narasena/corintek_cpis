import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Loading variant types
 */
type TLoadingVariant = 'spinner' | 'skeleton' | 'skeleton-table';

/**
 * Loading component props
 */
interface ILoadingProps {
  /** Visual style variant */
  variant?: TLoadingVariant;
  /** Display message */
  message?: string;
  /** Additional CSS classes */
  className?: string;
  /** Full page overlay mode */
  fullPage?: boolean;
  /** Number of skeleton rows for table variant */
  skeletonRows?: number;
  /** Number of columns for table skeleton */
  columnCount?: number;
}

/**
 * Component: Loading
 * Responsibility: Display loading state with configurable variants
 * Pattern: Functional component with variant sub-components
 */
export function Loading(props: ILoadingProps): React.JSX.Element {
  const {
    variant = 'spinner',
    message = 'Memuat...',
    className,
    fullPage = false,
    skeletonRows = 5,
    columnCount = 4,
  } = props;

  // TODO: Render appropriate variant based on props
  // - Spinner: Animated rotating icon
  // - Skeleton: Generic pulsing placeholder blocks
  // - Skeleton-table: Table-specific skeleton with rows/columns

  return (
    <div
      className={cn(
        'flex items-center justify-center',
        fullPage && 'min-h-[50vh]',
        className
      )}
    >
      {/* TODO: Implement spinner variant */}
      {variant === 'spinner' && (
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-muted-foreground text-sm">{message}</p>
        </div>
      )}

      {/* TODO: Implement skeleton variant */}
      {variant === 'skeleton' && (
        <div className="w-full space-y-3">
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
        </div>
      )}

      {/* TODO: Implement skeleton-table variant */}
      {variant === 'skeleton-table' && (
        <div className="w-full rounded-md border">
          {/* Table header skeleton */}
          <div className="bg-muted/50 p-4 flex gap-4">
            {Array.from({ length: columnCount }).map((_, i) => (
              <div
                key={i}
                className="h-4 bg-muted rounded flex-1 animate-pulse"
              />
            ))}
          </div>
          {/* Table rows skeleton */}
          <div className="divide-y">
            {Array.from({ length: skeletonRows }).map((_, rowIndex) => (
              <div key={rowIndex} className="p-4 flex gap-4">
                {Array.from({ length: columnCount }).map((_, colIndex) => (
                  <div
                    key={colIndex}
                    className="h-4 bg-muted rounded flex-1 animate-pulse"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Sub-component: TableSkeleton
 * Responsibility: Skeleton specifically for DataTable loading
 */
export function TableSkeleton(props: {
  rows?: number;
  columns?: number;
}): React.JSX.Element {
  const { rows = 5, columns = 4 } = props;

  // TODO: Implement table-specific skeleton
  // - Match DataTable visual structure
  // - Use consistent styling with shadcn Table component
  return (
    <Loading
      variant="skeleton-table"
      skeletonRows={rows}
      columnCount={columns}
    />
  );
}

/**
 * Sub-component: CardSkeleton
 * Responsibility: Skeleton for card-based layouts
 */
export function CardSkeleton(): React.JSX.Element {
  // TODO: Implement card skeleton
  // - Header with title area
  // - Content area with multiple lines
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="h-5 bg-muted rounded w-1/3 animate-pulse" />
      <div className="h-4 bg-muted rounded animate-pulse" />
      <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
    </div>
  );
}

/**
 * Sub-component: Spinner
 * Responsibility: Pure spinner without message
 */
export function Spinner(props: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}): React.JSX.Element {
  const { size = 'md', className } = props;

  // TODO: Implement size variants
  // - sm: 16px
  // - md: 24px (default)
  // - lg: 32px
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-b-2 border-primary',
        sizeClasses[size],
        className
      )}
    />
  );
}
