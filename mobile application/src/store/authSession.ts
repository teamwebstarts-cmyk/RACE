export async function loadSessionAfterLogin(): Promise<boolean | undefined> {
  const { useProfileStore } = require('./profileStore') as typeof import('./profileStore');

  try {
    await useProfileStore.getState().fetchProfile();
  } catch {
    // Keep auth response flags if profile fails to load.
  }

  const profile = useProfileStore.getState().profile;
  if (!profile) {
    return undefined;
  }

  return !profile.isProfileCompleted;
}

export function clearSessionStores(): void {
  const { useProfileStore } = require('./profileStore') as typeof import('./profileStore');
  const { usePartnerRegistrationStore } =
    require('./partnerRegistrationStore') as typeof import('./partnerRegistrationStore');
  const { queryClient } = require('../services/queryClient') as typeof import('../services/queryClient');

  useProfileStore.getState().clearProfile();
  usePartnerRegistrationStore.getState().reset();
  queryClient.clear();
}

export function syncOnboardingRequired(isProfileCompleted: boolean): void {
  const { useAuthStore } = require('./authStore') as typeof import('./authStore');
  useAuthStore.getState().setOnboardingRequired(!isProfileCompleted);
}
