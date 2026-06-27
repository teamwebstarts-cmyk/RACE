import { API_CONFIG, API_ENDPOINTS } from '../../config/api';
import type { ApiSuccessResponse } from '../../types/auth';
import type { VendorProfileResponse, VendorRegistrationRequest } from '../../types/vendor';
import { apiClient } from '../api/apiClient';
import { store } from '../../redux/store';

export async function saveVendorDraft(
  payload: Partial<VendorRegistrationRequest> & { vendorType: VendorRegistrationRequest['vendorType'] },
): Promise<VendorProfileResponse> {
  const { data } = await apiClient.post<ApiSuccessResponse<VendorProfileResponse>>(
    `${API_ENDPOINTS.vendorDraft}`,
    payload,
  );
  return data.data;
}

export async function registerVendor(
  payload: VendorRegistrationRequest,
): Promise<VendorProfileResponse> {
  const { data } = await apiClient.post<ApiSuccessResponse<VendorProfileResponse>>(
    API_ENDPOINTS.vendorRegister,
    payload,
  );
  return data.data;
}

export async function updateVendor(
  payload: Partial<VendorRegistrationRequest>,
): Promise<VendorProfileResponse> {
  const { data } = await apiClient.put<ApiSuccessResponse<VendorProfileResponse>>(
    API_ENDPOINTS.vendorUpdate,
    payload,
  );
  return data.data;
}

export async function getVendorProfile(): Promise<VendorProfileResponse> {
  const { data } = await apiClient.get<ApiSuccessResponse<VendorProfileResponse>>(
    API_ENDPOINTS.vendorProfile,
  );
  return data.data;
}

export async function getVendorStatus(): Promise<VendorProfileResponse> {
  const { data } = await apiClient.get<ApiSuccessResponse<VendorProfileResponse>>(
    API_ENDPOINTS.vendorStatus,
  );
  return data.data;
}

export interface UploadProgressHandler {
  (progress: number): void;
}

export async function uploadVendorDocument(
  documentType: string,
  file: { uri: string; name: string; mimeType: string },
  onProgress?: UploadProgressHandler,
): Promise<VendorProfileResponse> {
  const formData = new FormData();
  formData.append('documentType', documentType);
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType,
  } as unknown as Blob);

  const token = store.getState().auth.accessToken;

  const { data } = await apiClient.post<ApiSuccessResponse<VendorProfileResponse>>(
    API_ENDPOINTS.vendorUploadDocument,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      onUploadProgress: (event) => {
        if (!event.total || !onProgress) return;
        onProgress(Math.round((event.loaded / event.total) * 100));
      },
    },
  );
  return data.data;
}

export async function uploadVendorSelfie(
  file: { uri: string; name: string; mimeType: string },
  onProgress?: UploadProgressHandler,
): Promise<VendorProfileResponse> {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType,
  } as unknown as Blob);

  const token = store.getState().auth.accessToken;

  const { data } = await apiClient.post<ApiSuccessResponse<VendorProfileResponse>>(
    API_ENDPOINTS.vendorSelfie,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      onUploadProgress: (event) => {
        if (!event.total || !onProgress) return;
        onProgress(Math.round((event.loaded / event.total) * 100));
      },
    },
  );
  return data.data;
}

export { API_CONFIG };
