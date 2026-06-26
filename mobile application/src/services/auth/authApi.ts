import { API_ENDPOINTS } from '../../config/api';
import type {
  ApiSuccessResponse,
  CompleteProfileRequest,
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  AuthUser,
} from '../../types/auth';
import { apiClient } from '../api/apiClient';

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
  const { data } = await apiClient.put<ApiSuccessResponse<AuthUser>>(
    API_ENDPOINTS.profileComplete,
    payload,
  );
  return data.data;
}

export async function getProfile(): Promise<AuthUser> {
  const { data } = await apiClient.get<ApiSuccessResponse<AuthUser>>(API_ENDPOINTS.profile);
  return data.data;
}
