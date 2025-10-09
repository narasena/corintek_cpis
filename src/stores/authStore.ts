import { create } from 'zustand';

interface ITokenDetail {
  id: string | null;
  role: string | null;
}

interface IAuthStore extends ITokenDetail {
  setAuth: (id: string, role: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<IAuthStore>()(set => ({
  id: null,
  role: null,
  // setAuth now only takes client-safe data
  setAuth: (id, role) => {
    set({ id, role });
  },
  // Logout (clearing the HttpOnly cookie) requires an API call to a server endpoint.
  clearAuth: () => {
    set({ id: null, role: null });
    // The client cannot delete the HttpOnly cookie.
    // A call to a '/api/logout' endpoint should be made to clear the session.
  },
}));
