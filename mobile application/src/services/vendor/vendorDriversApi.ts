import { api } from '../api';
import { API_ENDPOINTS } from '../../config/api';
import type { ApiSuccessResponse } from '../../types/auth';

export type FleetDriver = {
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
};

export type CreateFleetDriverInput = {
  name: string;
  phone: string;
  licenseNo: string;
  driverType: 'Tow Driver' | 'Full-Time' | 'Part-Time';
  city?: string;
  vehicleRegistration?: string;
  email?: string;
};

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
  const { data } = await api.post<ApiSuccessResponse<FleetDriver>>(API_ENDPOINTS.vendorDriverClaim, {
    phone,
  });
  return data.data;
}

export async function removeVendorDriver(driverId: string): Promise<void> {
  await api.delete(API_ENDPOINTS.vendorDriver(driverId));
}
