import { PARTNER_ROLE_KEY, TOKEN_KEYS } from '../config/env';
import type { AuthUser } from '../types/auth';
import type { PartnerRole } from '../types/partner';

const storage = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Ignore quota / private mode failures.
    }
  },
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore.
    }
  },
};

export async function getAccessToken(): Promise<string | null> {
  return storage.get(TOKEN_KEYS.ACCESS);
}

export async function getRefreshToken(): Promise<string | null> {
  return storage.get(TOKEN_KEYS.REFRESH);
}

export async function saveTokens(accessToken: string, refreshToken: string): Promise<void> {
  storage.set(TOKEN_KEYS.ACCESS, accessToken);
  storage.set(TOKEN_KEYS.REFRESH, refreshToken);
}

export async function clearTokens(): Promise<void> {
  storage.remove(TOKEN_KEYS.ACCESS);
  storage.remove(TOKEN_KEYS.REFRESH);
}

export interface PersistedAuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  onboardingRequired: boolean;
}

export function loadPersistedAuthState(): PersistedAuthState | null {
  const raw = storage.get(TOKEN_KEYS.AUTH_STATE);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PersistedAuthState;
  } catch {
    return null;
  }
}

export function savePersistedAuthState(state: PersistedAuthState): void {
  storage.set(TOKEN_KEYS.AUTH_STATE, JSON.stringify(state));
}

export function clearPersistedAuthState(): void {
  storage.remove(TOKEN_KEYS.AUTH_STATE);
}

export function getPartnerRole(): PartnerRole | null {
  const stored = storage.get(PARTNER_ROLE_KEY);
  if (stored === 'vendor' || stored === 'driver') return stored;
  return null;
}

export function setPartnerRole(role: PartnerRole | null): void {
  if (!role) {
    storage.remove(PARTNER_ROLE_KEY);
    return;
  }
  storage.set(PARTNER_ROLE_KEY, role);
}

export function clearPartnerRole(): void {
  storage.remove(PARTNER_ROLE_KEY);
}
