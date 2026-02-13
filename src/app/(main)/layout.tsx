import { AppSidebar } from '@/components/app-sidebar';
import { HeaderTitle } from '@/components/header-title';
import { MobileNav } from '@/components/mobile-nav';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { getCurrentUserDetails } from '@/lib/auth-helpers';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      <SidebarInset className="print:m-0">
        <header className="flex fixed top-0 z-40 w-full h-16 shrink-0 items-center gap-2 border-b bg-primary text-primary-foreground px-4 print:hidden">
          <SidebarTrigger className="-ml-1 hidden md:flex" />
          <Separator
            orientation="vertical"
            className="mr-2 h-4 hidden md:block"
          />
          <div className="font-medium">
            <HeaderTitle />
          </div>
        </header>
        <div className="mt-16 flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8 print:p-0 pb-20 md:pb-6 max-w-fit mx-auto w-full print:w!">
          {children}
        </div>
        <MobileNav role={sidebarUser.role} />
      </SidebarInset>
    </SidebarProvider>
  );
}
