'use client';

import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center space-y-4">
        <Loader2 className="size-12 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Memuat lampiran...</p>
      </div>
    </div>
  );
}
