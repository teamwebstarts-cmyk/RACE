import axios from 'axios';

import { API_ENDPOINTS } from '../config/api';
import { API_BASE_URL } from '../config/env';
import type {
  AuthUser,
  SendOtpResponse,
  VerifyOtpResponse,
} from '../types/auth';
import type { Profile } from '../types/models';
import type { PartnerRole } from '../types/partner';
import { api, saveTokens, unwrapApi, clearTokens } from './api';
import { getRefreshToken } from './tokenStorage';

export async function sendOtp(payload: {
  mobileNumber: string;
  role: PartnerRole;
}): Promise<SendOtpResponse> {
  return unwrapApi(
    api.post(API_ENDPOINTS.sendOtp, {
      mobileNumber: payload.mobileNumber,
      role: payload.role,
    }),
  );
}

export async function verifyOtp(payload: {
  mobileNumber: string;
  otp: string;
  role: PartnerRole;
}): Promise<VerifyOtpResponse> {
  const result = await unwrapApi<VerifyOtpResponse>(
    api.post(API_ENDPOINTS.verifyOtp, {
      mobileNumber: payload.mobileNumber,
      otp: payload.otp,
      role: payload.role,
    }),
  );
  await saveTokens(result.accessToken, result.refreshToken);
  return result;
}

export async function logout(): Promise<void> {
  await clearTokens();
}

export async function getProfile(): Promise<Profile> {
  return unwrapApi(api.get(API_ENDPOINTS.profile));
}

export async function updateProfile(
  payload: Record<string, unknown>,
): Promise<Profile> {
  return unwrapApi(api.put(API_ENDPOINTS.profile, payload));
}

/** Re-issue tokens from DB role (e.g. after vendor registration). */
export async function refreshAuthSession(): Promise<VerifyOtpResponse> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  const result = await unwrapApi<VerifyOtpResponse>(
    axios.post(`${API_BASE_URL}${API_ENDPOINTS.refreshToken}`, { refreshToken }),
  );
  await saveTokens(result.accessToken, result.refreshToken);
  return result;
}

export type { AuthUser };
