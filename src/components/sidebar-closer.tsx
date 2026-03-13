'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useSidebar } from '@/components/ui/sidebar';

export function SidebarCloser() {
  const pathname = usePathname();
  const { isMobile, openMobile, setOpenMobile } = useSidebar();

  useEffect(() => {
    if (isMobile) {
      // Add small delay to ensure navigation completes
      const timer = setTimeout(() => setOpenMobile(false), 100);
      return () => clearTimeout(timer);
    }
  }, [pathname, isMobile, setOpenMobile]);

  return null;
}
