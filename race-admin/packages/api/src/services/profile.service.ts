import type { ChangePasswordPayload, ProfileDetail } from '@race/types';
import { Role } from '@race/types';

import { apiGet } from '../http';

export async function getProfile(): Promise<ProfileDetail> {
  const user = await apiGet<{
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
  }>('/auth/me');

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
    avatarUrl: user.avatarUrl,
    phone: '',
    department: 'Administration',
    joinedAt: new Date().toISOString(),
    loginActivity: [],
  };
}

export async function updateProfile(_input: Partial<ProfileDetail>) {
  return getProfile();
}

export async function changePassword(_payload: ChangePasswordPayload) {
  throw new Error('Change password via admin profile is not yet implemented');
}

export async function updateProfileImage(_file: File) {
  throw new Error('Profile image upload is not yet implemented');
}
