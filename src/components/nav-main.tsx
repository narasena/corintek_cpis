'use client';

import { type LucideIcon } from 'lucide-react';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup className="p-0">
      <SidebarMenu className="gap-1.5">
        {items.map(item => {
          const isActive =
            item.url === '/' ? pathname === '/' : pathname.startsWith(item.url);

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={item.title}
                className={cn(
                  'py-5 md:py-2.5 rounded-full transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary font-bold shadow-sm'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground font-medium'
                )}
              >
                <Link href={item.url}>
                  <item.icon
                    className={cn(
                      'transition-transform',
                      isActive ? 'scale-110 text-primary!' : ''
                    )}
                  />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
