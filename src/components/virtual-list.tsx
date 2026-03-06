import React, { useRef, useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

/**
 * Virtual list item renderer props
 */
interface IVirtualListItemProps<TData> {
  /** Item data */
  item: TData;
  /** Item index */
  index: number;
  /** Whether item is visible (for optimization) */
  isVisible: boolean;
}

/**
 * Virtual list configuration
 */
interface IVirtualListProps<TData> {
  /** Data array to render */
  data: TData[];
  /** Item height in pixels (default: 48) */
  itemHeight?: number;
  /** Container height in pixels (default: 400) */
  containerHeight?: number;
  /** Overscan count - render extra items above/below viewport */
  overscan?: number;
  /** Item renderer component */
  renderItem: (props: IVirtualListItemProps<TData>) => React.ReactNode;
  /** CSS class for container */
  className?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Callback when scroll reaches bottom */
  onEndReached?: () => void;
  /** Threshold in pixels before triggering onEndReached */
  endReachedThreshold?: number;
}

/**
 * Component: VirtualList
 * Responsibility: Render large lists with virtualization for performance
 * Pattern: Windowing technique - only render visible items
 */
export function VirtualList<TData>(
  props: IVirtualListProps<TData>
): React.JSX.Element {
  const {
    data,
    itemHeight = 48,
    containerHeight = 400,
    overscan = 5,
    renderItem,
    className,
    emptyMessage = 'Tidak ada data.',
    onEndReached,
    endReachedThreshold = 100,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState<number>(0);

  const totalHeight = data.length * itemHeight;

  // Calculate visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight) + overscan * 2;
  const endIndex = Math.min(data.length, startIndex + visibleCount);

  const visibleItems = data.slice(startIndex, endIndex);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = e.currentTarget.scrollTop;
      setScrollTop(newScrollTop);

      // Check if reached end
      if (onEndReached) {
        const scrollBottom = newScrollTop + containerHeight;
        const threshold = totalHeight - endReachedThreshold;
        if (scrollBottom >= threshold) {
          onEndReached();
        }
      }
    },
    [containerHeight, endReachedThreshold, onEndReached, totalHeight]
  );

  // Reset scroll when data changes significantly
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [data.length === 0]);

  if (data.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center text-muted-foreground',
          className
        )}
        style={{ height: containerHeight }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => {
          const actualIndex = startIndex + index;
          const top = actualIndex * itemHeight;

          return (
            <div
              key={actualIndex}
              style={{
                position: 'absolute',
                top,
                height: itemHeight,
                left: 0,
                right: 0,
              }}
            >
              {renderItem({ item, index: actualIndex, isVisible: true })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
