'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, Clock, FileSpreadsheet, Home, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';
import { canAccess, matchPathToResource } from '@/lib/rbac';

export function MobileNav({ role }: { role: string }) {
  const pathname = usePathname();
  const { toggleSidebar, isMobile } = useSidebar();

  const links = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
      active: pathname === '/',
    },
    {
      href: '/projects',
      label: 'Projects',
      icon: Building2,
      active: pathname.startsWith('/projects'),
    },
    {
      href: '/log-sheets',
      label: 'Log Sheets',
      icon: FileSpreadsheet,
      active: pathname.startsWith('/log-sheets'),
    },
    {
      href: '/attendance',
      label: 'Absensi',
      icon: Clock,
      active: pathname.startsWith('/attendance'),
    },
  ];

  const filteredLinks = links.filter(link => {
    const resource = matchPathToResource(link.href);
    if (!resource) return true;
    return canAccess(role, resource, 'read');
  });

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background/80 px-4 pb-safe backdrop-blur-md md:hidden supports-[backdrop-filter]:bg-background/60">
      {filteredLinks.map(link => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'flex flex-col items-center justify-center space-y-1 text-[10px] font-medium transition-colors hover:text-primary',
            link.active ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          <link.icon className={cn('h-5 w-5', link.active && 'fill-current')} />
          <span>{link.label}</span>
        </Link>
      ))}
      <button
        onClick={toggleSidebar}
        className="flex flex-col items-center justify-center space-y-1 text-[10px] font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <Menu className="h-5 w-5" />
        <span>Menu</span>
      </button>
    </div>
  );
}
