import { unwrapApi, api } from './api';
import type { Profile } from '../types/models';
import {
  sanitizeUpdateProfileRequest,
  type UpdateProfileRequest,
} from '../utils/profilePayload';

export async function getProfile(): Promise<Profile> {
  return unwrapApi(api.get('/api/v1/profile'));
}

export async function updateProfile(data: UpdateProfileRequest): Promise<Profile> {
  const body = sanitizeUpdateProfileRequest(data);
  return unwrapApi(api.put('/api/v1/profile', body));
}
