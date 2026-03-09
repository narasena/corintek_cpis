'use client';

import { useState, useEffect } from 'react';
import { getCurrentUserProfileAction } from '@/features/users/actions';
import { TUserResponse } from '@/@types/user.type';

interface IUseSessionReturn {
  user: TUserResponse | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Client-side hook to get the current authenticated user.
 * Uses the protected getCurrentUserProfileAction server action.
 */
export function useSession(): IUseSessionReturn {
  const [user, setUser] = useState<TUserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const result = await getCurrentUserProfileAction({});

        if (result.success) {
          setUser(result.data as TUserResponse);
        } else {
          setUser(null);
          setError(result.error ?? 'Failed to fetch user');
        }
      } catch (err) {
        setUser(null);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, isLoading, error };
}
