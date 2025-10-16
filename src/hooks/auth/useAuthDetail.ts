import { useAuthStore } from '@/stores/authStore';

export default function useAuthDetail() {
  const { user } = useAuthStore();
  const isManagement = user?.role === 'ADMIN' || user?.role === 'DIRECTOR';
  const isStaff = user?.role === 'SUPERVISOR' || user?.role === 'TECHNICIAN';
  return {
    isManagement,
    isStaff,
  };
}
