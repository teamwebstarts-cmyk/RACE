import type { AdminUser, LoginRequest, LoginResponse } from '@race/types';
import { Permission, Role } from '@race/types';
import { delay } from '@race/utils';
import { appConfig } from '@race/config';

import { setAccessToken } from '../client';

const MOCK_ADMIN: AdminUser = {
  id: 'admin_1',
  name: 'Admin User',
  email: 'admin@raceservice.com',
  role: Role.SUPER_ADMIN,
  permissions: Object.values(Permission),
  avatarUrl: undefined,
};

const MOCK_CREDENTIALS = {
  email: 'admin@raceservice.com',
  password: 'Admin@123',
};

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  await delay(appConfig.mockApiDelayMs);

  const email = payload.identifier.trim().toLowerCase();

  if (!email || !payload.password) {
    throw new Error('Email and password are required');
  }

  if (
    email !== MOCK_CREDENTIALS.email ||
    payload.password !== MOCK_CREDENTIALS.password
  ) {
    throw new Error('Invalid email or password');
  }

  const tokens = {
    accessToken: 'mock_admin_access_token',
    refreshToken: 'mock_admin_refresh_token',
    expiresIn: '15m',
  };

  setAccessToken(tokens.accessToken);

  return { user: MOCK_ADMIN, tokens };
}

export async function logout(): Promise<void> {
  setAccessToken(null);
}

export async function getCurrentUser(): Promise<AdminUser> {
  await delay(200);
  return MOCK_ADMIN;
}
