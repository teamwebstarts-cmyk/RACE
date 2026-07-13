import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { AuthUser } from '../types/auth';

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  onboardingRequired: boolean;
  pendingMobileNumber: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  onboardingRequired: false,
  pendingMobileNumber: null,
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
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.onboardingRequired = action.payload.onboardingRequired;
      state.isAuthenticated = true;
      state.loading = false;
      state.pendingMobileNumber = null;
    },
    completeOnboarding(state, action: PayloadAction<AuthUser | undefined>) {
      if (action.payload) {
        state.user = action.payload;
      }
      state.isAuthenticated = true;
      state.onboardingRequired = false;
      state.loading = false;
    },
    updateUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
    },
    updateTokens(
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>,
    ) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.onboardingRequired = false;
      state.pendingMobileNumber = null;
    },
    rehydrateAuth(
      state,
      action: PayloadAction<{
        user: AuthUser | null;
        accessToken: string | null;
        refreshToken: string | null;
        isAuthenticated: boolean;
        onboardingRequired: boolean;
      }>,
    ) {
      Object.assign(state, action.payload, { loading: false });
    },
  },
});

export const {
  setLoading,
  setPendingMobileNumber,
  setCredentials,
  completeOnboarding,
  updateUser,
  updateTokens,
  logout,
  rehydrateAuth,
} = authSlice.actions;

export default authSlice.reducer;
