import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { getTechniciansListAction } from '@/features/users/actions';
import type { TUserResponse } from '@/@types/user.type';

async function loadTechnicians(onSuccess: (users: TUserResponse[]) => void) {
  try {
    const res = await getTechniciansListAction({});
    if (res.success && res.data) {
      onSuccess(res.data as any);
    } else {
      toast.error('Gagal memuat daftar teknisi');
    }
  } catch {
    toast.error('Terjadi kesalahan saat memuat teknisi');
  }
}

export function useLogSheetTechnicians() {
  const [technicians, setTechnicians] = useState<TUserResponse[]>([]);

  useEffect(() => {
    let active = true;

    loadTechnicians(users => {
      if (!active) return;
      setTechnicians(users);
    });

    return () => {
      active = false;
    };
  }, []);

  return { technicians };
}
