import { create } from 'zustand';

import * as profileService from '../services/profileService';
import { getApiErrorMessage } from '../services/api';
import type { Profile } from '../types/models';
import type { UpdateProfileRequest } from '../utils/profilePayload';

interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<Profile>;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const profile = await profileService.getProfile();
      set({ profile, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getApiErrorMessage(error, 'Unable to load profile'),
      });
      throw error;
    }
  },

  updateProfile: async data => {
    set({ isLoading: true, error: null });
    try {
      const profile = await profileService.updateProfile(data);
      set({ profile, isLoading: false });
      const { syncOnboardingRequired } = require('./authSession') as typeof import('./authSession');
      syncOnboardingRequired(profile.isProfileCompleted);
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
