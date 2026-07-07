import { clearTokens, saveTokens, unwrapApi, api } from './api';
import type { User, VerifyOtpResponse } from '../types/auth';

export interface SendOtpPayload {
  mobileNumber: string;
}

export interface VerifyOtpPayload {
  mobileNumber: string;
  otp: string;
}

export interface SendOtpResult {
  message: string;
  expiresIn: number;
  isExistingUser: boolean;
  isProfileCompleted: boolean;
  onboardingRequired?: boolean;
}

export async function sendOtp(payload: SendOtpPayload): Promise<SendOtpResult> {
  return unwrapApi(
    api.post('/api/v1/auth/send-otp', { mobileNumber: payload.mobileNumber }),
  );
}

export async function verifyOtp(payload: VerifyOtpPayload): Promise<VerifyOtpResponse> {
  const result = await unwrapApi<VerifyOtpResponse>(
    api.post('/api/v1/auth/verify-otp', {
      mobileNumber: payload.mobileNumber,
      otp: payload.otp,
    }),
  );
  await saveTokens(result.accessToken, result.refreshToken);
  return result;
}

export async function logout(): Promise<void> {
  await clearTokens();
}

export type { User };
