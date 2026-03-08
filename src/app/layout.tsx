import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { initializeCacheContainer } from '@/features/cache/di';
import { initializeDashboardContainer } from '@/features/dashboard/di';
import { prisma } from '@/lib/prisma';
import './globals.css';

// Initialize both containers at startup
initializeDashboardContainer(prisma);
initializeCacheContainer(prisma);

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CPIS',
  description: 'Corintek Project Information System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
