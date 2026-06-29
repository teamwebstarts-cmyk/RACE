import { create } from 'zustand';

import * as authService from '../services/authService';
import { getApiErrorMessage } from '../services/api';
import { clearSessionStores, loadSessionAfterLogin } from './authSession';
import type { User } from '../types/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  onboardingRequired: boolean;
  login: (mobileNumber: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
  setAuthenticated: (value: boolean) => void;
  setOnboardingRequired: (value: boolean) => void;
  setLoading: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  onboardingRequired: false,

  login: async (mobileNumber, otp) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.verifyOtp(mobileNumber, otp);

      const sessionOnboarding = await loadSessionAfterLogin();
      const onboardingRequired = sessionOnboarding ?? result.onboardingRequired;

      set({
        user: result.user,
        isAuthenticated: true,
        onboardingRequired,
        isLoading: false,
        error: null,
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
    set({
      user: null,
      isAuthenticated: false,
      onboardingRequired: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),

  setUser: user => set({ user }),

  setAuthenticated: value => set({ isAuthenticated: value }),

  setOnboardingRequired: value => set({ onboardingRequired: value }),

  setLoading: value => set({ isLoading: value }),
}));
