import { api } from '../api';
import { API_ENDPOINTS } from '../../config/api';
import type { ApiSuccessResponse } from '../../types/auth';
import { store } from '../../redux/store';

/** @deprecated Prefer VendorDriver */
export type FleetDriver = VendorDriver;

export type VendorDriver = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  driverType: string;
  licenseNo: string;
  city: string;
  vehicleRegistration?: string;
  status: string;
  isAvailable: boolean;
  isBusy: boolean;
  rating: number;
  vendorId: string;
  loginId?: string;
  hasPasswordLogin?: boolean;
};

/** @deprecated Prefer CreateVendorDriverInput */
export type CreateFleetDriverInput = CreateVendorDriverInput;

export type CreateVendorDriverInput = {
  name: string;
  phone: string;
  licenseNo: string;
  driverType: 'Tow Driver' | 'Full-Time' | 'Part-Time';
  city?: string;
  vehicleRegistration?: string;
  email?: string;
  loginId: string;
  password: string;
};

export async function listVendorDrivers(): Promise<VendorDriver[]> {
  const { data } = await api.get<ApiSuccessResponse<VendorDriver[]>>(API_ENDPOINTS.vendorDrivers);
  return data.data ?? [];
}

export async function createVendorDriver(payload: CreateVendorDriverInput): Promise<VendorDriver> {
  const { data } = await api.post<ApiSuccessResponse<VendorDriver>>(
    API_ENDPOINTS.vendorDrivers,
    payload,
  );
  return data.data;
}

export async function claimVendorDriver(phone: string): Promise<VendorDriver> {
  const { data } = await api.post<ApiSuccessResponse<VendorDriver>>(API_ENDPOINTS.vendorDriverClaim, {
    phone,
  });
  return data.data;
}

export async function removeVendorDriver(driverId: string): Promise<void> {
  await api.delete(API_ENDPOINTS.vendorDriver(driverId));
}

export async function uploadVendorDriverDocument(
  driverId: string,
  documentType: string,
  file: { uri: string; name: string; mimeType: string },
): Promise<VendorDriver> {
  const formData = new FormData();
  formData.append('documentType', documentType);
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType,
  } as unknown as Blob);

  const token = store.getState().auth.accessToken;
  const { data } = await api.post<ApiSuccessResponse<VendorDriver>>(
    API_ENDPOINTS.vendorDriverUploadDocument(driverId),
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  );
  return data.data;
}
