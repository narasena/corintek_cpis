import useAllUsers from '@/hooks/users/useAllUsers';

export default function useUsers() {
  const { allUsers } = useAllUsers();

  return {
    allUsers,
  };
}
