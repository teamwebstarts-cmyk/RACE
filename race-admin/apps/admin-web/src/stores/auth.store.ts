import { configureAuthHandlers, setAccessToken } from '@race/api';
import type { AdminUser, AuthTokens } from '@race/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  hasHydrated: boolean;
  setUser: (user: AdminUser | null, tokens?: AuthTokens | null) => void;
  setTokens: (tokens: AuthTokens) => void;
  logout: () => void;
  hydrateToken: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      hasHydrated: false,
      setUser: (user, tokens) => {
        if (tokens) {
          setAccessToken(tokens.accessToken);
        }
        set({
          user,
          isAuthenticated: Boolean(user),
          accessToken: tokens?.accessToken ?? get().accessToken,
          refreshToken: tokens?.refreshToken ?? get().refreshToken,
        });
      },
      setTokens: (tokens) => {
        setAccessToken(tokens.accessToken);
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        });
      },
      logout: () => {
        setAccessToken(null);
        set({
          user: null,
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
        });
      },
      hydrateToken: () => {
        const token = get().accessToken;
        if (token) {
          setAccessToken(token);
        }
      },
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'race-admin-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          setAccessToken(state.accessToken);
        }
      },
    },
  ),
);

if (useAuthStore.persist.hasHydrated()) {
  useAuthStore.getState().setHasHydrated(true);
} else {
  useAuthStore.persist.onFinishHydration((state) => {
    if (state?.accessToken) {
      setAccessToken(state.accessToken);
    }
    useAuthStore.getState().setHasHydrated(true);
  });
}

configureAuthHandlers({
  getRefreshToken: () => useAuthStore.getState().refreshToken,
  onTokenRefreshed: (tokens) => {
    useAuthStore.getState().setTokens(tokens);
  },
  onSessionExpired: () => {
    useAuthStore.getState().logout();
    if (window.location.pathname !== '/login') {
      window.location.replace('/login');
    }
  },
});
