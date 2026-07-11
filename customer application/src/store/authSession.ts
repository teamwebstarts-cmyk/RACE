export async function loadSessionAfterLogin(): Promise<boolean | undefined> {
  const { useProfileStore } = require('./profileStore') as typeof import('./profileStore');
  const { useVehicleStore } = require('./vehicleStore') as typeof import('./vehicleStore');
  const { getCustomerOnboardingStep } =
    require('./customerOnboarding') as typeof import('./customerOnboarding');

  try {
    await useProfileStore.getState().fetchProfile();
    await useVehicleStore.getState().fetchVehicles();
  } catch {
    // Keep auth response flags if profile/vehicles fail to load.
  }

  const step = await getCustomerOnboardingStep();
  return step !== 'done';
}

export function clearSessionStores(): void {
  const { useProfileStore } = require('./profileStore') as typeof import('./profileStore');
  const { useVehicleStore } = require('./vehicleStore') as typeof import('./vehicleStore');
  const { queryClient } = require('../services/queryClient') as typeof import('../services/queryClient');

  useProfileStore.getState().clearProfile();
  useVehicleStore.getState().clearVehicles();
  queryClient.clear();
}

export function syncOnboardingRequired(isProfileCompleted: boolean): void {
  const { useAuthStore } = require('./authStore') as typeof import('./authStore');
  useAuthStore.getState().setOnboardingRequired(!isProfileCompleted);
}
