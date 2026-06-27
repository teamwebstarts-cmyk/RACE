import { setAccessToken } from '@race/api';
import type { AdminUser } from '@race/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  setUser: (user: AdminUser | null, token?: string | null) => void;
  logout: () => void;
  hydrateToken: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      setUser: (user, token) => {
        if (token) {
          setAccessToken(token);
        }
        set({
          user,
          isAuthenticated: Boolean(user),
          accessToken: token ?? get().accessToken,
        });
      },
      logout: () => {
        setAccessToken(null);
        set({ user: null, isAuthenticated: false, accessToken: null });
      },
      hydrateToken: () => {
        const token = get().accessToken;
        if (token) {
          setAccessToken(token);
        }
      },
    }),
    {
      name: 'race-admin-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
      }),
    },
  ),
);
