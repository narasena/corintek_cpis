import { useEffect, useState } from 'react';

import { getAllUsersAction } from '@/features/users/actions';
import type { TUserResponse } from '@/@types/user.type';

export function useLogSheetTechnicians() {
  const [technicians, setTechnicians] = useState<TUserResponse[]>([]);

  useEffect(() => {
    getAllUsersAction().then(res => {
      if (res.success && res.data) {
        setTechnicians(res.data);
      }
    });
  }, []);

  return { technicians };
}
