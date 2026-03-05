import React from 'react';
import { Loading } from '@/components/loading';

/**
 * Route: (main)/loading.tsx
 * Responsibility: Display loading state for all routes in (main) group
 * Pattern: Next.js App Router convention
 *
 * This component automatically wraps all pages in the (main) route group
 * during data fetching and navigation.
 */
export default function MainLoading(): React.JSX.Element {
  // TODO: Use appropriate variant based on common patterns in (main) routes
  // - Table-heavy routes: use 'skeleton-table'
  // - General purpose: use 'spinner'

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* TODO: Consider adding page-specific skeleton based on route pattern */}
      <Loading variant="spinner" message="Memuat halaman..." fullPage />
    </div>
  );
}
