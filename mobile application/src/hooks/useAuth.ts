import { useEffect, useRef, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

import { TOKEN_KEYS } from '../config/env';
import { hydrateAuthStore } from '../redux/store';
import { setUnauthorizedHandler } from '../services/authSession';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';

export function useAuth() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const onboardingRequired = useAuthStore(state => state.onboardingRequired);
  const [isLoading, setIsLoading] = useState(true);
  const bootstrapStarted = useRef(false);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void useAuthStore.getState().logout();
    });
  }, []);

  useEffect(() => {
    if (bootstrapStarted.current) {
      return;
    }
    bootstrapStarted.current = true;

    let mounted = true;

    async function bootstrap() {
      useAuthStore.getState().setLoading(true);
      try {
        await hydrateAuthStore();

        const accessToken = await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS);
        if (!accessToken) {
          useAuthStore.getState().clearAuth();
          return;
        }

        const zustand = useAuthStore.getState();
        if (!zustand.isAuthenticated) {
          zustand.setAuthenticated(true);
        }

        try {
          await useProfileStore.getState().fetchProfile();
        } catch {
          // Keep session on transient network errors; 401 handler will clear auth.
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
          useAuthStore.getState().setLoading(false);
        }
      }
    }

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    isLoading,
    isAuthenticated,
    onboardingRequired,
  };
}

export function useAuthActions() {
  const sendOtp = useAuthStore(state => state.sendOtp);
  const verifyOtp = useAuthStore(state => state.verifyOtp);
  const logout = useAuthStore(state => state.logout);
  const clearError = useAuthStore(state => state.clearError);
  const error = useAuthStore(state => state.error);
  const isLoading = useAuthStore(state => state.isLoading);
  const user = useAuthStore(state => state.user);
  const onboardingRequired = useAuthStore(state => state.onboardingRequired);

  return {
    sendOtp,
    verifyOtp,
    logout,
    clearError,
    error,
    isLoading,
    user,
    onboardingRequired,
  };
}
