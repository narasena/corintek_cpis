import React from 'react';
import { Loading } from '@/components/loading';

/**
 * Route: (main)/loading.tsx
 * Responsibility: Display loading state for all routes in (main) group
 * Pattern: Next.js App Router convention
 * 
 * UX-205: Using skeleton variant for better perceived performance.
 * Skeletons make loading feel faster (progressive disclosure).
 */
export default function MainLoading(): React.JSX.Element {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Using skeleton for better UX - progressive disclosure */}
      <Loading 
        variant="skeleton" 
        message="Memuat halaman..." 
        fullPage 
      />
    </div>
  );
}
