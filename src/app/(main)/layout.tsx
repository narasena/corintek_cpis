import { AppSidebar } from '@/components/app-sidebar';
import { HeaderTitle } from '@/components/header-title';
import { NotificationBell } from '@/features/notifications/components/notification-bell';
import { MobileNav } from '@/components/mobile-nav';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { getCurrentUserDetails } from '@/lib/auth-helpers';
import { Suspense } from 'react';

function MainLayoutFallback() {
  return (
    <SidebarProvider>
      <div className="print:hidden">
        <div className="h-screen w-64 bg-muted animate-pulse" />
      </div>
      <SidebarInset className="print:m-0 bg-background/50">
        <header className="flex sticky top-0 z-40 w-full h-16 shrink-0 items-center gap-2 border-b border-border/40 bg-background/80 backdrop-blur-md px-4 print:hidden">
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        </header>
        <div className="print:mt-0! flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8 print:p-0 pb-20 md:pb-6 mx-auto w-full print:w!">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<MainLayoutFallback />}>
      <MainLayoutInner>{children}</MainLayoutInner>
    </Suspense>
  );
}

async function MainLayoutInner({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUserDetails();

  const name = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName ?? ''}`.trim()
    : 'User';

  const sidebarUser = {
    name,
    email: currentUser?.email ?? '',
    avatar: currentUser?.avatarUrl ?? '',
    role: currentUser?.role ?? 'DIRECTOR',
  };

  return (
    <SidebarProvider>
      <div className="print:hidden">
        <AppSidebar user={sidebarUser} />
      </div>
      <SidebarInset className="print:m-0 bg-background/50">
        <header className="flex sticky top-0 z-40 w-full h-20 shrink-0 items-center justify-between border-b border-primary/20 bg-gradient-to-r from-primary via-primary to-primary/95 shadow-lg transition-all duration-300 px-4 md:px-6 lg:px-8 print:hidden">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-2 hidden md:flex text-primary-foreground hover:bg-white/10 transition-colors scale-110" />
            <Separator
              orientation="vertical"
              className="mr-2 h-6 hidden md:block bg-white/20"
            />
            <div className="py-1 text-primary-foreground">
              <HeaderTitle />
            </div>
          </div>
          <NotificationBell className="text-primary-foreground" />
        </header>
        <div className="print:mt-0! flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 print:p-0 pb-20 md:pb-6 mx-auto w-full max-w-[1600px] print:w!">
          {children}
        </div>
        <MobileNav role={sidebarUser.role} />
      </SidebarInset>
    </SidebarProvider>
  );
}
