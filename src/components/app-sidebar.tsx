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
  // Navigation sections configuration with display labels
  const navSections = [
    { items: NAV_CONFIG.platform },
    { items: NAV_CONFIG.operations, label: 'Operasional' },
    { items: NAV_CONFIG.inventory, label: 'Inventori & Master' },
    { items: NAV_CONFIG.administration, label: 'Administrasi' },
  ];

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
        {navSections.map((section, index) => (
          <NavMain
            key={section.label ?? `nav-section-${index}`}
            items={filterNavItems(user.role, [...section.items])}
            label={section.label}
          />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
