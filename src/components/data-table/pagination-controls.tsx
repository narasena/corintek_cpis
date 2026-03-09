'use client';

import { Button } from '@/components/ui/button';

/**
 * Server-side pagination controls component
 * @responsibility Render pagination UI for server-managed data
 */
interface IServerPaginationControlsProps {
  total: number;
  page: number;
  limit: number;
  pageSizeOptions?: readonly number[];
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  isLoading?: boolean;
}

export function ServerPaginationControls({
  total,
  page,
  limit,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onLimitChange,
  isLoading = false,
}: IServerPaginationControlsProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      <span className="text-sm text-muted-foreground order-2 sm:order-1">
        Menampilkan {start}-{end} dari {total}
      </span>
      <div className="flex items-center space-x-2 order-1 sm:order-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage || isLoading}
        >
          Sebelumnya
        </Button>
        <span className="text-sm whitespace-nowrap">
          Halaman {page} dari {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage || isLoading}
        >
          Selanjutnya
        </Button>
        <select
          value={limit}
          onChange={e => onLimitChange(Number(e.target.value))}
          disabled={isLoading}
          className="h-9 rounded-md border border-input px-2 text-sm bg-background"
        >
          {pageSizeOptions.map(opt => (
            <option key={opt} value={opt}>
              {opt} / hal
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
