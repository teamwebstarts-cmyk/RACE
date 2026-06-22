import type { ChangePasswordPayload, ProfileDetail, ProfileData } from '@race/types';
import { delay } from '@race/utils';
import { appConfig } from '@race/config';

import { MOCK_PROFILE } from '../mocks/profile.mock';

export async function getProfile(): Promise<ProfileDetail> {
  await delay(appConfig.mockApiDelayMs);
  return { ...MOCK_PROFILE };
}

export async function updateProfile(data: Partial<ProfileData>): Promise<ProfileDetail> {
  await delay(400);
  Object.assign(MOCK_PROFILE, data);
  return { ...MOCK_PROFILE };
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await delay(400);
  if (payload.currentPassword !== 'Admin@123') {
    throw new Error('Current password is incorrect');
  }
  if (payload.newPassword !== payload.confirmPassword) {
    throw new Error('Passwords do not match');
  }
  if (payload.newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }
}

export async function updateProfileImage(_file: File): Promise<ProfileDetail> {
  await delay(500);
  MOCK_PROFILE.avatarUrl = '/race-logo.png';
  return { ...MOCK_PROFILE };
}
