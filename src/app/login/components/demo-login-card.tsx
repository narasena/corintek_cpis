'use client';

import { demoLoginAction } from '@/features/auth/actions';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

/**
 * One-click demo login card for portfolio reviewers.
 * Visible only when NEXT_PUBLIC_DEMO_MODE=true (development only).
 */
export function DemoLoginCard() {
  const [loadingRole, setLoadingRole] = useState<'admin' | 'client' | null>(
    null
  );

  const handleDemoLogin = async (role: 'admin' | 'client') => {
    setLoadingRole(role);
    try {
      const ok = await demoLoginAction(role);
      if (ok) {
        toast.success('Berhasil masuk sebagai demo', {
          description:
            role === 'admin'
              ? 'Mengalihkan ke dashboard Admin...'
              : 'Mengalihkan ke portal Client...',
        });
      } else {
        toast.error('Gagal masuk sebagai demo', {
          description: 'Periksa log server untuk detail.',
        });
      }
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted-foreground">
          Coba Sebagai Demo
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="mt-4 grid gap-2">
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          disabled={loadingRole !== null}
          onClick={() => handleDemoLogin('admin')}
        >
          {loadingRole === 'admin' ? 'Masuk sebagai Admin...' : 'Demo (Admin)'}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={loadingRole !== null}
          onClick={() => handleDemoLogin('client')}
        >
          {loadingRole === 'client'
            ? 'Masuk sebagai Client...'
            : 'Demo (Client)'}
        </Button>
      </div>
    </div>
  );
}
