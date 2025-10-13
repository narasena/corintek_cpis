import useAllUsers from '@/hooks/users/useAllUsers';

export default function useUsers() {
  const { allUsers, loading, error, refetch } = useAllUsers();

  return {
    allUsers,
    loading,
    error,
    refetch,
  };
}
