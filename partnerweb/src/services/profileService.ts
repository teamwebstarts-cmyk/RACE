import * as authService from './authService';
import type { Profile } from '../types/models';

export async function getProfile(): Promise<Profile> {
  return authService.getProfile();
}
