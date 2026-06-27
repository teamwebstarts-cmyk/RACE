import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

import { TOKEN_KEYS } from '../config/env';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';

export function useAuth() {
  const {
    isAuthenticated,
    onboardingRequired,
    setAuthenticated,
    setLoading,
    logout,
  } = useAuthStore();
  const fetchProfile = useProfileStore(state => state.fetchProfile);
  const clearProfile = useProfileStore(state => state.clearProfile);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      setLoading(true);
      try {
        const accessToken = await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS);
        if (!accessToken) {
          if (mounted) {
            setAuthenticated(false);
          }
          return;
        }

        if (mounted) {
          setAuthenticated(true);
        }

        try {
          await fetchProfile();
          const profile = useProfileStore.getState().profile;
          if (profile && mounted) {
            useAuthStore.getState().setOnboardingRequired(!profile.isProfileCompleted);
          }
        } catch {
          await logout();
          clearProfile();
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
          setLoading(false);
        }
      }
    }

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, [clearProfile, fetchProfile, logout, setAuthenticated, setLoading]);

  return {
    isLoading,
    isAuthenticated,
    onboardingRequired,
  };
}

export function useAuthActions() {
  const login = useAuthStore(state => state.login);
  const logout = useAuthStore(state => state.logout);
  const clearError = useAuthStore(state => state.clearError);
  const error = useAuthStore(state => state.error);
  const isLoading = useAuthStore(state => state.isLoading);
  const user = useAuthStore(state => state.user);
  const onboardingRequired = useAuthStore(state => state.onboardingRequired);

  return {
    login,
    logout,
    clearError,
    error,
    isLoading,
    user,
    onboardingRequired,
  };
}
