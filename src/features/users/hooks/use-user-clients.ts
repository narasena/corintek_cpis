'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getAllClientsAction } from '@/features/clients/actions';

export function useUserClients(isEnabled: boolean) {
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEnabled) {
      setIsLoading(true);
      getAllClientsAction({})
        .then(result => {
          if (result.success && result.data) {
            setClients(result.data);
          } else {
            toast.error('Gagal memuat data klien');
          }
        })
        .catch(() => toast.error('Gagal memuat data klien'))
        .finally(() => setIsLoading(false));
    }
  }, [isEnabled]);

  return { clients, isLoading };
}
