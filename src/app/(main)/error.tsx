'use client';

import React from 'react';
import { ErrorBoundary } from '@/components/error-boundary';

/**
 * Route: (main)/error.tsx
 * Responsibility: Catch errors for all routes in (main) group
 * Pattern: Next.js App Router convention (must be 'use client')
 *
 * This component automatically catches errors in:
 * - All pages in (main) route group
 * - Layout errors (if not caught by nested error boundaries)
 * - Server component errors
 */
interface IMainErrorProps {
  /** Error object from Next.js */
  error: Error & { digest?: string };
  /** Recovery function to retry render */
  reset: () => void;
}

/**
 * Component: MainError
 * Responsibility: Render error boundary for (main) route group
 */
export default function MainError(props: IMainErrorProps): React.JSX.Element {
  const { error, reset } = props;

  // TODO: Log error to monitoring service
  // useEffect(() => {
  //   logErrorToService(error);
  // }, [error]);

  return (
    <ErrorBoundary
      error={error}
      reset={reset}
      config={{
        title: 'Terjadi kesalahan',
        message:
          'Maaf, terjadi masalah saat memuat halaman. Silakan coba lagi.',
        retryLabel: 'Coba Lagi',
        showDetails: true,
        secondaryAction: {
          label: 'Ke Beranda',
          href: '/',
        },
      }}
    />
  );
}
