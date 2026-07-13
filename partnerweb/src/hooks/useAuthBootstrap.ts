import { useEffect, useState } from 'react';

import { hydrateAuthStore } from '../redux/store';
import { setUnauthorizedHandler } from '../services/authSession';
import { getAccessToken } from '../services/tokenStorage';
import { useAuthStore } from '../store/authStore';
import { usePartnerOnboardingStore } from '../store/partnerOnboardingStore';
import { useProfileStore } from '../store/profileStore';

export function useAuthBootstrap() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const onboardingRequired = useAuthStore((s) => s.onboardingRequired);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void useAuthStore.getState().logout();
    });
    usePartnerOnboardingStore.getState().hydrateRole();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      useAuthStore.getState().setLoading(true);
      try {
        await hydrateAuthStore();
        if (cancelled) return;

        const accessToken = await getAccessToken();
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
          if (cancelled) return;

          const profile = useProfileStore.getState().profile;
          if (profile && (profile.role === 'vendor' || profile.role === 'driver')) {
            usePartnerOnboardingStore.getState().setSelectedRole(profile.role);
            const needsOnboarding = !profile.isProfileCompleted;
            useAuthStore.getState().setAuth({
              user: {
                id: profile.id,
                mobileNumber: profile.mobileNumber,
                role: profile.role,
                isVerified: profile.isVerified,
                isProfileCompleted: profile.isProfileCompleted,
                fullName: profile.fullName,
                email: profile.email,
                gender: profile.gender,
                dateOfBirth: profile.dateOfBirth,
                emergencyContact: profile.emergencyContact,
                address: profile.address,
                profilePhoto: profile.profilePhoto,
              },
              onboardingRequired: needsOnboarding,
            });
          }
        } catch {
          // Keep session on transient errors; 401 clears auth.
        }
      } catch {
        useAuthStore.getState().clearAuth();
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          useAuthStore.getState().setLoading(false);
        }
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    isLoading,
    isAuthenticated,
    onboardingRequired,
    canEnterApp: isAuthenticated && !onboardingRequired,
  };
}
