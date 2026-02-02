'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const pathname = usePathname();

  const links = [
    {
      href: '/users',
      label: 'Pengguna',
      icon: Users,
      active: pathname.startsWith('/users'),
    },
    {
      href: '/',
      label: 'Home',
      icon: Home,
      active: pathname === '/',
    },
    {
      href: '/clients',
      label: 'Klien',
      icon: Briefcase,
      active: pathname.startsWith('/clients'),
    },
  ];

  // Only show on mobile
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background px-4 pb-safe shadow-[0_-1px_3px_rgba(0,0,0,0.1)] md:hidden">
      {links.map(link => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'flex flex-col items-center justify-center space-y-1 text-xs font-medium transition-colors hover:text-primary',
            link.active ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          <link.icon className="h-5 w-5" />
          <span>{link.label}</span>
        </Link>
      ))}
    </div>
  );
}
