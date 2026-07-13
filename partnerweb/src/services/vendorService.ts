import { API_ENDPOINTS } from '../config/api';
import type { ApiSuccessResponse } from '../types/auth';
import type {
  VendorDashboardStats,
  VendorProfileResponse,
  VendorRegistrationRequest,
} from '../types/vendor';
import { api, unwrapApi } from './api';

export async function saveVendorDraft(
  payload: Partial<VendorRegistrationRequest> & {
    vendorType: VendorRegistrationRequest['vendorType'];
  },
): Promise<VendorProfileResponse> {
  return unwrapApi(api.post(API_ENDPOINTS.vendorDraft, payload));
}

export async function registerVendor(
  payload: VendorRegistrationRequest,
): Promise<VendorProfileResponse> {
  return unwrapApi(api.post(API_ENDPOINTS.vendorRegister, payload));
}

export async function updateVendor(
  payload: Partial<VendorRegistrationRequest>,
): Promise<VendorProfileResponse> {
  return unwrapApi(api.put(API_ENDPOINTS.vendorUpdate, payload));
}

export async function getVendorProfile(): Promise<VendorProfileResponse> {
  return unwrapApi(api.get(API_ENDPOINTS.vendorProfile));
}

export async function getVendorStatus(): Promise<VendorProfileResponse> {
  return unwrapApi(api.get(API_ENDPOINTS.vendorStatus));
}

export async function getVendorDashboard(): Promise<VendorDashboardStats> {
  return unwrapApi(api.get(API_ENDPOINTS.vendorDashboard));
}

export async function uploadVendorDocument(
  documentType: string,
  file: File | Blob,
  fileName?: string,
  onProgress?: (progress: number) => void,
): Promise<VendorProfileResponse> {
  const formData = new FormData();
  formData.append('documentType', documentType);
  const name =
    fileName ||
    (file instanceof File ? file.name : 'document.jpg');
  formData.append('file', file, name);

  const { data } = await api.post<ApiSuccessResponse<VendorProfileResponse>>(
    API_ENDPOINTS.vendorUploadDocument,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (!event.total || !onProgress) return;
        onProgress(Math.round((event.loaded / event.total) * 100));
      },
    },
  );
  return data.data;
}

export async function uploadVendorSelfie(
  file: File | Blob,
  fileName?: string,
  onProgress?: (progress: number) => void,
): Promise<VendorProfileResponse> {
  const formData = new FormData();
  const name = fileName || (file instanceof File ? file.name : 'selfie.jpg');
  formData.append('file', file, name);

  const { data } = await api.post<ApiSuccessResponse<VendorProfileResponse>>(
    API_ENDPOINTS.vendorSelfie,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (!event.total || !onProgress) return;
        onProgress(Math.round((event.loaded / event.total) * 100));
      },
    },
  );
  return data.data;
}
