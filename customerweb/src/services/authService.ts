import { API_ENDPOINTS } from '../config/api';
import type {
  AuthUser,
  CompleteProfileRequest,
  SendOtpResponse,
  VerifyOtpResponse,
} from '../types/auth';
import type { Profile } from '../types/models';
import { api, saveTokens, unwrapApi, clearTokens } from './api';

export async function sendOtp(payload: {
  mobileNumber: string;
  role?: 'customer' | 'vendor' | 'driver';
}): Promise<SendOtpResponse> {
  return unwrapApi(
    api.post(API_ENDPOINTS.sendOtp, {
      mobileNumber: payload.mobileNumber,
      role: payload.role ?? 'customer',
    }),
  );
}

export async function verifyOtp(payload: {
  mobileNumber: string;
  otp: string;
  role?: 'customer' | 'vendor' | 'driver';
}): Promise<VerifyOtpResponse> {
  const result = await unwrapApi<VerifyOtpResponse>(
    api.post(API_ENDPOINTS.verifyOtp, {
      mobileNumber: payload.mobileNumber,
      otp: payload.otp,
      role: payload.role ?? 'customer',
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

export async function completeProfile(payload: CompleteProfileRequest): Promise<AuthUser> {
  const profile = await unwrapApi<Profile>(api.put(API_ENDPOINTS.profileComplete, payload));
  return {
    id: profile.id,
    mobileNumber: profile.mobileNumber,
    role: profile.role,
    isVerified: profile.isVerified,
    isProfileCompleted: profile.isProfileCompleted,
    fullName: profile.fullName,
    email: profile.email,
    gender: profile.gender,
    dateOfBirth: profile.dateOfBirth,
    emergencyContact: profile.emergencyContact,
    address: profile.address,
    profilePhoto: profile.profilePhoto,
  };
}

export async function updateProfile(
  payload: Record<string, unknown>,
): Promise<Profile> {
  return unwrapApi(api.put(API_ENDPOINTS.profile, payload));
}
