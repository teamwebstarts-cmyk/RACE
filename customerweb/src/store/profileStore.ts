import { create } from 'zustand';

import * as authService from '../services/authService';
import { getApiErrorMessage } from '../services/api';
import type { Profile } from '../types/models';
import type { CompleteProfileRequest } from '../types/auth';

interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  completeProfile: (data: CompleteProfileRequest) => Promise<void>;
  updateProfile: (data: Record<string, unknown>) => Promise<Profile>;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const profile = await authService.getProfile();
      set({ profile, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getApiErrorMessage(error, 'Unable to load profile'),
      });
      throw error;
    }
  },

  completeProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.completeProfile(data);
      const profile = await authService.getProfile();
      set({ profile, isLoading: false });
      const { useAuthStore } = await import('./authStore');
      useAuthStore.getState().setAuth({
        user: { ...user, ...profile },
        onboardingRequired: true,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: getApiErrorMessage(error, 'Unable to complete profile'),
      });
      throw error;
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const profile = await authService.updateProfile(data);
      set({ profile, isLoading: false });
      return profile;
    } catch (error) {
      set({
        isLoading: false,
        error: getApiErrorMessage(error, 'Unable to update profile'),
      });
      throw error;
    }
  },

  clearProfile: () => set({ profile: null, error: null }),
}));
