'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  Clock,
  FileSpreadsheet,
  FileText,
  Home,
  Menu,
  Microscope,
  MoreHorizontal,
  ClipboardList,
  Users,
  FlaskConical,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';
import { canAccess, matchPathToResource } from '@/lib/rbac';

/**
 * Mobile Navigation Component
 * 
 * UX-203: Mobile Navigation Coverage
 * UX-207: Touch Target Minimum (44px)
 * 
 * Primary nav: 4-5 items
 * Secondary items accessible via "Lainnya" Sheet menu
 */
export function MobileNav({ role }: { role: string }) {
  const pathname = usePathname();
  const { toggleSidebar, isMobile } = useSidebar();

  // Primary navigation items - top 5 for field technicians
  const primaryLinks = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
      active: pathname === '/',
    },
    {
      href: '/projects',
      label: 'Proyek',
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

  // Secondary items - accessible via "Lainnya" menu
  const secondaryLinks = [
    {
      href: '/work-reports',
      label: 'Work Reports',
      icon: FileText,
    },
    {
      href: '/lab-analyses',
      label: 'Lab Analyses',
      icon: Microscope,
    },
    {
      href: '/summary-reports',
      label: 'Summary',
      icon: ClipboardList,
    },
    {
      href: '/reports',
      label: 'Reports',
      icon: FileSpreadsheet,
    },
    {
      href: '/chemicals',
      label: 'Chemicals',
      icon: FlaskConical,
    },
    {
      href: '/clients',
      label: 'Clients',
      icon: Users,
    },
    {
      href: '/users',
      label: 'Users',
      icon: Users,
    },
    {
      href: '/parameters',
      label: 'Parameters',
      icon: FlaskConical,
    },
  ];

  // Filter primary by RBAC
  const filteredPrimary = primaryLinks.filter(link => {
    const resource = matchPathToResource(link.href);
    if (!resource) return true;
    return canAccess(role, resource, 'read');
  });

  // Filter secondary by RBAC
  const filteredSecondary = secondaryLinks.filter(link => {
    const resource = matchPathToResource(link.href);
    if (!resource) return true;
    return canAccess(role, resource, 'read');
  });

  if (!isMobile) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background/80 px-2 pb-safe backdrop-blur-md md:hidden supports-[backdrop-filter]:bg-background/60">
      {filteredPrimary.map(link => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'group flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] text-[10px] font-medium transition-all hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md',
            link.active ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          <div className="relative">
            {link.active && (
              <span className="absolute -top-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
            )}
            <link.icon
              className={cn(
                'h-6 w-6 transition-transform',
                link.active && 'scale-110 fill-current'
              )}
            />
          </div>
          <span className="truncate max-w-[60px]">{link.label}</span>
        </Link>
      ))}
      
      {/* "Lainnya" - opens Sheet with secondary navigation */}
      <Sheet>
        <SheetTrigger asChild>
          <button
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] text-[10px] font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md'
            )}
            aria-label="More options"
          >
            <MoreHorizontal className="h-6 w-6" />
            <span>Lainnya</span>
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-auto pb-8">
          <div className="py-4">
            <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
              Menu Lainnya
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {filteredSecondary.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex flex-col items-center gap-2 rounded-lg p-3 hover:bg-muted transition-colors min-h-[44px]"
                >
                  <link.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs text-center">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Menu button - opens full sidebar */}
      <button
        onClick={toggleSidebar}
        className={cn(
          'flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] text-[10px] font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md'
        )}
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
        <span>Menu</span>
      </button>
    </nav>
  );
}
