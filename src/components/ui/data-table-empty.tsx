'use client';

import { FileX2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DataTableEmptyProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function DataTableEmpty({
  title = 'Tidak Ada Data',
  description = 'Data belum tersedia atau tidak ditemukan.',
  actionLabel,
  onAction,
}: DataTableEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/10 border border-dashed rounded-lg animate-in fade-in-50 duration-500 min-h-[400px]">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/30 mb-4">
        <FileX2 className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-sm mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
