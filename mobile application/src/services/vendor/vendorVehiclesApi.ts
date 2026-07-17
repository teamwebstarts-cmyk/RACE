import { api } from '../api';
import { API_ENDPOINTS } from '../../config/api';
import type { ApiSuccessResponse } from '../../types/auth';

export type FleetVehicleStatus = 'ACTIVE' | 'UNDER_MAINTENANCE' | 'INACTIVE';

export type FleetVehicle = {
  id: string;
  vendorId: string;
  registrationNo: string;
  type: string;
  model: string;
  year?: number;
  status: FleetVehicleStatus | string;
  insuranceExpiry?: string;
  maintenanceNote?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateFleetVehicleInput = {
  registrationNo: string;
  type: string;
  model: string;
  year?: number;
  status?: FleetVehicleStatus;
  insuranceExpiry?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  rcNumber?: string;
};

export async function listVendorVehicles(): Promise<FleetVehicle[]> {
  const { data } = await api.get<ApiSuccessResponse<FleetVehicle[]>>(
    API_ENDPOINTS.vendorVehicles,
  );
  return data.data ?? [];
}

export type UpdateFleetVehicleInput = {
  type?: string;
  model?: string;
  year?: number;
  status?: FleetVehicleStatus;
  insuranceExpiry?: string;
  maintenanceNote?: string;
};

export async function createVendorVehicle(
  payload: CreateFleetVehicleInput,
): Promise<FleetVehicle> {
  const { data } = await api.post<ApiSuccessResponse<FleetVehicle>>(
    API_ENDPOINTS.vendorVehicles,
    payload,
  );
  return data.data;
}

export async function updateVendorVehicle(
  vehicleId: string,
  payload: UpdateFleetVehicleInput,
): Promise<FleetVehicle> {
  const { data } = await api.put<ApiSuccessResponse<FleetVehicle>>(
    API_ENDPOINTS.vendorVehicle(vehicleId),
    payload,
  );
  return data.data;
}

export async function removeVendorVehicle(vehicleId: string): Promise<void> {
  await api.delete(API_ENDPOINTS.vendorVehicle(vehicleId));
}
