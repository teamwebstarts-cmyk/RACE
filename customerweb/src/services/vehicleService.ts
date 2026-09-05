import { API_ENDPOINTS } from '../config/api';
import type { Vehicle, VehicleInput } from '../types/models';
import { api, unwrapApi } from './api';

export async function getVehicles(): Promise<Vehicle[]> {
  return unwrapApi(api.get(API_ENDPOINTS.vehicles));
}

export async function getVehicle(id: string): Promise<Vehicle> {
  return unwrapApi(api.get(`${API_ENDPOINTS.vehicles}/${id}`));
}

export async function addVehicle(data: VehicleInput): Promise<Vehicle> {
  return unwrapApi(api.post(API_ENDPOINTS.vehicles, data));
}

export async function updateVehicle(
  id: string,
  data: Partial<VehicleInput>,
): Promise<Vehicle> {
  return unwrapApi(api.put(`${API_ENDPOINTS.vehicles}/${id}`, data));
}

export async function deleteVehicle(id: string): Promise<void> {
  await unwrapApi(api.delete(`${API_ENDPOINTS.vehicles}/${id}`));
}
