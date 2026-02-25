export function formatUserName(
  user: { firstName: string; lastName: string | null } | null | undefined
): string {
  if (!user) return '-';
  return `${user.firstName} ${user.lastName ?? ''}`.trim();
}

export function getUserInitials(
  user: { firstName: string; lastName: string | null } | null | undefined
): string {
  if (!user) return '??';
  const firstInitial = user.firstName.charAt(0).toUpperCase();
  const lastInitial = user.lastName?.charAt(0).toUpperCase() ?? '';
  return `${firstInitial}${lastInitial}` || firstInitial;
}
