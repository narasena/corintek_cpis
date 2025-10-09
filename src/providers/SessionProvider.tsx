'use client';

import { useAuthStore } from '@/stores/authStore';
import errorMessageResponse from '@/utils/api/v1/errorMessageResponse';
import apiInstance from '@/utils/apiInstance';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

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
      // Redirect only if not already on login page
      if (
        typeof window !== 'undefined' &&
        window.location.pathname !== '/login'
      ) {
        router.push('/login');
      }
    }
  };

  useEffect(() => {
    // Initial session check
    fetchSession().finally(() => setIsLoading(false));

    // Periodic session check every 5 minutes
    const intervalId = setInterval(fetchSession, SESSION_CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, [router, setUser]);

  if (isLoading) {
    // Here you could return a full-page loading spinner
    return null;
  }

  return <>{children}</>;
}
