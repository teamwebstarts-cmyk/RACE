import { create } from 'zustand';

import * as authService from '../services/authService';
import { getApiErrorMessage } from '../services/api';
import type { Profile } from '../types/models';

interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
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
