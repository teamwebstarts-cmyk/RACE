export async function loadSessionAfterLogin(): Promise<boolean | undefined> {
  const { useProfileStore } = require('./profileStore') as typeof import('./profileStore');
  const { useVehicleStore } = require('./vehicleStore') as typeof import('./vehicleStore');

  let onboardingRequired: boolean | undefined;
  try {
    await useProfileStore.getState().fetchProfile();
    const profile = useProfileStore.getState().profile;
    if (profile) {
      onboardingRequired = !profile.isProfileCompleted;
    }
    await useVehicleStore.getState().fetchVehicles();
  } catch {
    // Keep auth response flags if profile/vehicles fail to load.
  }
  return onboardingRequired;
}

export function clearSessionStores(): void {
  const { useProfileStore } = require('./profileStore') as typeof import('./profileStore');
  const { useVehicleStore } = require('./vehicleStore') as typeof import('./vehicleStore');
  const { usePartnerRegistrationStore } =
    require('./partnerRegistrationStore') as typeof import('./partnerRegistrationStore');
  const { queryClient } = require('../services/queryClient') as typeof import('../services/queryClient');

  useProfileStore.getState().clearProfile();
  useVehicleStore.getState().clearVehicles();
  usePartnerRegistrationStore.getState().reset();
  queryClient.clear();
}

export function syncOnboardingRequired(isProfileCompleted: boolean): void {
  const { useAuthStore } = require('./authStore') as typeof import('./authStore');
  useAuthStore.getState().setOnboardingRequired(!isProfileCompleted);
}
