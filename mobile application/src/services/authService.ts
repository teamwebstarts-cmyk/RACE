import { clearTokens, saveTokens, unwrapApi, api } from './api';
import type { User, VerifyOtpResponse } from '../types/auth';

interface SendOtpResult {
  message: string;
  expiresIn: number;
}

export async function sendOtp(mobileNumber: string): Promise<SendOtpResult> {
  return unwrapApi(
    api.post('/api/v1/auth/send-otp', { mobileNumber }),
  );
}

export async function verifyOtp(
  mobileNumber: string,
  otp: string,
): Promise<VerifyOtpResponse> {
  const result = await unwrapApi<VerifyOtpResponse>(
    api.post('/api/v1/auth/verify-otp', { mobileNumber, otp }),
  );
  await saveTokens(result.accessToken, result.refreshToken);
  return result;
}

export async function logout(): Promise<void> {
  await clearTokens();
}

export type { User };
