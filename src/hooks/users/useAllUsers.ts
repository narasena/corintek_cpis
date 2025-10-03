import { IUser } from '@/types/user.type';
import apiInstance from '@/utils/apiInstance';
import errorMessageResponse from '@/utils/errorMessageResponse';
import React from 'react';

export default function useAllUsers() {
  const [allUsers, setAllUsers] = React.useState<IUser[]>([]);

  const fetchAllUsers = async () => {
    try {
      const response = await apiInstance.get('/users');
      setAllUsers(response.data.users);
    } catch (error) {
      errorMessageResponse(error);
      console.error(error);
    }
  };

  React.useEffect(() => {
    fetchAllUsers();
  }, []);

  return { allUsers };
}
