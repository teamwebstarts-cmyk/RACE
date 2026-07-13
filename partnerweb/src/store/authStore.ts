import { create } from 'zustand';

import * as authService from '../services/authService';
import { getApiErrorMessage } from '../services/api';
import { queryClient } from '../services/queryClient';
import { clearPartnerRole } from '../services/tokenStorage';
import type { AuthUser } from '../types/auth';
import { usePartnerOnboardingStore } from './partnerOnboardingStore';
import { usePartnerRegistrationStore } from './partnerRegistrationStore';
import { useProfileStore } from './profileStore';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  onboardingRequired: boolean;
  sendOtp: (payload: {
    mobileNumber: string;
  }) => Promise<Awaited<ReturnType<typeof authService.sendOtp>>>;
  verifyOtp: (payload: { mobileNumber: string; otp: string }) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setAuth: (payload: { user: AuthUser; onboardingRequired: boolean }) => void;
  clearAuth: () => void;
  setAuthenticated: (value: boolean) => void;
  setOnboardingRequired: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  completePartnerOnboarding: (user?: AuthUser) => Promise<void>;
}

function partnerOnboardingRequired(user: AuthUser): boolean {
  if (user.role === 'driver' || user.role === 'vendor') {
    return !user.isProfileCompleted;
  }
  return true;
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

  setAuth: (payload) =>
    set({
      user: payload.user,
      isAuthenticated: true,
      onboardingRequired: payload.onboardingRequired,
      isLoading: false,
      error: null,
    }),

  clearAuth: () =>
    set({
      user: null,
      isAuthenticated: false,
      onboardingRequired: false,
      error: null,
    }),

  sendOtp: async (payload) => {
    const role = usePartnerOnboardingStore.getState().selectedRole;
    if (!role) {
      throw new Error('Select vendor or driver before continuing');
    }
    set({ isLoading: true, error: null });
    try {
      const result = await authService.sendOtp({
        mobileNumber: payload.mobileNumber,
        role,
      });
      set({ isLoading: false });
      return result;
    } catch (error) {
      set({ isLoading: false, error: getApiErrorMessage(error, 'Unable to send OTP') });
      throw error;
    }
  },

  verifyOtp: async (payload) => {
    const role = usePartnerOnboardingStore.getState().selectedRole;
    if (!role) {
      throw new Error('Select vendor or driver before continuing');
    }
    set({ isLoading: true, error: null });
    try {
      const result = await authService.verifyOtp({
        mobileNumber: payload.mobileNumber,
        otp: payload.otp,
        role,
      });

      try {
        await useProfileStore.getState().fetchProfile();
      } catch {
        // Keep session even if profile fails to load.
      }

      const profile = useProfileStore.getState().profile;
      const onboardingRequired =
        result.onboardingRequired ??
        partnerOnboardingRequired({
          ...result.user,
          isProfileCompleted:
            profile?.isProfileCompleted ?? result.user.isProfileCompleted,
        });

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
      set({ isLoading: false, error: getApiErrorMessage(error, 'Unable to verify OTP') });
      throw error;
    }
  },

  logout: async () => {
    get().clearAuth();
    useProfileStore.getState().clearProfile();
    usePartnerRegistrationStore.getState().reset();
    usePartnerOnboardingStore.getState().clearSelectedRole();
    clearPartnerRole();
    queryClient.clear();
    await authService.logout();
    await syncReduxLogout();
  },

  clearError: () => set({ error: null }),
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setOnboardingRequired: (value) => set({ onboardingRequired: value }),
  setLoading: (value) => set({ isLoading: value }),

  completePartnerOnboarding: async (user) => {
    const nextUser = user ?? get().user;
    set({
      user: nextUser
        ? { ...nextUser, isProfileCompleted: true }
        : nextUser,
      onboardingRequired: false,
      isAuthenticated: true,
    });

    const { store } = await import('../redux/store');
    const { completeOnboarding } = await import('../redux/authSlice');
    store.dispatch(
      completeOnboarding(
        nextUser ? { ...nextUser, isProfileCompleted: true } : undefined,
      ),
    );
  },
}));
