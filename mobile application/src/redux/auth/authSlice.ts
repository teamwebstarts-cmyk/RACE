import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { AuthUser } from '../../types/auth';

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  onboardingRequired: boolean;
  pendingMobileNumber: string | null;
  /** When true, an approved vendor sees the customer app instead of the partner app. */
  useCustomerExperience: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  onboardingRequired: false,
  pendingMobileNumber: null,
  useCustomerExperience: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setPendingMobileNumber(state, action: PayloadAction<string | null>) {
      state.pendingMobileNumber = action.payload;
    },
    setCredentials(
      state,
      action: PayloadAction<{
        user: AuthUser;
        accessToken: string;
        refreshToken: string;
        onboardingRequired: boolean;
      }>,
    ) {
      const profileDone = action.payload.user.isProfileCompleted;
      const needsOnboarding = action.payload.onboardingRequired && !profileDone;

      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.onboardingRequired = needsOnboarding;
      state.isAuthenticated = !needsOnboarding;
      state.loading = false;
      state.pendingMobileNumber = null;
    },
    completeProfileSuccess(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.onboardingRequired = false;
      state.loading = false;
    },
    completeOnboarding(state, action: PayloadAction<AuthUser | undefined>) {
      if (action.payload) {
        state.user = action.payload;
      }
      state.isAuthenticated = true;
      state.onboardingRequired = false;
      state.loading = false;
    },
    updateTokens(
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>,
    ) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    updateUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
    },
    setUseCustomerExperience(state, action: PayloadAction<boolean>) {
      state.useCustomerExperience = action.payload;
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.onboardingRequired = false;
      state.pendingMobileNumber = null;
      state.useCustomerExperience = false;
    },
  },
});

export const {
  setLoading,
  setPendingMobileNumber,
  setCredentials,
  completeProfileSuccess,
  completeOnboarding,
  updateUser,
  setUseCustomerExperience,
  updateTokens,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
