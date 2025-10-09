import { create } from 'zustand';
import apiInstance from '@/utils/apiInstance';

interface User {
  id: string;
  role: string;
  name?: string;
  email?: string;
}

interface IAuthStore {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<IAuthStore>()(set => ({
  user: null,
  setUser: user => set({ user }),
  logout: async () => {
    try {
      await apiInstance.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      set({ user: null });
    }
  },
}));
