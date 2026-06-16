import { API_ENDPOINTS } from '../../config/api';
import type {
  ApiSuccessResponse,
  AuthUser,
  CompleteProfileRequest,
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from '../../types/auth';
import { apiClient } from '../api/apiClient';

export interface ProfileResponse {
  id: string;
  mobileNumber: string;
  fullName?: string;
  email?: string;
  gender?: string;
  dateOfBirth?: string;
  emergencyContact?: AuthUser['emergencyContact'];
  address?: AuthUser['address'];
  profilePhoto?: string;
  isVerified: boolean;
  isProfileCompleted: boolean;
  role: string;
}

function mapProfileToAuthUser(profile: ProfileResponse): AuthUser {
  const role = profile.role as AuthUser['role'];
  return {
    id: profile.id,
    mobileNumber: profile.mobileNumber,
    role: role === 'vendor' || role === 'admin' ? role : 'customer',
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

export async function sendOtp(payload: SendOtpRequest): Promise<SendOtpResponse> {
  const { data } = await apiClient.post<ApiSuccessResponse<SendOtpResponse>>(
    API_ENDPOINTS.sendOtp,
    payload,
  );
  return data.data;
}

export async function verifyOtp(payload: VerifyOtpRequest): Promise<VerifyOtpResponse> {
  const { data } = await apiClient.post<ApiSuccessResponse<VerifyOtpResponse>>(
    API_ENDPOINTS.verifyOtp,
    payload,
  );
  return data.data;
}

export async function completeProfile(payload: CompleteProfileRequest): Promise<AuthUser> {
  const { data } = await apiClient.put<ApiSuccessResponse<ProfileResponse>>(
    API_ENDPOINTS.profileComplete,
    payload,
  );
  return mapProfileToAuthUser(data.data);
}

export async function getProfile(): Promise<AuthUser> {
  const { data } = await apiClient.get<ApiSuccessResponse<ProfileResponse>>(
    API_ENDPOINTS.profile,
  );
  return mapProfileToAuthUser(data.data);
}
