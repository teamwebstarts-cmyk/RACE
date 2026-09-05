import { useEffect, useState } from 'react';

import { hydrateAuthStore } from '../redux/store';
import { setUnauthorizedHandler } from '../services/authSession';
import { getAccessToken } from '../services/tokenStorage';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { useVehicleStore } from '../store/vehicleStore';

export function useAuthBootstrap() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const onboardingRequired = useAuthStore((s) => s.onboardingRequired);
  const customerOnboardingStep = useAuthStore((s) => s.customerOnboardingStep);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void useAuthStore.getState().logout();
    });
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
          await useVehicleStore.getState().fetchVehicles();
          if (cancelled) return;

          const profile = useProfileStore.getState().profile;
          const vehicles = useVehicleStore.getState().vehicles;
          const { isCustomerPinSet } = await import('../utils/pinStorage');

          let step: 'profile' | 'pin' | 'vehicle' | 'done' = 'done';
          if (!profile?.isProfileCompleted) step = 'profile';
          else if (!isCustomerPinSet()) step = 'pin';
          else if (vehicles.length === 0) step = 'vehicle';

          useAuthStore.getState().setCustomerOnboardingStep(step);
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
    customerOnboardingStep,
    canEnterApp: isAuthenticated && !onboardingRequired,
  };
}
