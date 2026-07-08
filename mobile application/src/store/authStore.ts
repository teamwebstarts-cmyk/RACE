import { create } from 'zustand';

import * as authService from '../services/authService';
import type { SendOtpPayload, VerifyOtpPayload } from '../services/authService';
import { getApiErrorMessage } from '../services/api';
import { clearSessionStores } from './authSession';
import { bindSetOnboardingRequired } from './authState';
import { useVehicleStore } from './vehicleStore';
import type { User } from '../types/auth';

export interface SetAuthPayload {
  user: User;
  onboardingRequired: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  onboardingRequired: boolean;
  sendOtp: (payload: SendOtpPayload) => Promise<authService.SendOtpResult>;
  verifyOtp: (payload: VerifyOtpPayload) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setAuth: (payload: SetAuthPayload) => void;
  patchAuth: (patch: Partial<SetAuthPayload>) => void;
  clearAuth: () => void;
  setUser: (user: User | null) => void;
  setAuthenticated: (value: boolean) => void;
  setOnboardingRequired: (value: boolean) => void;
  setLoading: (value: boolean) => void;
}

async function completeAuthSession(
  result: Awaited<ReturnType<typeof authService.verifyOtp>>,
): Promise<boolean> {
  let onboardingRequired = result.onboardingRequired;
  try {
    const { useProfileStore } = await import('./profileStore');
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

async function syncReduxCredentials(
  payload: SetAuthPayload & { accessToken: string; refreshToken: string },
): Promise<void> {
  const { store } = await import('../redux/store');
  const { setCredentials } = await import('../redux/auth/authSlice');
  store.dispatch(
    setCredentials({
      user: payload.user,
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      onboardingRequired: payload.onboardingRequired,
    }),
  );
}

async function syncReduxLogout(): Promise<void> {
  const { store } = await import('../redux/store');
  const { logout: logoutAction } = await import('../redux/auth/authSlice');
  store.dispatch(logoutAction());
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  onboardingRequired: false,

  setAuth: payload =>
    set({
      user: payload.user,
      isAuthenticated: true,
      onboardingRequired: payload.onboardingRequired,
      isLoading: false,
      error: null,
    }),

  patchAuth: patch =>
    set(state => ({
      user: patch.user ?? state.user,
      isAuthenticated: true,
      onboardingRequired: patch.onboardingRequired ?? state.onboardingRequired,
    })),

  clearAuth: () =>
    set({
      user: null,
      isAuthenticated: false,
      onboardingRequired: false,
      error: null,
    }),

  sendOtp: async payload => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.sendOtp(payload);
      set({ isLoading: false });
      return result;
    } catch (error) {
      set({
        isLoading: false,
        error: getApiErrorMessage(error, 'Unable to send OTP'),
      });
      throw error;
    }
  },

  verifyOtp: async payload => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.verifyOtp(payload);
      const onboardingRequired = await completeAuthSession(result);

      set({
        user: result.user,
        isAuthenticated: true,
        onboardingRequired,
        isLoading: false,
        error: null,
      });

      await syncReduxCredentials({
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        onboardingRequired,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: getApiErrorMessage(error, 'Unable to verify OTP'),
      });
      throw error;
    }
  },

  logout: async () => {
    await authService.logout();
    clearSessionStores();
    await syncReduxLogout();
    get().clearAuth();
  },

  clearError: () => set({ error: null }),

  setUser: user => set({ user }),

  setAuthenticated: value => set({ isAuthenticated: value }),

  setOnboardingRequired: value => set({ onboardingRequired: value }),

  setLoading: value => set({ isLoading: value }),
}));

bindSetOnboardingRequired(value => {
  useAuthStore.getState().setOnboardingRequired(value);
});
