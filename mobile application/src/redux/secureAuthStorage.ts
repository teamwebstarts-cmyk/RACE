import * as SecureStore from 'expo-secure-store';

import type { AuthState } from './auth/authSlice';

const REDUX_AUTH_KEY = 'redux_auth_state';

type PersistedAuthState = Pick<
  AuthState,
  'user' | 'accessToken' | 'refreshToken' | 'isAuthenticated' | 'onboardingRequired'
>;

export async function loadPersistedAuthState(): Promise<PersistedAuthState | null> {
  try {
    const raw = await SecureStore.getItemAsync(REDUX_AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedAuthState;
  } catch {
    return null;
  }
}

export async function savePersistedAuthState(state: PersistedAuthState): Promise<void> {
  await SecureStore.setItemAsync(REDUX_AUTH_KEY, JSON.stringify(state));
}

export async function clearPersistedAuthState(): Promise<void> {
  await SecureStore.deleteItemAsync(REDUX_AUTH_KEY);
}
