import { notFound, redirect } from 'next/navigation';

import { getCurrentUserDetails } from '@/features/auth/lib/user-context';
import { canAccess, RbacResource } from '@/lib/rbac';

/**
 * Server-side guard for every lab-analysis route, including the project picker
 * at /lab-analyses which previously rendered for any authenticated user.
 */
export default async function LabAnalysesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const actor = await getCurrentUserDetails();
  if (!actor) return notFound();
  if (!canAccess(actor.role, RbacResource.LAB_ANALYSES, 'read')) {
    redirect('/forbidden');
  }

  return <>{children}</>;
}
