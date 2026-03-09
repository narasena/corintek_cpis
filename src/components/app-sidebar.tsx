'use client';

import * as React from 'react';
import {
  BookUser,
  Building2,
  ClipboardList,
  Clock,
  FileSpreadsheet,
  FileText,
  FlaskConical,
  LayoutDashboard,
  Microscope,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
import Image from 'next/image';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { filterNavItems } from '@/lib/rbac';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const navMain = [
  {
    title: 'Dashboard',
    url: '/',
    icon: LayoutDashboard,
    isActive: true,
  },
  {
    title: 'Clients',
    url: '/clients',
    icon: BookUser,
  },
  {
    title: 'Projects',
    url: '/projects',
    icon: Building2,
  },
  {
    title: 'Summary Reports',
    url: '/summary-reports',
    icon: ClipboardList,
  },
  {
    title: 'Log Sheets',
    url: '/log-sheets',
    icon: FileSpreadsheet,
  },
  {
    title: 'Work Reports',
    url: '/work-reports',
    icon: FileText,
  },
  {
    title: 'Lab Analyses',
    url: '/lab-analyses',
    icon: Microscope,
  },
  {
    title: 'Chemicals',
    url: '/chemicals',
    icon: FlaskConical,
  },
  {
    title: 'Parameters',
    url: '/parameters',
    icon: SlidersHorizontal,
  },
  {
    title: 'Users',
    url: '/users',
    icon: Users,
  },
  {
    title: 'Absensi',
    url: '/attendance',
    icon: Clock,
  },
];

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: { name: string; email: string; avatar: string | null; role: string };
}) {
  const items = filterNavItems(user.role, navMain);

  return (
    <Sidebar
      collapsible="offcanvas"
      className="border-r border-border/40 bg-muted/20"
      {...props}
    >
      <SidebarHeader className="py-4">
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
                  width={140}
                  height={15}
                  className="object-contain"
                  priority
                />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="px-5 mt-2">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Selamat datang kembali,
          </p>
          <p className="text-sm font-bold truncate">
            {user.name.split(' ')[0]}
          </p>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 pt-2 gap-0">
        <NavMain items={items} />
      </SidebarContent>
      <SidebarFooter className="p-4 pt-2">
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
