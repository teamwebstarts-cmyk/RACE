import { create } from 'zustand';

import * as authService from '../services/authService';
import { getApiErrorMessage } from '../services/api';
import { queryClient } from '../services/queryClient';
import {
  clearCustomerOnboardingStep,
  getCustomerOnboardingStep,
  setCustomerOnboardingStep as persistOnboardingStep,
} from '../services/tokenStorage';
import { clearCustomerPin, isCustomerPinSet } from '../utils/pinStorage';
import type { AuthUser, CustomerOnboardingStep } from '../types/auth';
import { useProfileStore } from './profileStore';
import { useVehicleStore } from './vehicleStore';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  onboardingRequired: boolean;
  customerOnboardingStep: CustomerOnboardingStep;
  sendOtp: (payload: { mobileNumber: string }) => Promise<Awaited<ReturnType<typeof authService.sendOtp>>>;
  verifyOtp: (payload: { mobileNumber: string; otp: string }) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setAuth: (payload: { user: AuthUser; onboardingRequired: boolean }) => void;
  clearAuth: () => void;
  setAuthenticated: (value: boolean) => void;
  setOnboardingRequired: (value: boolean) => void;
  setCustomerOnboardingStep: (step: CustomerOnboardingStep) => void;
  setLoading: (value: boolean) => void;
  advanceOnboarding: (step: CustomerOnboardingStep) => void;
}

function onboardingRequiredForStep(step: CustomerOnboardingStep): boolean {
  return step !== 'done';
}

async function resolveStep(
  result: Awaited<ReturnType<typeof authService.verifyOtp>>,
): Promise<CustomerOnboardingStep> {
  const profile = useProfileStore.getState().profile;
  const vehicles = useVehicleStore.getState().vehicles;

  if (!profile?.isProfileCompleted || result.onboardingRequired) {
    if (!profile?.isProfileCompleted) {
      clearCustomerOnboardingStep();
      return 'profile';
    }
  }

  if (!isCustomerPinSet()) {
    return 'pin';
  }

  if (vehicles.length === 0) {
    return 'vehicle';
  }

  const stored = getCustomerOnboardingStep();
  if (stored === 'done') return 'done';

  return 'done';
}

async function syncReduxCredentials(payload: {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  onboardingRequired: boolean;
}): Promise<void> {
  const { store } = await import('../redux/store');
  const { setCredentials } = await import('../redux/authSlice');
  store.dispatch(setCredentials(payload));
}

async function syncReduxLogout(): Promise<void> {
  const { store } = await import('../redux/store');
  const { logout: logoutAction } = await import('../redux/authSlice');
  store.dispatch(logoutAction());
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  onboardingRequired: false,
  customerOnboardingStep: 'profile',

  setAuth: (payload) =>
    set({
      user: payload.user,
      isAuthenticated: true,
      onboardingRequired: payload.onboardingRequired,
      customerOnboardingStep: payload.onboardingRequired ? 'profile' : 'done',
      isLoading: false,
      error: null,
    }),

  clearAuth: () =>
    set({
      user: null,
      isAuthenticated: false,
      onboardingRequired: false,
      customerOnboardingStep: 'profile',
      error: null,
    }),

  sendOtp: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.sendOtp(payload);
      set({ isLoading: false });
      return result;
    } catch (error) {
      set({ isLoading: false, error: getApiErrorMessage(error, 'Unable to send OTP') });
      throw error;
    }
  },

  verifyOtp: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.verifyOtp(payload);
      try {
        await useProfileStore.getState().fetchProfile();
        await useVehicleStore.getState().fetchVehicles();
      } catch {
        // Keep session even if secondary fetches fail.
      }

      const customerOnboardingStep = await resolveStep(result);
      persistOnboardingStep(customerOnboardingStep);
      const onboardingRequired = onboardingRequiredForStep(customerOnboardingStep);

      set({
        user: result.user,
        isAuthenticated: true,
        onboardingRequired,
        customerOnboardingStep,
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
      set({ isLoading: false, error: getApiErrorMessage(error, 'Unable to verify OTP') });
      throw error;
    }
  },

  logout: async () => {
    get().clearAuth();
    useProfileStore.getState().clearProfile();
    useVehicleStore.getState().clearVehicles();
    clearCustomerOnboardingStep();
    clearCustomerPin();
    queryClient.clear();
    await authService.logout();
    await syncReduxLogout();
  },

  clearError: () => set({ error: null }),
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setOnboardingRequired: (value) =>
    set((state) => ({
      onboardingRequired: value,
      customerOnboardingStep: value ? state.customerOnboardingStep : 'done',
    })),
  setCustomerOnboardingStep: (step) => {
    persistOnboardingStep(step);
    set({
      customerOnboardingStep: step,
      onboardingRequired: onboardingRequiredForStep(step),
    });
  },
  advanceOnboarding: (step) => {
    get().setCustomerOnboardingStep(step);
    if (step === 'done') {
      void import('../redux/store').then(({ store }) => {
        void import('../redux/authSlice').then(({ completeOnboarding }) => {
          store.dispatch(completeOnboarding(get().user ?? undefined));
        });
      });
    }
  },
  setLoading: (value) => set({ isLoading: value }),
}));
