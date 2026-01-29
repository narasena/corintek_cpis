import { IUser } from '@/types/user.type';
import apiInstance from '@/utils/apiInstance';
import errorMessageResponse from '@/utils/api/v1/errorMessageResponse';
import React from 'react';
import { toast } from 'sonner';

export default function useAllUsers() {
  const [allUsers, setAllUsers] = React.useState<IUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiInstance.get('/users');
      setAllUsers(response.data.users);
    } catch (error) {
      const errorMessage = errorMessageResponse(error);
      toast.error(errorMessage);
      setError(errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAllUsers();
  }, []);

  return { allUsers, loading, error, refetch: fetchAllUsers };
}
