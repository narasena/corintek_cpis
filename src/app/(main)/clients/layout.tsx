import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-helpers';
import { ensureAccess, RbacResource } from '@/lib/rbac';

export default async function ClientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const actor = await getCurrentUser();
  if (!actor) redirect('/login');
  ensureAccess(actor.role, RbacResource.CLIENTS, 'read');
  return children;
}
