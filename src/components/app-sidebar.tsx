'use client';

import * as React from 'react';
import Image from 'next/image';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { filterNavItems } from '@/lib/rbac';
import { NAV_CONFIG } from '@/lib/constants/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: { name: string; email: string; avatar: string | null; role: string };
}) {
  // Filter all categories through RBAC
  const categories = {
    platform: filterNavItems(user.role, [...NAV_CONFIG.platform]),
    operations: filterNavItems(user.role, [...NAV_CONFIG.operations]),
    inventory: filterNavItems(user.role, [...NAV_CONFIG.inventory]),
    administration: filterNavItems(user.role, [...NAV_CONFIG.administration]),
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="data-[slot=sidebar-menu-button]:p-1.5! hover:bg-transparent"
            >
              <a href="/" className="flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={130}
                  height={15}
                  className="object-contain"
                  priority
                />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={categories.platform} />
        <NavMain items={categories.operations} label="Operasional" />
        <NavMain items={categories.inventory} label="Inventori & Master" />
        <NavMain items={categories.administration} label="Administrasi" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
