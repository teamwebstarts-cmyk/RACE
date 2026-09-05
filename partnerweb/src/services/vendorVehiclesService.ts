import { API_ENDPOINTS } from '../config/api';
import type { ApiSuccessResponse } from '../types/auth';
import type { CreateFleetVehicleInput, FleetVehicle } from '../types/partner';
import { api } from './api';

export async function listVendorVehicles(): Promise<FleetVehicle[]> {
  const { data } = await api.get<ApiSuccessResponse<FleetVehicle[]>>(
    API_ENDPOINTS.vendorVehicles,
  );
  return data.data ?? [];
}

export async function createVendorVehicle(
  payload: CreateFleetVehicleInput,
): Promise<FleetVehicle> {
  const { data } = await api.post<ApiSuccessResponse<FleetVehicle>>(
    API_ENDPOINTS.vendorVehicles,
    payload,
  );
  return data.data;
}

export async function removeVendorVehicle(vehicleId: string): Promise<void> {
  await api.delete(API_ENDPOINTS.vendorVehicle(vehicleId));
}
