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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const data = {
  user: {
    name: 'User',
    email: 'user@corintek.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
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
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
