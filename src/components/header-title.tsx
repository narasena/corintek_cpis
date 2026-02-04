'use client';

import { usePathname } from 'next/navigation';

export function HeaderTitle() {
  const pathname = usePathname();

  const getTitle = (path: string) => {
    if (path === '/') return 'Dashboard';

    // Remove leading slash and split
    const segments = path.substring(1).split('/');
    if (segments.length === 0) return 'Dashboard';

    // Get the first segment (domain)
    const domain = segments[0];

    // Format: "log-sheets" -> "Log Sheets"
    return domain
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return <div>{getTitle(pathname)}</div>;
}
