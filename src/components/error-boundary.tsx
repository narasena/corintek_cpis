'use client';

import React, { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Error display configuration
 */
interface IErrorDisplayConfig {
  /** Custom title */
  title?: string;
  /** Custom message */
  message?: string;
  /** Show technical details (dev mode only) */
  showDetails?: boolean;
  /** Primary action label */
  retryLabel?: string;
  /** Secondary action href */
  secondaryAction?: {
    label: string;
    href: string;
  };
}

/**
 * Error boundary props from Next.js
 */
interface IErrorBoundaryProps {
  /** Error object from Next.js */
  error: Error & { digest?: string };
  /** Recovery function provided by Next.js */
  reset: () => void;
  /** Optional display configuration */
  config?: IErrorDisplayConfig;
}

/**
 * Component: ErrorBoundary
 * Responsibility: Display error UI with recovery options
 * Pattern: Functional component, used by route error.tsx
 */
export function ErrorBoundary(props: IErrorBoundaryProps): React.JSX.Element {
  const { error, reset, config } = props;
  const [isPending, startTransition] = useTransition();
  const [hasRetried, setHasRetried] = useState(false);

  const handleRetry = () => {
    setHasRetried(true);
    startTransition(() => {
      reset();
    });
  };

  const handleReload = () => {
    window.location.reload();
  };

  const title = config?.title ?? 'Terjadi kesalahan';
  const message =
    config?.message ?? 'Maaf, terjadi kesalahan saat memuat halaman.';
  const retryLabel = config?.retryLabel ?? 'Coba Lagi';

  return (
    <div className="flex items-center justify-center min-h-[50vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">{message}</p>

          {error.digest && (
            <p className="text-center text-xs text-muted-foreground">
              Error ID:{' '}
              <code className="bg-muted px-1 py-0.5 rounded">
                {error.digest}
              </code>
            </p>
          )}

          {hasRetried && (
            <p className="text-center text-sm text-amber-600">
              Masih terjadi kesalahan. Silakan muat ulang halaman.
            </p>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <Button
              onClick={hasRetried ? handleReload : handleRetry}
              className="w-full"
              disabled={isPending}
            >
              {isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {hasRetried ? 'Muat Ulang Halaman' : retryLabel}
            </Button>

            {config?.secondaryAction && (
              <Button variant="outline" className="w-full" asChild>
                <a href={config.secondaryAction.href}>
                  {config.secondaryAction.label}
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
