import { API_ENDPOINTS } from '../config/api';
import type { ApiSuccessResponse } from '../types/auth';
import type { CreateFleetDriverInput, FleetDriver } from '../types/partner';
import { api } from './api';

export async function listVendorDrivers(): Promise<FleetDriver[]> {
  const { data } = await api.get<ApiSuccessResponse<FleetDriver[]>>(API_ENDPOINTS.vendorDrivers);
  return data.data ?? [];
}

export async function createVendorDriver(payload: CreateFleetDriverInput): Promise<FleetDriver> {
  const { data } = await api.post<ApiSuccessResponse<FleetDriver>>(
    API_ENDPOINTS.vendorDrivers,
    payload,
  );
  return data.data;
}

export async function claimVendorDriver(phone: string): Promise<FleetDriver> {
  const { data } = await api.post<ApiSuccessResponse<FleetDriver>>(
    API_ENDPOINTS.vendorDriverClaim,
    { phone },
  );
  return data.data;
}

export async function removeVendorDriver(driverId: string): Promise<void> {
  await api.delete(API_ENDPOINTS.vendorDriver(driverId));
}

export async function uploadVendorDriverDocument(
  driverId: string,
  documentType: string,
  file: File | Blob,
  fileName?: string,
): Promise<FleetDriver> {
  const formData = new FormData();
  formData.append('documentType', documentType);
  const name = fileName || (file instanceof File ? file.name : 'document.jpg');
  formData.append('file', file, name);

  const { data } = await api.post<ApiSuccessResponse<FleetDriver>>(
    API_ENDPOINTS.vendorDriverUploadDocument(driverId),
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data.data;
}
