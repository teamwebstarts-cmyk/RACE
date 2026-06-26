import { API_ENDPOINTS } from '../../config/api';
import type { ApiSuccessResponse } from '../../types/auth';
import type { CreateVehicleRequest, UpdateVehicleRequest, Vehicle } from '../../types/vehicle';
import { apiClient } from '../api/apiClient';

export async function listVehicles(): Promise<Vehicle[]> {
  const { data } = await apiClient.get<ApiSuccessResponse<Vehicle[]>>(API_ENDPOINTS.vehicles);
  return data.data;
}

export async function getVehicle(id: string): Promise<Vehicle> {
  const { data } = await apiClient.get<ApiSuccessResponse<Vehicle>>(
    `${API_ENDPOINTS.vehicles}/${id}`,
  );
  return data.data;
}

export async function createVehicle(payload: CreateVehicleRequest): Promise<Vehicle> {
  const { data } = await apiClient.post<ApiSuccessResponse<Vehicle>>(
    API_ENDPOINTS.vehicles,
    payload,
  );
  return data.data;
}

export async function updateVehicle(id: string, payload: UpdateVehicleRequest): Promise<Vehicle> {
  const { data } = await apiClient.put<ApiSuccessResponse<Vehicle>>(
    `${API_ENDPOINTS.vehicles}/${id}`,
    payload,
  );
  return data.data;
}

export async function deleteVehicle(id: string): Promise<void> {
  await apiClient.delete(`${API_ENDPOINTS.vehicles}/${id}`);
}
