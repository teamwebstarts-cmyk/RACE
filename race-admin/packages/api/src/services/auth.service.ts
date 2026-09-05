import type { AdminUser, LoginRequest, LoginResponse } from '@race/types';

import { setAccessToken } from '../client';
import { apiAuthPost, apiGet, apiPost } from '../http';

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const result = await apiAuthPost<LoginResponse>('/login', payload);
  setAccessToken(result.tokens.accessToken);
  return result;
}

export async function logout(refreshToken?: string): Promise<void> {
  try {
    await apiPost('/auth/logout', { refreshToken });
  } finally {
    setAccessToken(null);
  }
}

export async function getCurrentUser(): Promise<AdminUser> {
  return apiGet<AdminUser>('/auth/me');
}

export async function refreshAccessToken(refreshToken: string) {
  return apiAuthPost<{ tokens: LoginResponse['tokens'] }>('/refresh-token', { refreshToken });
}
