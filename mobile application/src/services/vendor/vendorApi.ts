import { API_ENDPOINTS } from '../../config/api';
import type { ApiSuccessResponse, VendorRegistrationRequest, VendorStatusResponse } from '../../types/auth';
import { apiClient } from '../api/apiClient';

export async function registerVendor(
  payload: VendorRegistrationRequest,
): Promise<VendorStatusResponse> {
  const { data } = await apiClient.post<ApiSuccessResponse<VendorStatusResponse>>(
    API_ENDPOINTS.vendorRegister,
    payload,
  );
  return data.data;
}

export async function getVendorStatus(): Promise<VendorStatusResponse> {
  const { data } = await apiClient.get<ApiSuccessResponse<VendorStatusResponse>>(
    API_ENDPOINTS.vendorStatus,
  );
  return data.data;
}
