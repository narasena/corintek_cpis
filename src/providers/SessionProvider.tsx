'use client';

import { useAuthStore } from '@/stores/authStore';
import errorMessageResponse from '@/utils/api/v1/errorMessageResponse';
import apiInstance from '@/utils/apiInstance';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await apiInstance.get('/auth/me');
        if (response.data) {
          console.log('SessionProvider: User data:', response.data);
          setUser(response.data);
        }
      } catch (error) {
        // This is expected if the user is not logged in
        toast.error(errorMessageResponse(error));
        setUser(null);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [setUser]);

  if (isLoading) {
    // Here you could return a full-page loading spinner
    return null;
  }

  return <>{children}</>;
}
