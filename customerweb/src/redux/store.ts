import { configureStore, type Middleware } from '@reduxjs/toolkit';

import authReducer, {
  completeOnboarding,
  logout,
  rehydrateAuth,
  setCredentials,
  updateTokens,
  type AuthState,
} from './authSlice';
import { clearTokens, saveTokens } from '../services/api';
import {
  clearPersistedAuthState,
  getCustomerOnboardingStep,
  loadPersistedAuthState,
  savePersistedAuthState,
  saveTokens as persistTokenPair,
} from '../services/tokenStorage';

function pickPersistedAuth(state: AuthState) {
  return {
    user: state.user,
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
    isAuthenticated: state.isAuthenticated,
    onboardingRequired: state.onboardingRequired,
  };
}

const persistAuthMiddleware: Middleware = (storeApi) => (next) => (action) => {
  const result = next(action);

  if (
    setCredentials.match(action) ||
    completeOnboarding.match(action) ||
    updateTokens.match(action)
  ) {
    const auth = storeApi.getState().auth as AuthState;
    savePersistedAuthState(pickPersistedAuth(auth));
    if (auth.accessToken && auth.refreshToken) {
      void persistTokenPair(auth.accessToken, auth.refreshToken);
    }
  }

  if (logout.match(action)) {
    clearPersistedAuthState();
    void clearTokens();
  }

  return result;
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(persistAuthMiddleware),
});

export async function hydrateAuthStore(): Promise<void> {
  const persisted = loadPersistedAuthState();
  if (!persisted) return;

  const step = getCustomerOnboardingStep();
  const onboardingRequired = step !== 'done';

  store.dispatch(
    rehydrateAuth({
      ...persisted,
      onboardingRequired,
    }),
  );

  if (persisted.accessToken && persisted.refreshToken) {
    await saveTokens(persisted.accessToken, persisted.refreshToken);
  }
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
