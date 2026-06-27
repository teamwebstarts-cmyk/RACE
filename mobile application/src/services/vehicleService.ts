import { unwrapApi, api } from './api';
import type { Vehicle, VehicleInput } from '../types/vehicle';

export async function getVehicles(): Promise<Vehicle[]> {
  return unwrapApi(api.get('/api/v1/vehicles'));
}

export async function getVehicle(id: string): Promise<Vehicle> {
  return unwrapApi(api.get(`/api/v1/vehicles/${id}`));
}

export async function addVehicle(data: VehicleInput): Promise<Vehicle> {
  return unwrapApi(api.post('/api/v1/vehicles', data));
}

export async function updateVehicle(id: string, data: Partial<VehicleInput>): Promise<Vehicle> {
  return unwrapApi(api.put(`/api/v1/vehicles/${id}`, data));
}

export async function deleteVehicle(id: string): Promise<void> {
  await unwrapApi(api.delete(`/api/v1/vehicles/${id}`));
}

export async function verifyVehicle(id: string): Promise<Vehicle> {
  return unwrapApi(api.get(`/api/v1/vehicles/${id}/verify`));
}
